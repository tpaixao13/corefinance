import type { AcaoAuditoria, AuditoriaLog } from '../types';

const ACAO_LABEL: Record<AcaoAuditoria, string> = {
  IMPORTACAO_EXTRATO: 'Importação de Extrato',
  CONCILIACAO_AUTOMATICA: 'Conciliação Automática',
  CONCILIACAO_MANUAL: 'Conciliação Manual',
  AJUSTE_SALDO: 'Ajuste de Saldo',
  CRIACAO_CONTA: 'Criação de Conta',
  ATUALIZACAO_CONTA: 'Atualização de Conta',
  CRIACAO_EMPRESA: 'Criação de Empresa',
  ATUALIZACAO_EMPRESA: 'Atualização de Empresa',
  CRIACAO_USUARIO: 'Criação de Usuário',
  LOGIN: 'Login',
  ESTORNO_CONCILIACAO: 'Estorno de Conciliação',
  ALTERACAO_LICENCA: 'Alteração de Licença',
  TENTATIVA_LIMITE_USUARIOS: 'Tentativa: Limite de Usuários',
  CRIACAO_OS: 'Criação de OS',
  EDICAO_OS: 'Edição de OS',
  FINALIZACAO_OS: 'Finalização de OS',
  CANCELAMENTO_OS: 'Cancelamento de OS',
  ENVIO_EMAIL_OS: 'Envio de E-mail OS',
};

const ACAO_COR: Record<AcaoAuditoria, string> = {
  IMPORTACAO_EXTRATO: 'bg-blue-100 text-blue-700',
  CONCILIACAO_AUTOMATICA: 'bg-green-100 text-green-700',
  CONCILIACAO_MANUAL: 'bg-teal-100 text-teal-700',
  AJUSTE_SALDO: 'bg-yellow-100 text-yellow-700',
  CRIACAO_CONTA: 'bg-purple-100 text-purple-700',
  ATUALIZACAO_CONTA: 'bg-indigo-100 text-indigo-700',
  CRIACAO_EMPRESA: 'bg-pink-100 text-pink-700',
  ATUALIZACAO_EMPRESA: 'bg-rose-100 text-rose-700',
  CRIACAO_USUARIO: 'bg-orange-100 text-orange-700',
  LOGIN: 'bg-gray-100 text-gray-600',
  ESTORNO_CONCILIACAO: 'bg-red-100 text-red-700',
  ALTERACAO_LICENCA: 'bg-violet-100 text-violet-700',
  TENTATIVA_LIMITE_USUARIOS: 'bg-red-100 text-red-700',
  CRIACAO_OS: 'bg-cyan-100 text-cyan-700',
  EDICAO_OS: 'bg-sky-100 text-sky-700',
  FINALIZACAO_OS: 'bg-green-100 text-green-700',
  CANCELAMENTO_OS: 'bg-gray-100 text-gray-500',
  ENVIO_EMAIL_OS: 'bg-indigo-100 text-indigo-700',
};

function formatarData(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

interface Props {
  registros: AuditoriaLog[];
}

export default function AuditoriaTable({ registros }: Props) {
  if (registros.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        Nenhum registro de auditoria encontrado.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <th className="pb-3 pr-4">Data / Hora</th>
            <th className="pb-3 pr-4">Usuário</th>
            <th className="pb-3 pr-4">Ação</th>
            <th className="pb-3 pr-4">Entidade</th>
            <th className="pb-3">Referência</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {registros.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                {formatarData(r.createdAt)}
              </td>
              <td className="py-3 pr-4">
                <p className="font-medium text-gray-800">
                  {r.usuario?.nome ?? '—'}
                </p>
                {r.usuario?.email && (
                  <p className="text-xs text-gray-400">{r.usuario.email}</p>
                )}
              </td>
              <td className="py-3 pr-4">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ACAO_COR[r.acao]}`}
                >
                  {ACAO_LABEL[r.acao] ?? r.acao}
                </span>
              </td>
              <td className="py-3 pr-4 text-gray-600">
                {r.entidade ?? '—'}
              </td>
              <td className="py-3 text-gray-500 max-w-xs truncate">
                {r.entidadeId ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
