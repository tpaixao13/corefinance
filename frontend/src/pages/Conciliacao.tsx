import { useState, useEffect } from 'react';
import { GitMerge, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { contasApi } from '../api/contas';
import { usePendentes } from '../hooks/useConciliacao';
import { useAuth } from '../contexts/AuthContext';
import ConciliacaoFiltro, { type FiltrosConciliacao } from '../components/ConciliacaoFiltro';
import ConciliacaoTable from '../components/ConciliacaoTable';
import ConciliacaoActions from '../components/ConciliacaoActions';
import type { ContaBancaria } from '../types';

const LIMIT = 50;

const FILTROS_VAZIOS = { dataInicio: '', dataFim: '', tipo: '' as const };

export default function Conciliacao() {
  const { isAuthenticated, user } = useAuth();
  const [page, setPage] = useState(1);
  const [filtros, setFiltros] = useState<FiltrosConciliacao>({
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

  const { data, isLoading, isError } = usePendentes(filtros.contaId, page);

  const contaAtiva = contas?.find((c) => c.id === filtros.contaId);

  const pendentes = (data?.data ?? []).filter((l) => {
    if (l.statusConciliacao === 'CONCILIADO') return false;
    if (filtros.tipo && l.tipo !== filtros.tipo) return false;
    if (filtros.dataInicio && l.data < filtros.dataInicio) return false;
    if (filtros.dataFim && l.data > filtros.dataFim) return false;
    return true;
  });

  const totalPaginas = Math.ceil((data?.total ?? 0) / LIMIT);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <GitMerge size={22} className="text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Conciliação</h2>
          {pendentes.filter(l => l.statusConciliacao === 'PENDENTE').length > 0 && (
            <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {pendentes.filter(l => l.statusConciliacao === 'PENDENTE').length} pendentes
            </span>
          )}
          {pendentes.filter(l => l.statusConciliacao === 'NAO_ENCONTRADO').length > 0 && (
            <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {pendentes.filter(l => l.statusConciliacao === 'NAO_ENCONTRADO').length} não encontrados
            </span>
          )}
        </div>

        {filtros.contaId && (
          <ConciliacaoActions
            contaId={filtros.contaId}
            totalPendentes={pendentes.filter(l => l.statusConciliacao === 'PENDENTE').length}
          />
        )}
      </div>

      {contas && contas.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg p-4 text-sm">
          Nenhuma conta bancária cadastrada.
        </div>
      )}

      {contas && contas.length > 0 && (
        <ConciliacaoFiltro
          filtros={filtros}
          contas={contas}
          onChange={(f) => { setFiltros(f); setPage(1); }}
          onLimpar={() => setFiltros((f) => ({ contaId: f.contaId, ...FILTROS_VAZIOS }))}
        />
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {isLoading && (
          <div className="text-center py-16 text-gray-400 text-sm">
            Carregando lançamentos...
          </div>
        )}

        {isError && (
          <div className="text-center py-16 text-red-500 text-sm">
            Erro ao carregar lançamentos. Tente novamente.
          </div>
        )}

        {!isLoading && !isError && (
          <ConciliacaoTable
            pendentes={pendentes}
            contaId={filtros.contaId}
            banco={contaAtiva ? `${contaAtiva.banco} — ${contaAtiva.numero}` : ''}
            canVincularErp={user?.role === 'ADMIN_EMPRESA'}
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
              <ChevronLeft size={14} /> Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPaginas, p + 1))}
              disabled={page === totalPaginas}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Próxima <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
