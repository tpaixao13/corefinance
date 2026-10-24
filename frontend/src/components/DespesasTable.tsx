import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Lancamento, StatusConciliacao } from '../types';

const brl = (v: string | number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v));

const STATUS_BADGE: Record<StatusConciliacao, { label: string; className: string }> = {
  PENDENTE: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-700' },
  CONCILIADO: { label: 'Conciliado', className: 'bg-green-100 text-green-700' },
  NAO_ENCONTRADO: { label: 'Não encontrado', className: 'bg-red-100 text-red-600' },
};

function formatarData(iso: string) {
  const [ano, mes, dia] = iso.split('T')[0].split('-');
  return `${dia}/${mes}/${ano}`;
}

interface Props {
  despesas: Lancamento[];
  banco: string;
  onExcluir?: (id: string) => Promise<void>;
}

export default function DespesasTable({ despesas, banco, onExcluir }: Props) {
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const excluir = async (id: string) => {
    if (!onExcluir) return;
    setExcluindoId(id);
    setErro(null);
    try {
      await onExcluir(id);
      setConfirmandoId(null);
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } }).response?.data?.message;
      setErro(msg ?? 'Erro ao excluir lançamento.');
    } finally {
      setExcluindoId(null);
    }
  };

  if (despesas.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        Nenhuma despesa encontrada para os filtros selecionados.
      </div>
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
          <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <th className="pb-3 pr-4">Data</th>
            <th className="pb-3 pr-4">Descrição</th>
            <th className="pb-3 pr-4">Conta</th>
            <th className="pb-3 pr-4 text-right">Valor</th>
            <th className="pb-3">Status</th>
            {onExcluir && <th className="pb-3 text-right">Ações</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {despesas.map((d) => {
            const badge = STATUS_BADGE[d.statusConciliacao];
            return (
              <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                  {formatarData(d.data)}
                </td>
                <td className="py-3 pr-4 text-gray-700 max-w-xs truncate">
                  {d.descricao ?? '—'}
                </td>
                <td className="py-3 pr-4 text-gray-500 text-xs">{banco}</td>
                <td className="py-3 pr-4 text-right font-semibold text-red-600">
                  {brl(d.valor)}
                </td>
                <td className="py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                    {badge.label}
                  </span>
                </td>
                {onExcluir && (
                  <td className="py-3 text-right whitespace-nowrap">
                    {confirmandoId === d.id ? (
                      <span className="inline-flex items-center gap-2 text-xs">
                        <span className="text-gray-500">Excluir?</span>
                        <button
                          onClick={() => excluir(d.id)}
                          disabled={excluindoId === d.id}
                          className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {excluindoId === d.id ? 'Excluindo...' : 'Sim'}
                        </button>
                        <button
                          onClick={() => setConfirmandoId(null)}
                          disabled={excluindoId === d.id}
                          className="px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                        >
                          Não
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => { setConfirmandoId(d.id); setErro(null); }}
                        title="Excluir lançamento"
                        className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200">
            <td colSpan={3} className="pt-3 text-sm font-semibold text-gray-600">
              Total ({despesas.length} lançamentos)
            </td>
            <td className="pt-3 text-right font-bold text-red-600">
              {brl(despesas.reduce((acc, d) => acc + Number(d.valor), 0))}
            </td>
            <td />
            {onExcluir && <td />}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
