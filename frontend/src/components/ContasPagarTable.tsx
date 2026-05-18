import { Pencil } from 'lucide-react';
import type { ContaPagar, StatusContaPagar } from '../types';

type StatusDisplay = StatusContaPagar | 'ATRASADA';

const STATUS_CONFIG: Record<StatusDisplay, { label: string; className: string }> = {
  ABERTA:    { label: 'Aberta',    className: 'bg-blue-100 text-blue-700' },
  PAGA:      { label: 'Paga',      className: 'bg-green-100 text-green-700' },
  ATRASADA:  { label: 'Atrasada',  className: 'bg-red-100 text-red-700' },
  CANCELADA: { label: 'Cancelada', className: 'bg-gray-100 text-gray-500' },
};

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR');

function resolveStatus(conta: ContaPagar): StatusDisplay {
  if (conta.status !== 'ABERTA') return conta.status;
  if (conta.dataVencimento < new Date().toISOString().slice(0, 10)) return 'ATRASADA';
  return 'ABERTA';
}

interface Props {
  contas: ContaPagar[];
  canEdit: boolean;
  onEdit: (conta: ContaPagar) => void;
}

export default function ContasPagarTable({ contas, canEdit, onEdit }: Props) {
  if (contas.length === 0) {
    return (
      <p className="text-center py-16 text-gray-400 text-sm">
        Nenhuma conta a pagar encontrada.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
            <th className="text-left py-3 px-4 font-medium">Descrição</th>
            <th className="text-left py-3 px-4 font-medium">Fornecedor</th>
            <th className="text-right py-3 px-4 font-medium">Valor</th>
            <th className="text-left py-3 px-4 font-medium">Vencimento</th>
            <th className="text-left py-3 px-4 font-medium">Recorrência</th>
            <th className="text-left py-3 px-4 font-medium">Status</th>
            {canEdit && <th className="py-3 px-4" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {contas.map((conta) => {
            const status = resolveStatus(conta);
            const cfg = STATUS_CONFIG[status];
            return (
              <tr key={conta.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-medium text-gray-800">{conta.descricao}</td>
                <td className="py-3 px-4 text-gray-500">{conta.fornecedor ?? '—'}</td>
                <td className="py-3 px-4 text-right font-mono text-gray-800">{brl(conta.valor)}</td>
                <td className="py-3 px-4 text-gray-600">{fmtDate(conta.dataVencimento)}</td>
                <td className="py-3 px-4 text-gray-500 capitalize">{conta.recorrencia.toLowerCase()}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
                    {cfg.label}
                  </span>
                </td>
                {canEdit && (
                  <td className="py-3 px-4">
                    {conta.status !== 'PAGA' && conta.status !== 'CANCELADA' && (
                      <button
                        onClick={() => onEdit(conta)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
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
