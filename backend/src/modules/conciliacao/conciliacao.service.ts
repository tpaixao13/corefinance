import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { Conciliacao, TipoConciliacao, StatusConciliacaoRegistro } from './conciliacao.entity';
import { ExtratoLancamento, StatusConciliacao } from '../extratos/extrato-lancamento.entity';
import { ConciliacaoManualDto } from './dto/conciliacao-manual.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AcaoAuditoria } from '../auditoria/auditoria-log.entity';

export interface ResultadoConciliacao {
  conciliados: number;
  pendentes: number;
  naoEncontrados: number;
}

@Injectable()
export class ConciliacaoService {
  constructor(
    @InjectRepository(Conciliacao)
    private readonly conciliacaoRepo: Repository<Conciliacao>,
    @InjectRepository(ExtratoLancamento)
    private readonly lancamentoRepo: Repository<ExtratoLancamento>,
    private readonly dataSource: DataSource,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  /**
   * Conciliação automática por conta.
   * Regra: mesmo valor + datas próximas (±2 dias) + tipo igual.
   */
  async executarAutomatica(
    contaId: string,
    empresaId: string,
    usuarioId: string,
  ): Promise<ResultadoConciliacao> {
    const lancamentosPendentes = await this.lancamentoRepo.find({
      where: [
        { contaId, empresaId, statusConciliacao: StatusConciliacao.PENDENTE },
        { contaId, empresaId, statusConciliacao: StatusConciliacao.NAO_ENCONTRADO },
      ],
      order: { data: 'ASC' },
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let conciliados = 0;
    let naoEncontrados = 0;

    try {
      // Reseta NAO_ENCONTRADO → PENDENTE para permitir nova tentativa
      const idsParaResetar = lancamentosPendentes
        .filter((l) => l.statusConciliacao === StatusConciliacao.NAO_ENCONTRADO)
        .map((l) => l.id);
      if (idsParaResetar.length > 0) {
        await queryRunner.manager
          .createQueryBuilder()
          .update(ExtratoLancamento)
          .set({ statusConciliacao: StatusConciliacao.PENDENTE })
          .whereInIds(idsParaResetar)
          .execute();
        lancamentosPendentes.forEach((l) => {
          if (idsParaResetar.includes(l.id)) {
            l.statusConciliacao = StatusConciliacao.PENDENTE;
          }
        });
      }

      for (const lancamento of lancamentosPendentes) {
        const dataInicio = new Date(lancamento.data);
        dataInicio.setDate(dataInicio.getDate() - 2);

        const dataFim = new Date(lancamento.data);
        dataFim.setDate(dataFim.getDate() + 2);

        // Busca lançamento correspondente: mesmo valor, mesmo tipo, data próxima
        const correspondente = await queryRunner.manager.findOne(ExtratoLancamento, {
          where: {
            contaId,
            empresaId,
            valor: lancamento.valor,
            tipo: lancamento.tipo,
            data: Between(dataInicio, dataFim),
            statusConciliacao: StatusConciliacao.PENDENTE,
          },
        });

        if (correspondente && correspondente.id !== lancamento.id) {
          // Cria registro de conciliação
          const conciliacao = queryRunner.manager.create(Conciliacao, {
            empresaId,
            contaId,
            lancamentoExtratoId: lancamento.id,
            tipo: TipoConciliacao.AUTOMATICA,
            status: StatusConciliacaoRegistro.CONCILIADO,
            usuarioId,
          });
          const conciliacaoSalva = await queryRunner.manager.save(conciliacao);

          // Atualiza status dos lançamentos
          await queryRunner.manager.update(ExtratoLancamento, lancamento.id, {
            statusConciliacao: StatusConciliacao.CONCILIADO,
            conciliacaoId: conciliacaoSalva.id,
          });
          await queryRunner.manager.update(ExtratoLancamento, correspondente.id, {
            statusConciliacao: StatusConciliacao.CONCILIADO,
            conciliacaoId: conciliacaoSalva.id,
          });

          conciliados++;
        } else {
          await queryRunner.manager.update(ExtratoLancamento, lancamento.id, {
            statusConciliacao: StatusConciliacao.NAO_ENCONTRADO,
          });
          naoEncontrados++;
        }
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    const pendentes = lancamentosPendentes.length - conciliados - naoEncontrados;

    await this.auditoriaService.registrar({
      usuarioId,
      empresaId,
      acao: AcaoAuditoria.CONCILIACAO_AUTOMATICA,
      entidade: 'conta_bancaria',
      entidadeId: contaId,
      dadosDepois: { conciliados, pendentes, naoEncontrados },
    });

    return { conciliados, pendentes, naoEncontrados };
  }

  async executarManual(
    dto: ConciliacaoManualDto,
    contaId: string,
    empresaId: string,
    usuarioId: string,
  ): Promise<Conciliacao> {
    const lancamento = await this.lancamentoRepo.findOne({
      where: { id: dto.lancamentoExtratoId, contaId, empresaId },
    });

    if (!lancamento) throw new NotFoundException('Lançamento não encontrado');

    if (lancamento.statusConciliacao === StatusConciliacao.CONCILIADO) {
      throw new BadRequestException('Lançamento já conciliado');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const conciliacao = queryRunner.manager.create(Conciliacao, {
        empresaId,
        contaId,
        lancamentoExtratoId: lancamento.id,
        tipo: TipoConciliacao.MANUAL,
        status: StatusConciliacaoRegistro.CONCILIADO,
        observacao: dto.observacao,
        usuarioId,
      });
      const conciliacaoSalva = await queryRunner.manager.save(conciliacao);

      await queryRunner.manager.update(ExtratoLancamento, lancamento.id, {
        statusConciliacao: StatusConciliacao.CONCILIADO,
        conciliacaoId: conciliacaoSalva.id,
      });

      await queryRunner.commitTransaction();

      await this.auditoriaService.registrar({
        usuarioId,
        empresaId,
        acao: AcaoAuditoria.CONCILIACAO_MANUAL,
        entidade: 'extrato_lancamento',
        entidadeId: lancamento.id,
        dadosDepois: { tipo: TipoConciliacao.MANUAL, observacao: dto.observacao },
      });

      return conciliacaoSalva;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async estornar(conciliacaoId: string, empresaId: string, usuarioId: string): Promise<void> {
    const conciliacao = await this.conciliacaoRepo.findOne({
      where: { id: conciliacaoId, empresaId },
    });

    if (!conciliacao) throw new NotFoundException('Conciliação não encontrada');
    if (conciliacao.status === StatusConciliacaoRegistro.ESTORNADO) {
      throw new BadRequestException('Conciliação já estornada');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(Conciliacao, conciliacaoId, {
        status: StatusConciliacaoRegistro.ESTORNADO,
      });

      await queryRunner.manager.update(ExtratoLancamento, conciliacao.lancamentoExtratoId, {
        statusConciliacao: StatusConciliacao.PENDENTE,
        conciliacaoId: null as unknown as string,
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    await this.auditoriaService.registrar({
      usuarioId,
      empresaId,
      acao: AcaoAuditoria.ESTORNO_CONCILIACAO,
      entidade: 'conciliacao',
      entidadeId: conciliacaoId,
    });
  }

  async listar(empresaId: string, contaId?: string, page = 1, limit = 50) {
    const where: Record<string, string> = { empresaId };
    if (contaId) where.contaId = contaId;

    const [data, total] = await this.conciliacaoRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      relations: ['lancamentoExtrato'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }
}
