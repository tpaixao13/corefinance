import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThanOrEqual } from 'typeorm';
import { Conciliacao, TipoConciliacao, StatusConciliacaoRegistro } from './conciliacao.entity';
import { ExtratoLancamento, StatusConciliacao } from '../extratos/extrato-lancamento.entity';
import { ContaPagar, StatusContaPagar } from '../contas-pagar/conta-pagar.entity';
import { ContaReceber, StatusContaReceber } from '../contas-receber/conta-receber.entity';
import { ConciliacaoManualDto } from './dto/conciliacao-manual.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AcaoAuditoria } from '../auditoria/auditoria-log.entity';

export interface ResultadoConciliacao {
  conciliados: number;
  pendentes: number;
  naoEncontrados: number;
}

export interface MatchProposto {
  lancamentoId: string;
  lancamentoData: string;
  lancamentoDescricao: string | null;
  lancamentoValor: number;
  lancamentoTipo: string;
  tipo: 'PAGAR' | 'RECEBER';
  contaErpId: string;
  contaErpDescricao: string;
  contaErpValor: number;
  contaErpData: string;
  contaErpFornecedorOuCliente: string | null;
}

export interface PreviewAutomaticaResult {
  matches: MatchProposto[];
  naoEncontrados: number;
}

export interface ConfirmarMatchDto {
  lancamentoId: string;
  contaErpId: string;
  tipo: 'PAGAR' | 'RECEBER';
}

