import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UsuariosService } from '../usuarios/usuarios.service';

function inicioMes(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function fimMes(): string {
  const d = new Date();
  const ultimo = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return ultimo.toISOString().slice(0, 10);
}

@Injectable()
export class RelatoriosService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly dataSource: DataSource,
  ) {}

  listarPermissoesUsuarios() {
    return this.usuariosService.listarComPermissoes();
  }

  async calcularDre(empresaId: string, dataInicio?: string, dataFim?: string) {
    const inicio = dataInicio ?? inicioMes();
    const fim = dataFim ?? fimMes();

    const [row] = await this.dataSource.query(
      `SELECT
         COALESCE(SUM(CASE WHEN tipo = 'CREDITO' THEN valor ELSE 0 END), 0) AS receitas,
         COALESCE(SUM(CASE WHEN tipo = 'DEBITO'  THEN valor ELSE 0 END), 0) AS despesas
       FROM extrato_lancamento
       WHERE empresa_id = $1
         AND status_conciliacao = 'CONCILIADO'
         AND data >= $2
         AND data <= $3`,
      [empresaId, inicio, fim],
    );

    const receitas = Number(row.receitas);
    const despesas = Number(row.despesas);
    const resultado = receitas - despesas;

    return {
      periodo: { inicio, fim },
      receitas,
      despesas,
      resultado,
      status: resultado >= 0 ? 'LUCRO' : 'PREJUIZO',
    };
  }

  async relatorioFinanceiro(empresaId: string, dataInicio?: string, dataFim?: string) {
    const inicio = dataInicio ?? inicioMes();
    const fim = dataFim ?? fimMes();

    const [row] = await this.dataSource.query(
      `SELECT
         COALESCE(SUM(CASE WHEN tipo = 'CREDITO' AND status_conciliacao = 'CONCILIADO' THEN valor ELSE 0 END), 0) AS total_receitas,
         COALESCE(SUM(CASE WHEN tipo = 'DEBITO'  AND status_conciliacao = 'CONCILIADO' THEN valor ELSE 0 END), 0) AS total_despesas,
         COUNT(CASE WHEN status_conciliacao = 'PENDENTE' THEN 1 END)::int                                       AS total_pendentes,
         COUNT(*)::int                                                                                           AS quantidade_transacoes
       FROM extrato_lancamento
       WHERE empresa_id = $1
         AND data >= $2
         AND data <= $3`,
      [empresaId, inicio, fim],
    );

    const totalReceitas = Number(row.total_receitas);
    const totalDespesas = Number(row.total_despesas);

    return {
      periodo: { inicio, fim },
      totalReceitas,
      totalDespesas,
      saldoPeriodo: totalReceitas - totalDespesas,
      totalPendentes: row.total_pendentes,
      quantidadeTransacoes: row.quantidade_transacoes,
    };
  }

  async gerarCsv(
    empresaId: string,
    tipo: 'despesas' | 'receitas' | 'geral' = 'geral',
    dataInicio?: string,
    dataFim?: string,
  ): Promise<string> {
    const inicio = dataInicio ?? inicioMes();
    const fim = dataFim ?? fimMes();

    const tipoFiltro =
      tipo === 'despesas' ? `AND el.tipo = 'DEBITO'` :
      tipo === 'receitas' ? `AND el.tipo = 'CREDITO'` : '';

    const rows = await this.dataSource.query(
      `SELECT
         el.data::text                AS data,
         el.tipo                      AS tipo,
         COALESCE(el.descricao, '')   AS descricao,
         el.valor::text               AS valor,
         cb.banco                     AS banco,
         cb.numero                    AS conta,
         el.status_conciliacao        AS status
       FROM extrato_lancamento el
       JOIN conta_bancaria cb ON cb.id = el.conta_id
       WHERE el.empresa_id = $1
         AND el.data >= $2
         AND el.data <= $3
         ${tipoFiltro}
       ORDER BY el.data DESC, el.tipo`,
      [empresaId, inicio, fim],
    );

    const header = 'Data,Tipo,Descricao,Valor,Banco,Conta,Status';
    const linhas = rows.map((r: any) => {
      const descricao = `"${String(r.descricao).replace(/"/g, '""')}"`;
      return [r.data, r.tipo, descricao, r.valor, r.banco, r.conta, r.status].join(',');
    });

    return [header, ...linhas].join('\n');
  }
}
