import { Loader2 } from 'lucide-react';
import type { PermissaoItem } from '../types';

const GRUPOS: { label: string; chaves: string[] }[] = [
  { label: 'Visualização', chaves: ['DASHBOARD_VIEW', 'AUDITORIA_VIEW'] },
  { label: 'Extratos', chaves: ['EXTRATO_IMPORT'] },
  { label: 'Conciliação', chaves: ['CONCILIACAO_EXECUTAR'] },
  { label: 'Contas Bancárias', chaves: ['CONTA_BANCARIA_VIEW', 'CONTA_BANCARIA_CREATE', 'CONTA_BANCARIA_EDIT'] },
  { label: 'Contas a Pagar', chaves: ['CONTAS_PAGAR_VIEW', 'CONTAS_PAGAR_CREATE', 'CONTAS_PAGAR_EDIT'] },
  { label: 'Contas a Receber', chaves: ['CONTAS_RECEBER_VIEW', 'CONTAS_RECEBER_CREATE', 'CONTAS_RECEBER_EDIT'] },
  { label: 'Ordens de Serviço', chaves: ['ORDEM_SERVICO_VIEW', 'ORDEM_SERVICO_CREATE', 'ORDEM_SERVICO_EDIT', 'ORDEM_SERVICO_FINALIZAR', 'ORDEM_SERVICO_ENVIAR_EMAIL', 'ORDEM_SERVICO_IMPRIMIR'] },
];

interface Props {
  permissoes: PermissaoItem[];
  pendentes: Set<string>;
  onToggle: (chave: string, habilitado: boolean) => void;
  bloqueado: boolean;
}

function Toggle({
  permissao,
  isPendente,
  onToggle,
  bloqueado,
}: {
  permissao: PermissaoItem;
  isPendente: boolean;
  onToggle: (chave: string, habilitado: boolean) => void;
  bloqueado: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 px-1">
      <div className="min-w-0 pr-4">
        <p className="text-sm text-gray-800">{permissao.descricao}</p>
        <p className="text-xs text-gray-400 font-mono">{permissao.chave}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isPendente && <Loader2 size={14} className="animate-spin text-blue-500" />}
        <button
          role="switch"
          aria-checked={permissao.habilitado}
          disabled={bloqueado || isPendente}
          onClick={() => onToggle(permissao.chave, !permissao.habilitado)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
            permissao.habilitado ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              permissao.habilitado ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}

export default function PermissoesToggle({ permissoes, pendentes, onToggle, bloqueado }: Props) {
  const mapa = new Map(permissoes.map((p) => [p.chave, p]));

  return (
    <div className="space-y-5">
      {bloqueado && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-4 py-3 text-sm">
          Permissões de <strong>SUPER_ADMIN</strong> são gerenciadas pelo sistema e não podem ser alteradas aqui.
        </div>
      )}

      {GRUPOS.map((grupo) => {
        const itens = grupo.chaves
          .map((c) => mapa.get(c))
          .filter((p): p is PermissaoItem => p !== undefined);

        if (!itens.length) return null;

        return (
          <div key={grupo.label}>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-1">
              {grupo.label}
            </h4>
            <div className="bg-gray-50 rounded-lg divide-y divide-gray-100 px-3">
              {itens.map((p) => (
                <Toggle
                  key={p.chave}
                  permissao={p}
                  isPendente={pendentes.has(p.chave)}
                  onToggle={onToggle}
                  bloqueado={bloqueado}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
