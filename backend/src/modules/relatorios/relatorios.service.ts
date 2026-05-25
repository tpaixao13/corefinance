import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as XLSX from 'xlsx';
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

    const tipoParam =
      tipo === 'despesas' ? 'DEBITO' :
      tipo === 'receitas' ? 'CREDITO' : null;

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
         AND ($4::text IS NULL OR el.tipo::text = $4)
       ORDER BY el.data DESC, el.tipo`,
      [empresaId, inicio, fim, tipoParam],
    );

    const header = 'Data,Tipo,Descricao,Valor,Banco,Conta,Status';
    const linhas = rows.map((r: any) => {
      const descricao = `"${String(r.descricao).replace(/"/g, '""')}"`;
      return [r.data, r.tipo, descricao, r.valor, r.banco, r.conta, r.status].join(',');
    });

    return [header, ...linhas].join('\n');
  }

  private async buscarLancamentos(
    empresaId: string,
    tipo: 'despesas' | 'receitas' | 'geral',
    dataInicio?: string,
    dataFim?: string,
  ) {
    const inicio = dataInicio ?? this.inicioMes();
    const fim = dataFim ?? this.fimMes();
    const tipoParam =
      tipo === 'despesas' ? 'DEBITO' :
      tipo === 'receitas' ? 'CREDITO' : null;

    return this.dataSource.query(
      `SELECT
         el.data::text                AS data,
         el.tipo                      AS tipo,
         COALESCE(el.descricao, '')   AS descricao,
         el.valor::numeric(15,2)      AS valor,
         cb.banco                     AS banco,
         cb.agencia                   AS agencia,
         cb.numero                    AS conta,
         el.status_conciliacao        AS status
       FROM extrato_lancamento el
       JOIN conta_bancaria cb ON cb.id = el.conta_id
       WHERE el.empresa_id = $1
         AND el.data >= $2
         AND el.data <= $3
         AND ($4::text IS NULL OR el.tipo::text = $4)
       ORDER BY el.data DESC, el.tipo`,
      [empresaId, inicio, fim, tipoParam],
    );
  }

  private inicioMes(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }

  private fimMes(): string {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
  }

  async gerarXlsx(
    empresaId: string,
    tipo: 'despesas' | 'receitas' | 'geral' = 'geral',
    dataInicio?: string,
    dataFim?: string,
  ): Promise<Buffer> {
    const rows = await this.buscarLancamentos(empresaId, tipo, dataInicio, dataFim);

    const STATUS_LABEL: Record<string, string> = {
      CONCILIADO: 'Conciliado',
      PENDENTE: 'Pendente',
      NAO_ENCONTRADO: 'Não encontrado',
    };

    const dados = rows.map((r: any) => ({
      'Data': r.data,
      'Tipo': r.tipo === 'CREDITO' ? 'Crédito' : 'Débito',
      'Descrição': r.descricao,
      'Valor (R$)': Number(r.valor),
      'Banco': r.banco,
      'Agência': r.agencia,
      'Conta': r.conta,
      'Status': STATUS_LABEL[r.status] ?? r.status,
    }));

    const ws = XLSX.utils.json_to_sheet(dados);

    // Largura das colunas
    ws['!cols'] = [
      { wch: 12 }, // Data
      { wch: 10 }, // Tipo
      { wch: 40 }, // Descrição
      { wch: 14 }, // Valor
      { wch: 20 }, // Banco
      { wch: 10 }, // Agência
      { wch: 14 }, // Conta
      { wch: 16 }, // Status
    ];

    const wb = XLSX.utils.book_new();
    const sheetName = tipo === 'despesas' ? 'Despesas' : tipo === 'receitas' ? 'Receitas' : 'Lançamentos';
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }
}
