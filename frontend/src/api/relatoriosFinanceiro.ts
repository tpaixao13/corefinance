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

  exportarXlsx: async (params: RelatorioParams & { tipo?: string }) => {
    const response = await api.get('/relatorios/exportar-xlsx', {
      params,
      responseType: 'blob',
    });
    const tipo = params.tipo ?? 'geral';
    const data = new Date().toISOString().slice(0, 10);
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${tipo}-${data}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 150);
  },

  exportar: async (params: RelatorioParams & { tipo?: string }) => {
    const response = await api.get('/relatorios/exportar', {
      params,
      responseType: 'blob',
    });

    // Se o backend retornou JSON de erro dentro do blob, lança exceção legível
    const contentType = String(response.headers?.['content-type'] ?? '');
    if (contentType.includes('application/json')) {
      const text = await (response.data as Blob).text();
      throw new Error(JSON.parse(text)?.message ?? 'Erro ao exportar');
    }

    const tipo = params.tipo ?? 'geral';
    const data = new Date().toISOString().slice(0, 10);
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${tipo}-${data}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 150);
  },
};