function toDateStr(d: Date | string): string {
  if (d instanceof Date) return d.toISOString().split('T')[0];
  return String(d).split('T')[0];
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// Ordena contas pelo menor delta em relação à data da transação.
// Contas vencidas (no passado) e com vencimento próximo têm prioridade.
function maisProxima<T extends { dataVencimento?: string; dataRecebimento?: string }>(
  contas: T[],
  dataTransacao: string,
  campo: 'dataVencimento' | 'dataRecebimento',
): T[] {
  const ref = new Date(dataTransacao + 'T00:00:00').getTime();
  return [...contas].sort((a, b) => {
    const da = Math.abs(new Date((a[campo] as string) + 'T00:00:00').getTime() - ref);
    const db = Math.abs(new Date((b[campo] as string) + 'T00:00:00').getTime() - ref);
    return da - db;
  });
}

@Injectable()
export class ConciliacaoService {
  constructor(
    @InjectRepository(Conciliacao)
    private readonly conciliacaoRepo: Repository<Conciliacao>,
    @InjectRepository(ExtratoLancamento)
    private readonly lancamentoRepo: Repository<ExtratoLancamento>,
    @InjectRepository(ContaPagar)
    private readonly contaPagarRepo: Repository<ContaPagar>,
    @InjectRepository(ContaReceber)
    private readonly contaReceberRepo: Repository<ContaReceber>,
    private readonly dataSource: DataSource,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  /**
   * Conciliação automática por conta.
   * CRÉDITO no extrato → busca Conta a Receber com mesmo valor e data ±5 dias.
   * DÉBITO no extrato  → busca Conta a Pagar com mesmo valor e data ±5 dias.
   */
  async executarAutomatica(
    contaId: string,
    empresaId: string,
    usuarioId: string,
  ): Promise<ResultadoConciliacao> {
    const lancamentos = await this.lancamentoRepo.find({
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
      for (const lancamento of lancamentos) {
        const dataStr = toDateStr(lancamento.data as unknown as Date | string);
        const limiteF = shiftDate(dataStr, 30);
        const valor = Number(lancamento.valor);

        let conciliacaoId: string | null = null;

        if (lancamento.tipo === 'CREDITO') {
          const crs = await queryRunner.manager.find(ContaReceber, {
            where: {
              empresaId,
              valor: valor as any,
              status: StatusContaReceber.ABERTA,
              dataRecebimento: LessThanOrEqual(limiteF) as any,
            },
          });
          const cr = maisProxima(crs, dataStr, 'dataRecebimento')[0];
          if (cr) {
            const conc = queryRunner.manager.create(Conciliacao, {
              empresaId,
              contaId,
              lancamentoExtratoId: lancamento.id,
              tipo: TipoConciliacao.AUTOMATICA,
              status: StatusConciliacaoRegistro.CONCILIADO,
              observacao: `Conta a Receber: ${cr.descricao}`,
              usuarioId,
            });
            const saved = await queryRunner.manager.save(conc);
            conciliacaoId = saved.id;
            await queryRunner.manager.update(ContaReceber, cr.id, {
              status: StatusContaReceber.RECEBIDA,
            });
            conciliados++;
          }
        } else {
          const cps = await queryRunner.manager.find(ContaPagar, {
            where: {
              empresaId,
              valor: valor as any,
              status: StatusContaPagar.ABERTA,
              dataVencimento: LessThanOrEqual(limiteF) as any,
            },
          });
          const cp = maisProxima(cps, dataStr, 'dataVencimento')[0];
          if (cp) {
            const conc = queryRunner.manager.create(Conciliacao, {
              empresaId,
              contaId,
              lancamentoExtratoId: lancamento.id,
              tipo: TipoConciliacao.AUTOMATICA,
              status: StatusConciliacaoRegistro.CONCILIADO,
              observacao: `Conta a Pagar: ${cp.descricao}`,
              usuarioId,
            });
            const saved = await queryRunner.manager.save(conc);
            conciliacaoId = saved.id;
            await queryRunner.manager.update(ContaPagar, cp.id, {
              status: StatusContaPagar.PAGA,
            });
            conciliados++;
          }
        }

        if (conciliacaoId) {
          await queryRunner.manager.update(ExtratoLancamento, lancamento.id, {
            statusConciliacao: StatusConciliacao.CONCILIADO,
            conciliacaoId,
          });
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

    const pendentes = lancamentos.length - conciliados - naoEncontrados;

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

  async previewAutomatica(
    contaId: string,
    empresaId: string,
  ): Promise<PreviewAutomaticaResult> {
    const lancamentos = await this.lancamentoRepo.find({
      where: [
        { contaId, empresaId, statusConciliacao: StatusConciliacao.PENDENTE },
        { contaId, empresaId, statusConciliacao: StatusConciliacao.NAO_ENCONTRADO },
      ],
      order: { data: 'ASC' },
    });

    const matches: MatchProposto[] = [];
    let naoEncontrados = 0;
    const usedContaErpIds = new Set<string>();

    for (const lancamento of lancamentos) {
      const dataStr = toDateStr(lancamento.data as unknown as Date | string);
      const valor = Number(lancamento.valor);
      const dataInicio = shiftDate(dataStr, -5);
      const dataFim = shiftDate(dataStr, 5);

      let matched = false;

      // Limite futuro: até 30 dias após a transação (evita casar contas futuras distantes)
      const limiteF = shiftDate(dataStr, 30);

      if (lancamento.tipo === 'CREDITO') {
        const crs = await this.contaReceberRepo.find({
          where: {
            empresaId,
            valor: valor as any,
            status: StatusContaReceber.ABERTA,
            dataRecebimento: LessThanOrEqual(limiteF) as any,
          },
        });
        const cr = maisProxima(crs, dataStr, 'dataRecebimento').find(
          (c) => !usedContaErpIds.has(c.id),
        );
        if (cr) {
          usedContaErpIds.add(cr.id);
          matches.push({
            lancamentoId: lancamento.id,
            lancamentoData: dataStr,
            lancamentoDescricao: lancamento.descricao,
            lancamentoValor: valor,
            lancamentoTipo: lancamento.tipo,
            tipo: 'RECEBER',
            contaErpId: cr.id,
            contaErpDescricao: cr.descricao,
            contaErpValor: Number(cr.valor),
            contaErpData: cr.dataRecebimento,
            contaErpFornecedorOuCliente: cr.cliente,
          });
          matched = true;
        }
      } else {
        const cps = await this.contaPagarRepo.find({
          where: {
            empresaId,
            valor: valor as any,
            status: StatusContaPagar.ABERTA,
            dataVencimento: LessThanOrEqual(limiteF) as any,
          },
        });
        const cp = maisProxima(cps, dataStr, 'dataVencimento').find(
          (c) => !usedContaErpIds.has(c.id),
        );
        if (cp) {
          usedContaErpIds.add(cp.id);
          matches.push({
            lancamentoId: lancamento.id,
            lancamentoData: dataStr,
            lancamentoDescricao: lancamento.descricao,
            lancamentoValor: valor,
            lancamentoTipo: lancamento.tipo,
            tipo: 'PAGAR',
            contaErpId: cp.id,
            contaErpDescricao: cp.descricao,
            contaErpValor: Number(cp.valor),
            contaErpData: cp.dataVencimento,
            contaErpFornecedorOuCliente: cp.fornecedor,
          });
          matched = true;
        }
      }

      if (!matched) naoEncontrados++;
    }

    return { matches, naoEncontrados };
  }

  async confirmarAutomatica(
    matchesSelecionados: ConfirmarMatchDto[],
    contaId: string,
    empresaId: string,
    usuarioId: string,
  ): Promise<ResultadoConciliacao> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let conciliados = 0;
    let naoEncontrados = 0;

    try {
      for (const m of matchesSelecionados) {
        const lancamento = await queryRunner.manager.findOne(ExtratoLancamento, {
          where: { id: m.lancamentoId, contaId, empresaId },
        });
        if (!lancamento) continue;

        let descricaoConta = '';

        if (m.tipo === 'RECEBER') {
          const cr = await queryRunner.manager.findOne(ContaReceber, {
            where: { id: m.contaErpId, empresaId, status: StatusContaReceber.ABERTA },
          });
          if (!cr) { naoEncontrados++; continue; }
          await queryRunner.manager.update(ContaReceber, cr.id, { status: StatusContaReceber.RECEBIDA });
          descricaoConta = `Conta a Receber: ${cr.descricao}`;
        } else {
          const cp = await queryRunner.manager.findOne(ContaPagar, {
            where: { id: m.contaErpId, empresaId, status: StatusContaPagar.ABERTA },
          });
          if (!cp) { naoEncontrados++; continue; }
          await queryRunner.manager.update(ContaPagar, cp.id, { status: StatusContaPagar.PAGA });
          descricaoConta = `Conta a Pagar: ${cp.descricao}`;
        }

        const conc = queryRunner.manager.create(Conciliacao, {
          empresaId,
          contaId,
          lancamentoExtratoId: lancamento.id,
          tipo: TipoConciliacao.AUTOMATICA,
          status: StatusConciliacaoRegistro.CONCILIADO,
          observacao: descricaoConta,
          usuarioId,
        });
        const saved = await queryRunner.manager.save(conc);

        await queryRunner.manager.update(ExtratoLancamento, lancamento.id, {
          statusConciliacao: StatusConciliacao.CONCILIADO,
          conciliacaoId: saved.id,
        });
        conciliados++;
      }

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
      acao: AcaoAuditoria.CONCILIACAO_AUTOMATICA,
      entidade: 'conta_bancaria',
      entidadeId: contaId,
      dadosDepois: { conciliados, naoEncontrados },
    });

    return { conciliados, pendentes: 0, naoEncontrados };
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
