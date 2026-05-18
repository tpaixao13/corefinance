import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditoriaApi } from '../api/auditoria';
import AuditoriaTable from '../components/AuditoriaTable';
import type { AcaoAuditoria } from '../types';
import { Shield, ChevronLeft, ChevronRight } from 'lucide-react';

const ACOES: { value: AcaoAuditoria | ''; label: string }[] = [
  { value: '', label: 'Todas as ações' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'IMPORTACAO_EXTRATO', label: 'Importação de Extrato' },
  { value: 'CONCILIACAO_AUTOMATICA', label: 'Conciliação Automática' },
  { value: 'CONCILIACAO_MANUAL', label: 'Conciliação Manual' },
  { value: 'ESTORNO_CONCILIACAO', label: 'Estorno de Conciliação' },
  { value: 'AJUSTE_SALDO', label: 'Ajuste de Saldo' },
  { value: 'CRIACAO_CONTA', label: 'Criação de Conta Bancária' },
  { value: 'ATUALIZACAO_CONTA', label: 'Atualização de Conta Bancária' },
  { value: 'INATIVACAO_CONTA', label: 'Inativação de Conta Bancária' },
  { value: 'ATIVACAO_CONTA', label: 'Ativação de Conta Bancária' },
  { value: 'CRIACAO_USUARIO', label: 'Criação de Usuário' },
  { value: 'ALTERACAO_PERMISSAO', label: 'Alteração de Permissão' },
  { value: 'SOLICITACAO_RESET_SENHA', label: 'Solicitação de Reset de Senha' },
  { value: 'RESET_SENHA', label: 'Reset de Senha' },
  { value: 'CRIACAO_EMPRESA', label: 'Criação de Empresa' },
  { value: 'ATUALIZACAO_EMPRESA', label: 'Atualização de Empresa' },
  { value: 'ALTERACAO_LICENCA', label: 'Alteração de Licença' },
  { value: 'TENTATIVA_LIMITE_USUARIOS', label: 'Tentativa: Limite de Usuários' },
  { value: 'CRIACAO_CONTA_PAGAR', label: 'Criação de Conta a Pagar' },
  { value: 'EDICAO_CONTA_PAGAR', label: 'Edição de Conta a Pagar' },
  { value: 'CRIACAO_CONTA_RECEBER', label: 'Criação de Conta a Receber' },
  { value: 'EDICAO_CONTA_RECEBER', label: 'Edição de Conta a Receber' },
  { value: 'CRIACAO_OS', label: 'Criação de OS' },
  { value: 'EDICAO_OS', label: 'Edição de OS' },
  { value: 'FINALIZACAO_OS', label: 'Finalização de OS' },
  { value: 'CANCELAMENTO_OS', label: 'Cancelamento de OS' },
  { value: 'ENVIO_EMAIL_OS', label: 'Envio de E-mail OS' },
];

const LIMIT = 50;

export default function Auditoria() {
  const [page, setPage] = useState(1);
  const [acaoFiltro, setAcaoFiltro] = useState<AcaoAuditoria | ''>('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['auditoria', page, acaoFiltro],
    queryFn: () => auditoriaApi.listar(page, LIMIT, acaoFiltro || undefined),
  });

  const registros = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPaginas = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield size={22} className="text-gray-600" />
          <h2 className="text-2xl font-bold text-gray-800">Auditoria</h2>
        </div>
        <span className="text-sm text-gray-500">
          {total} registro{total !== 1 ? 's' : ''} no total
        </span>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Tipo de ação
          </label>
          <select
            value={acaoFiltro}
            onChange={(e) => {
              setAcaoFiltro(e.target.value as AcaoAuditoria | '');
              setPage(1);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ACOES.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        {acaoFiltro && (
          <button
            onClick={() => setAcaoFiltro('')}
            className="text-sm text-blue-600 hover:underline"
          >
            Limpar filtro
          </button>
        )}
      </div>

      {/* Tabela */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {isLoading && (
          <div className="text-center py-16 text-gray-400 text-sm">
            Carregando registros...
          </div>
        )}

        {isError && (
          <div className="text-center py-16 text-red-500 text-sm">
            Erro ao carregar auditoria. Tente novamente.
          </div>
        )}

        {!isLoading && !isError && (
          <AuditoriaTable registros={registros} />
        )}
      </div>

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Página {page} de {totalPaginas}
          </span>
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
