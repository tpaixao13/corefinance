import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp } from 'lucide-react';
import { relatoriosFinanceiroApi } from '../api/relatoriosFinanceiro';
import { useEmpresa } from '../contexts/EmpresaContext';
import { useAuth } from '../contexts/AuthContext';
import DreResumo from '../components/DreResumo';

function periodoInicial() {
  const d = new Date();
  const ini = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  const fim = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
  return { dataInicio: ini, dataFim: fim };
}

export default function Dre() {
  const { user } = useAuth();
  const { empresaAtiva } = useEmpresa();
  const [periodo, setPeriodo] = useState(periodoInicial);

  const empresaId = user?.role !== 'SUPER_ADMIN' ? empresaAtiva?.id : undefined;

  const { data: dre, isLoading, isError, refetch } = useQuery({
    queryKey: ['dre', empresaId, periodo.dataInicio, periodo.dataFim],
    queryFn: () => relatoriosFinanceiroApi.dre({ ...periodo, empresaId }),
    enabled: !!empresaId || user?.role === 'SUPER_ADMIN',
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp size={22} className="text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">DRE — Resultado Financeiro</h2>
            <p className="text-sm text-gray-500">Baseado em lançamentos conciliados</p>
          </div>
        </div>
      </div>

      {/* Filtro de período */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">De</label>
          <input
            type="date"
            value={periodo.dataInicio}
            onChange={(e) => setPeriodo((p) => ({ ...p, dataInicio: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Até</label>
          <input
            type="date"
            value={periodo.dataFim}
            onChange={(e) => setPeriodo((p) => ({ ...p, dataFim: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Calcular
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-16 text-gray-400 text-sm">Calculando DRE...</div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          Erro ao calcular DRE. Verifique se há lançamentos conciliados no período.
        </div>
      )}

      {dre && <DreResumo dre={dre} />}

      {dre && dre.receitas === 0 && dre.despesas === 0 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-4 py-3 text-sm">
          Nenhum lançamento conciliado encontrado neste período. Verifique se a conciliação foi executada.
        </div>
      )}
    </div>
  );
}
