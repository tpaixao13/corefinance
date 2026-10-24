import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { ContaReceber, StatusContaReceber } from '../types';

type StatusDisplay = StatusContaReceber | 'ATRASADA';

const STATUS_CONFIG: Record<StatusDisplay, { label: string; className: string }> = {
  ABERTA:    { label: 'Aberta',    className: 'bg-blue-100 text-blue-700' },
  RECEBIDA:  { label: 'Recebida',  className: 'bg-green-100 text-green-700' },
  ATRASADA:  { label: 'Atrasada',  className: 'bg-red-100 text-red-700' },
  CANCELADA: { label: 'Cancelada', className: 'bg-gray-100 text-gray-500' },
};

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR');

function resolveStatus(conta: ContaReceber): StatusDisplay {
  if (conta.status !== 'ABERTA') return conta.status;
  if (conta.dataRecebimento < new Date().toISOString().slice(0, 10)) return 'ATRASADA';
  return 'ABERTA';
}

interface Props {
  contas: ContaReceber[];
  canEdit: boolean;
  onEdit: (conta: ContaReceber) => void;
  onExcluir?: (id: string) => Promise<void>;
}

export default function ContasReceberTable({ contas, canEdit, onEdit, onExcluir }: Props) {
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const showAcoes = canEdit || !!onExcluir;

  const excluir = async (id: string) => {
    if (!onExcluir) return;
    setExcluindoId(id);
    setErro(null);
    try {
      await onExcluir(id);
      setConfirmandoId(null);
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } }).response?.data?.message;
      setErro(msg ?? 'Erro ao excluir conta.');
    } finally {
      setExcluindoId(null);
    }
  };

  if (contas.length === 0) {
    return (
      <p className="text-center py-16 text-gray-400 text-sm">
        Nenhuma conta a receber encontrada.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      {erro && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
          {erro}
        </div>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
            <th className="text-left py-3 px-4 font-medium">Descrição</th>
            <th className="text-left py-3 px-4 font-medium">Cliente</th>
            <th className="text-right py-3 px-4 font-medium">Valor</th>
            <th className="text-left py-3 px-4 font-medium">Recebimento</th>
            <th className="text-left py-3 px-4 font-medium">Recorrência</th>
            <th className="text-left py-3 px-4 font-medium">Status</th>
            {showAcoes && <th className="py-3 px-4" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {contas.map((conta) => {
            const status = resolveStatus(conta);
            const cfg = STATUS_CONFIG[status];
            return (
              <tr key={conta.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-medium text-gray-800">{conta.descricao}</td>
                <td className="py-3 px-4 text-gray-500">{conta.cliente ?? '—'}</td>
                <td className="py-3 px-4 text-right font-mono text-gray-800">{brl(conta.valor)}</td>
                <td className="py-3 px-4 text-gray-600">{fmtDate(conta.dataRecebimento)}</td>
                <td className="py-3 px-4 text-gray-500 capitalize">{conta.recorrencia.toLowerCase()}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
                    {cfg.label}
                  </span>
                </td>
                {showAcoes && (
                  <td className="py-3 px-4 whitespace-nowrap">
                    {confirmandoId === conta.id ? (
                      <span className="inline-flex items-center gap-2 text-xs">
                        <span className="text-gray-500">Excluir?</span>
                        <button
                          onClick={() => excluir(conta.id)}
                          disabled={excluindoId === conta.id}
                          className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {excluindoId === conta.id ? 'Excluindo...' : 'Sim'}
                        </button>
                        <button
                          onClick={() => setConfirmandoId(null)}
                          disabled={excluindoId === conta.id}
                          className="px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                        >
                          Não
                        </button>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-3">
                        {canEdit && conta.status !== 'RECEBIDA' && conta.status !== 'CANCELADA' && (
                          <button
                            onClick={() => onEdit(conta)}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            title="Editar"
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        {onExcluir && (
                          <button
                            onClick={() => { setConfirmandoId(conta.id); setErro(null); }}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
