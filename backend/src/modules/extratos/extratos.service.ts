import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as crypto from 'crypto';
import { ExtratoImportacao, FormatoExtrato } from './extrato-importacao.entity';
import { ExtratoLancamento } from './extrato-lancamento.entity';
import { ContaBancaria } from '../contas-bancarias/conta-bancaria.entity';
import { OfxParser } from './parsers/ofx.parser';
import { CsvParser } from './parsers/csv.parser';
import { XlsxParser } from './parsers/xlsx.parser';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AcaoAuditoria } from '../auditoria/auditoria-log.entity';

@Injectable()
export class ExtratosService {
  constructor(
    @InjectRepository(ExtratoImportacao)
    private readonly importacaoRepo: Repository<ExtratoImportacao>,
    @InjectRepository(ExtratoLancamento)
    private readonly lancamentoRepo: Repository<ExtratoLancamento>,
    @InjectRepository(ContaBancaria)
    private readonly contaRepo: Repository<ContaBancaria>,
    private readonly dataSource: DataSource,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async importar(
    contaId: string,
    empresaId: string,
    usuarioId: string,
    arquivo: Express.Multer.File,
  ): Promise<ExtratoImportacao> {
    const conta = await this.contaRepo.findOne({ where: { id: contaId, empresaId } });
    if (!conta) throw new NotFoundException('Conta bancária não encontrada');

    // Verificação de duplicidade via SHA256
    const hashArquivo = crypto.createHash('sha256').update(arquivo.buffer).digest('hex');
    const duplicado = await this.importacaoRepo.findOne({ where: { hashArquivo } });
    if (duplicado) {
      throw new ConflictException(
        `Extrato já foi importado em ${duplicado.dataImportacao.toLocaleDateString('pt-BR')}`,
      );
    }

    const formato = this.detectarFormato(arquivo.originalname, arquivo.mimetype);
    const resultado = this.parsearArquivo(arquivo, formato);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const importacao = queryRunner.manager.create(ExtratoImportacao, {
        empresaId,
        contaId,
        usuarioId,
        nomeArquivo: arquivo.originalname,
        formato,
        hashArquivo,
        periodoInicio: resultado.periodoInicio,
        periodoFim: resultado.periodoFim,
        totalLancamentos: resultado.lancamentos.length,
      });
      const importacaoSalva = await queryRunner.manager.save(importacao);

      const lancamentos = resultado.lancamentos.map((l) =>
        queryRunner.manager.create(ExtratoLancamento, {
          empresaId,
          contaId,
          importacaoId: importacaoSalva.id,
          idExterno: l.idExterno,
          data: l.data,
          valor: l.valor,
          tipo: l.tipo,
          descricao: l.descricao,
          saldoExtrato: l.saldoExtrato,
        }),
      );

      await queryRunner.manager.save(lancamentos);

      // Recalcula saldo via SQL direto (ACID garantido dentro da transação)
      await queryRunner.manager.query(
        `UPDATE conta_bancaria SET saldo_atual = (
          SELECT saldo_inicial +
            COALESCE(SUM(CASE WHEN tipo = 'CREDITO' THEN valor ELSE -valor END), 0)
          FROM extrato_lancamento WHERE conta_id = $1
        ) WHERE id = $1`,
        [contaId],
      );

      await queryRunner.commitTransaction();

      await this.auditoriaService.registrar({
        usuarioId,
        empresaId,
        acao: AcaoAuditoria.IMPORTACAO_EXTRATO,
        entidade: 'extrato_importacao',
        entidadeId: importacaoSalva.id,
        dadosDepois: {
          nomeArquivo: arquivo.originalname,
          formato,
          totalLancamentos: resultado.lancamentos.length,
          periodoInicio: resultado.periodoInicio,
          periodoFim: resultado.periodoFim,
        },
      });

      return importacaoSalva;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async listarImportacoes(empresaId: string, contaId?: string) {
    const where: Record<string, string> = { empresaId };
    if (contaId) where.contaId = contaId;
    return this.importacaoRepo.find({
      where,
      order: { dataImportacao: 'DESC' },
      relations: ['conta', 'usuario'],
    });
  }

  async listarLancamentos(
    empresaId: string,
    contaId: string,
    page = 1,
    limit = 50,
  ) {
    const [data, total] = await this.lancamentoRepo.findAndCount({
      where: { empresaId, contaId },
      order: { data: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  private detectarFormato(nomeArquivo: string, mimetype: string): FormatoExtrato {
    const ext = nomeArquivo.split('.').pop()?.toLowerCase();

    if (ext === 'ofx' || ext === 'qfx') return FormatoExtrato.OFX;
    if (ext === 'csv' || mimetype === 'text/csv') return FormatoExtrato.CSV;
    if (
      ext === 'xlsx' ||
      ext === 'xls' ||
      mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      return FormatoExtrato.XLSX;
    }

    throw new BadRequestException('Formato de arquivo não suportado. Use OFX, CSV ou XLSX.');
  }

  private parsearArquivo(arquivo: Express.Multer.File, formato: FormatoExtrato) {
    switch (formato) {
      case FormatoExtrato.OFX: {
        const conteudo = arquivo.buffer.toString('utf-8');
        return new OfxParser().parse(conteudo);
      }
      case FormatoExtrato.CSV: {
        const conteudo = arquivo.buffer.toString('utf-8');
        return new CsvParser().parse(conteudo);
      }
      case FormatoExtrato.XLSX:
        return new XlsxParser().parse(arquivo.buffer);
      default:
        throw new BadRequestException('Formato não suportado');
    }
  }
}
