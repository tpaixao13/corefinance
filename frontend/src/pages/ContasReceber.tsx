import { useState } from 'react';
import { TrendingUp, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useContasReceber } from '../hooks/useContasReceber';
import { usePermissoesCtx } from '../contexts/PermissoesContext';
import ContasReceberTable from '../components/ContasReceberTable';
import ContaReceberForm from '../components/ContaReceberForm';
import AcessoNegado from '../components/AcessoNegado';
import type { ContaReceber } from '../types';

const LIMIT = 50;

export default function ContasReceber() {
  const { temPermissao, isLoading: permLoading } = usePermissoesCtx();

  if (!permLoading && !temPermissao('CONTAS_RECEBER_VIEW')) return <AcessoNegado />;
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<ContaReceber | undefined>();

  const { data, isLoading, isError } = useContasReceber(page, LIMIT);

  const canCreate = temPermissao('CONTAS_RECEBER_CREATE');
  const canEdit = temPermissao('CONTAS_RECEBER_EDIT');

  const contas = data?.data ?? [];
  const totalPaginas = Math.ceil((data?.total ?? 0) / LIMIT);

  const brl = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const totalAberto = contas
    .filter((c) => c.status === 'ABERTA')
    .reduce((acc, c) => acc + c.valor, 0);

  function handleEdit(conta: ContaReceber) {
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
          <TrendingUp size={22} className="text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Contas a Receber</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500">Total em aberto</p>
            <p className="text-xl font-bold text-green-600">{brl(totalAberto)}</p>
          </div>

          {canCreate && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus size={16} />
              Nova Conta a Receber
            </button>
          )}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg px-4 py-3 text-sm">
        Contas a receber são previsões. O status <strong>Recebida</strong> é atualizado automaticamente pela conciliação bancária.
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {isLoading && (
          <div className="text-center py-16 text-gray-400 text-sm">
            Carregando contas a receber...
          </div>
        )}

        {isError && (
          <div className="text-center py-16 text-red-500 text-sm">
            Erro ao carregar contas a receber. Tente novamente.
          </div>
        )}

        {!isLoading && !isError && (
          <ContasReceberTable
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
        <ContaReceberForm
          editTarget={editTarget}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
