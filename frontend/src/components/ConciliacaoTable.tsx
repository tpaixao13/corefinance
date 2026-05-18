import { useState } from 'react';
import { CheckCheck, Link } from 'lucide-react';
import type { Lancamento } from '../types';
import { useConciliarManual } from '../hooks/useConciliacao';
import VincularErpModal from './VincularErpModal';

const brl = (v: string | number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v));

function formatarData(iso: string) {
  const [ano, mes, dia] = iso.split('T')[0].split('-');
  return `${dia}/${mes}/${ano}`;
}

interface Props {
  pendentes: Lancamento[];
  contaId: string;
  banco: string;
  canVincularErp?: boolean;
}

export default function ConciliacaoTable({ pendentes, contaId, banco, canVincularErp = false }: Props) {
  const [observacoes, setObservacoes] = useState<Record<string, string>>({});
  const [vinculando, setVinculando] = useState<Lancamento | null>(null);
  const { mutate: conciliar, isPending, variables } = useConciliarManual(contaId);

  function handleConciliar(l: Lancamento) {
    if (!confirm(`Conciliar "${l.descricao ?? l.idExterno}" — ${brl(l.valor)}?`)) return;
    conciliar({ lancamentoExtratoId: l.id, observacao: observacoes[l.id] || undefined });
  }

  if (pendentes.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        Nenhum lançamento pendente encontrado.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <th className="pb-3 pr-4">Data</th>
              <th className="pb-3 pr-4">Descrição</th>
              <th className="pb-3 pr-4">Conta</th>
              <th className="pb-3 pr-4">Tipo</th>
              <th className="pb-3 pr-4 text-right">Valor</th>
              <th className="pb-3 pr-4">Situação</th>
              <th className="pb-3 pr-4">Observação</th>
              <th className="pb-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pendentes.map((l) => {
              const conciliando = isPending && variables?.lancamentoExtratoId === l.id;
              return (
                <tr key={l.id} className={`transition-colors ${l.statusConciliacao === 'NAO_ENCONTRADO' ? 'bg-orange-50 hover:bg-orange-100' : 'hover:bg-gray-50'}`}>
                  <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                    {formatarData(l.data)}
                  </td>
                  <td className="py-3 pr-4 text-gray-700 max-w-xs truncate">
                    {l.descricao ?? '—'}
                  </td>
                  <td className="py-3 pr-4 text-gray-500 text-xs whitespace-nowrap">{banco}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      l.tipo === 'DEBITO'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {l.tipo === 'DEBITO' ? 'Débito' : 'Crédito'}
                    </span>
                  </td>
                  <td className={`py-3 pr-4 text-right font-semibold ${
                    l.tipo === 'DEBITO' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {l.tipo === 'DEBITO' ? '−' : '+'}{brl(l.valor)}
                  </td>
                  <td className="py-3 pr-4">
                    {l.statusConciliacao === 'NAO_ENCONTRADO' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        Não encontrado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        Pendente
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="text"
                      value={observacoes[l.id] ?? ''}
                      onChange={(e) => setObservacoes((o) => ({ ...o, [l.id]: e.target.value }))}
                      placeholder="Opcional"
                      className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-36 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleConciliar(l)}
                        disabled={conciliando || isPending}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <CheckCheck size={13} />
                        {conciliando ? 'Salvando...' : 'Conciliar'}
                      </button>

                      {canVincularErp && (
                        <button
                          onClick={() => setVinculando(l)}
                          disabled={isPending}
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Vincular a conta ERP"
                        >
                          <Link size={13} />
                          ERP
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {vinculando && (
        <VincularErpModal
          lancamento={vinculando}
          contaId={contaId}
          onClose={() => setVinculando(null)}
        />
      )}
    </>
  );
}
