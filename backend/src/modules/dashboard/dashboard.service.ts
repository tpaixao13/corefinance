import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ContaBancaria } from '../contas-bancarias/conta-bancaria.entity';
import { ExtratoLancamento, TipoLancamento, StatusConciliacao } from '../extratos/extrato-lancamento.entity';

export interface ResumoContaPeriodo {
  contaId: string;
  banco: string;
  agencia: string;
  numero: string;
  saldoInicial: number;
  saldoAtual: number;
  totalEntradas: number;
  totalSaidas: number;
  saldoCalculado: number;
  diferenca: number;
  totalConciliados: number;
  totalPendentes: number;
  totalNaoEncontrados: number;
}

export interface ResumoEmpresa {
  empresaId: string;
  totalContas: number;
  saldoTotal: number;
  totalEntradas: number;
  totalSaidas: number;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(ContaBancaria)
    private readonly contaRepo: Repository<ContaBancaria>,
    @InjectRepository(ExtratoLancamento)
    private readonly lancamentoRepo: Repository<ExtratoLancamento>,
    private readonly dataSource: DataSource,
  ) {}

  async resumoPorConta(
    contaId: string,
    empresaId: string,
    dataInicio?: Date,
    dataFim?: Date,
  ): Promise<ResumoContaPeriodo | null> {
    const conta = await this.contaRepo.findOne({ where: { id: contaId, empresaId } });
    if (!conta) return null;

    const query = this.lancamentoRepo.createQueryBuilder('l').where(
      'l.conta_id = :contaId AND l.empresa_id = :empresaId',
      { contaId, empresaId },
    );

    if (dataInicio) query.andWhere('l.data >= :dataInicio', { dataInicio });
    if (dataFim) query.andWhere('l.data <= :dataFim', { dataFim });

    const [resultado] = await query
      .select([
        `COALESCE(SUM(CASE WHEN l.tipo = 'CREDITO' THEN l.valor ELSE 0 END), 0) as total_entradas`,
        `COALESCE(SUM(CASE WHEN l.tipo = 'DEBITO' THEN l.valor ELSE 0 END), 0) as total_saidas`,
        `COUNT(CASE WHEN l.status_conciliacao = 'CONCILIADO' THEN 1 END) as total_conciliados`,
        `COUNT(CASE WHEN l.status_conciliacao = 'PENDENTE' THEN 1 END) as total_pendentes`,
        `COUNT(CASE WHEN l.status_conciliacao = 'NAO_ENCONTRADO' THEN 1 END) as total_nao_encontrados`,
      ])
      .getRawMany();

    const totalEntradas = Number(resultado?.total_entradas ?? 0);
    const totalSaidas = Number(resultado?.total_saidas ?? 0);
    const saldoCalculado = Number(conta.saldoInicial) + totalEntradas - totalSaidas;
    const diferenca = saldoCalculado - Number(conta.saldoAtual);

    if (Math.abs(diferenca) > 0.01) {
      // Diferença detectada — registramos no objeto para alerta no frontend
    }

    return {
      contaId: conta.id,
      banco: conta.banco,
      agencia: conta.agencia,
      numero: conta.numero,
      saldoInicial: Number(conta.saldoInicial),
      saldoAtual: Number(conta.saldoAtual),
      totalEntradas,
      totalSaidas,
      saldoCalculado,
      diferenca,
      totalConciliados: Number(resultado?.total_conciliados ?? 0),
      totalPendentes: Number(resultado?.total_pendentes ?? 0),
      totalNaoEncontrados: Number(resultado?.total_nao_encontrados ?? 0),
    };
  }

  async resumoPorEmpresa(empresaId: string): Promise<ResumoEmpresa> {
    const [resultado] = await this.dataSource.query(
      `SELECT
        COUNT(DISTINCT cb.id) as total_contas,
        COALESCE(SUM(cb.saldo_atual), 0) as saldo_total,
        COALESCE(SUM(CASE WHEN el.tipo = 'CREDITO' THEN el.valor ELSE 0 END), 0) as total_entradas,
        COALESCE(SUM(CASE WHEN el.tipo = 'DEBITO' THEN el.valor ELSE 0 END), 0) as total_saidas
      FROM conta_bancaria cb
      LEFT JOIN extrato_lancamento el ON el.conta_id = cb.id AND el.empresa_id = cb.empresa_id
      WHERE cb.empresa_id = $1 AND cb.ativo = true`,
      [empresaId],
    );

    return {
      empresaId,
      totalContas: Number(resultado?.total_contas ?? 0),
      saldoTotal: Number(resultado?.saldo_total ?? 0),
      totalEntradas: Number(resultado?.total_entradas ?? 0),
      totalSaidas: Number(resultado?.total_saidas ?? 0),
    };
  }

  async resumoTodasEmpresas(): Promise<ResumoEmpresa[]> {
    const resultados = await this.dataSource.query(
      `SELECT
        cb.empresa_id,
        COUNT(DISTINCT cb.id) as total_contas,
        COALESCE(SUM(cb.saldo_atual), 0) as saldo_total,
        COALESCE(SUM(CASE WHEN el.tipo = 'CREDITO' THEN el.valor ELSE 0 END), 0) as total_entradas,
        COALESCE(SUM(CASE WHEN el.tipo = 'DEBITO' THEN el.valor ELSE 0 END), 0) as total_saidas
      FROM conta_bancaria cb
      LEFT JOIN extrato_lancamento el ON el.conta_id = cb.id
      WHERE cb.ativo = true
      GROUP BY cb.empresa_id`,
    );

    return resultados.map((r) => ({
      empresaId: r.empresa_id,
      totalContas: Number(r.total_contas),
      saldoTotal: Number(r.saldo_total),
      totalEntradas: Number(r.total_entradas),
      totalSaidas: Number(r.total_saidas),
    }));
  }

  async evolucaoSaldo(contaId: string, empresaId: string, meses = 6) {
    return this.dataSource.query(
      `SELECT
        DATE_TRUNC('month', data) as mes,
        SUM(CASE WHEN tipo = 'CREDITO' THEN valor ELSE 0 END) as entradas,
        SUM(CASE WHEN tipo = 'DEBITO' THEN valor ELSE 0 END) as saidas
      FROM extrato_lancamento
      WHERE conta_id = $1 AND empresa_id = $2
        AND data >= NOW() - INTERVAL '${meses} months'
      GROUP BY DATE_TRUNC('month', data)
      ORDER BY mes ASC`,
      [contaId, empresaId],
    );
  }
}
