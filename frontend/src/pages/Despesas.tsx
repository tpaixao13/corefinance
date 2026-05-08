import { useState, useEffect } from 'react';
import { TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { contasApi } from '../api/contas';
import { useDespesas } from '../hooks/useDespesas';
import { useAuth } from '../contexts/AuthContext';
import DespesasFiltro, { type FiltrosDespesa } from '../components/DespesasFiltro';
import DespesasTable from '../components/DespesasTable';
import type { ContaBancaria } from '../types';

const LIMIT = 50;

const FILTROS_VAZIOS: Omit<FiltrosDespesa, 'contaId'> = {
  dataInicio: '',
  dataFim: '',
  status: '',
};

export default function Despesas() {
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const [filtros, setFiltros] = useState<FiltrosDespesa>({
    contaId: '',
    ...FILTROS_VAZIOS,
  });

  const { data: contas } = useQuery<ContaBancaria[]>({
    queryKey: ['contas'],
    queryFn: contasApi.listar,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (contas && contas.length > 0 && !filtros.contaId) {
      setFiltros((f) => ({ ...f, contaId: contas[0].id }));
    }
  }, [contas, filtros.contaId]);

  const { data, isLoading, isError } = useDespesas(filtros.contaId, page, LIMIT);

  const contaAtiva = contas?.find((c) => c.id === filtros.contaId);

  const despesas = (data?.data ?? []).filter((l) => {
    if (l.tipo !== 'DEBITO') return false;
    if (filtros.status && l.statusConciliacao !== filtros.status) return false;
    if (filtros.dataInicio && l.data < filtros.dataInicio) return false;
    if (filtros.dataFim && l.data > filtros.dataFim) return false;
    return true;
  });

  const totalPaginas = Math.ceil((data?.total ?? 0) / LIMIT);

  const brl = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const totalDespesas = despesas.reduce((acc, d) => acc + Number(d.valor), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingDown size={22} className="text-red-500" />
          <h2 className="text-2xl font-bold text-gray-800">Despesas</h2>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total filtrado</p>
          <p className="text-xl font-bold text-red-600">{brl(totalDespesas)}</p>
        </div>
      </div>

      {contas && contas.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg p-4 text-sm">
          Nenhuma conta bancária cadastrada.
        </div>
      )}

      {contas && contas.length > 0 && (
        <DespesasFiltro
          filtros={filtros}
          contas={contas}
          onChange={(f) => { setFiltros(f); setPage(1); }}
          onLimpar={() => setFiltros((f) => ({ contaId: f.contaId, ...FILTROS_VAZIOS }))}
        />
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {isLoading && (
          <div className="text-center py-16 text-gray-400 text-sm">
            Carregando despesas...
          </div>
        )}

        {isError && (
          <div className="text-center py-16 text-red-500 text-sm">
            Erro ao carregar despesas. Tente novamente.
          </div>
        )}

        {!isLoading && !isError && (
          <DespesasTable
            despesas={despesas}
            banco={contaAtiva ? `${contaAtiva.banco} — ${contaAtiva.numero}` : ''}
          />
        )}
      </div>

      {totalPaginas > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Página {page} de {totalPaginas}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
              Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPaginas, p + 1))}
              disabled={page === totalPaginas}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Próxima
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
