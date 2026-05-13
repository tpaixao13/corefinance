import { api } from './client';

export interface DreResult {
  periodo: { inicio: string; fim: string };
  receitas: number;
  despesas: number;
  resultado: number;
  status: 'LUCRO' | 'PREJUIZO';
}

export interface FinanceiroResult {
  periodo: { inicio: string; fim: string };
  totalReceitas: number;
  totalDespesas: number;
  saldoPeriodo: number;
  totalPendentes: number;
  quantidadeTransacoes: number;
}

export interface RelatorioParams {
  dataInicio?: string;
  dataFim?: string;
  empresaId?: string;
}

export const relatoriosFinanceiroApi = {
  dre: (params: RelatorioParams) =>
    api.get<DreResult>('/relatorios/dre', { params }).then((r) => r.data),

  financeiro: (params: RelatorioParams) =>
    api.get<FinanceiroResult>('/relatorios/financeiro', { params }).then((r) => r.data),

  exportar: async (params: RelatorioParams & { tipo?: string }) => {
    const response = await api.get('/relatorios/exportar', {
      params,
      responseType: 'blob',
    });
    const tipo = params.tipo ?? 'geral';
    const data = new Date().toISOString().slice(0, 10);
    const url = URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${tipo}-${data}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
