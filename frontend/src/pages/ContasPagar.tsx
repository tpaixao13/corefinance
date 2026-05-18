import { useState } from 'react';
import { Receipt, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useContasPagar } from '../hooks/useContasPagar';
import { usePermissoesCtx } from '../contexts/PermissoesContext';
import ContasPagarTable from '../components/ContasPagarTable';
import ContaPagarForm from '../components/ContaPagarForm';
import AcessoNegado from '../components/AcessoNegado';
import type { ContaPagar } from '../types';

const LIMIT = 50;

export default function ContasPagar() {
  const { temPermissao, isLoading: permLoading } = usePermissoesCtx();

  if (!permLoading && !temPermissao('CONTAS_PAGAR_VIEW')) return <AcessoNegado />;
  const [searchParams] = useSearchParams();
  const statusFiltro = searchParams.get('status') ?? undefined;
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<ContaPagar | undefined>();

  const { data, isLoading, isError } = useContasPagar(page, LIMIT, statusFiltro);

  const canCreate = temPermissao('CONTAS_PAGAR_CREATE');
  const canEdit = temPermissao('CONTAS_PAGAR_EDIT');

  const contas = data?.data ?? [];
  const totalPaginas = Math.ceil((data?.total ?? 0) / LIMIT);

  const brl = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const totalAberto = contas
    .filter((c) => c.status === 'ABERTA')
    .reduce((acc, c) => acc + c.valor, 0);

  function handleEdit(conta: ContaPagar) {
    setEditTarget(conta);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditTarget(undefined);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Receipt size={22} className="text-orange-500" />
          <h2 className="text-2xl font-bold text-gray-800">Contas a Pagar</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500">Total em aberto</p>
            <p className="text-xl font-bold text-orange-600">{brl(totalAberto)}</p>
          </div>

          {canCreate && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus size={16} />
              Nova Conta a Pagar
            </button>
          )}
        </div>
      </div>

      {statusFiltro && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-4 py-2 text-sm flex items-center justify-between">
          <span>Filtrando por: <strong>{statusFiltro === 'ABERTA' ? 'Em aberto' : statusFiltro}</strong></span>
          <a href="/contas-pagar" className="text-blue-500 hover:underline text-xs">Limpar filtro</a>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg px-4 py-3 text-sm">
        Contas a pagar são previsões. O status <strong>Paga</strong> é atualizado automaticamente pela conciliação bancária.
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {isLoading && (
          <div className="text-center py-16 text-gray-400 text-sm">
            Carregando contas a pagar...
          </div>
        )}

        {isError && (
          <div className="text-center py-16 text-red-500 text-sm">
            Erro ao carregar contas a pagar. Tente novamente.
          </div>
        )}

        {!isLoading && !isError && (
          <ContasPagarTable
            contas={contas}
            canEdit={canEdit}
            onEdit={handleEdit}
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

      {showForm && (
        <ContaPagarForm
          editTarget={editTarget}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
