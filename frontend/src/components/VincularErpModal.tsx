import { useState } from 'react';
import { X, Link } from 'lucide-react';
import { useVincularErp } from '../hooks/useConciliacao';
import { useContasPagar } from '../hooks/useContasPagar';
import { useContasReceber } from '../hooks/useContasReceber';
import type { Lancamento, ContaPagar, ContaReceber } from '../types';

const brl = (v: number | string) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v));

const fmtDate = (iso: string) =>
  new Date(iso.slice(0, 10) + 'T00:00:00').toLocaleDateString('pt-BR');

interface Props {
  lancamento: Lancamento;
  contaId: string;
  onClose: () => void;
}

export default function VincularErpModal({ lancamento, contaId, onClose }: Props) {
  const [selecionado, setSelecionado] = useState<string>('');
  const isPagar = lancamento.tipo === 'DEBITO';

  const { data: pagarData } = useContasPagar(1, 100);
  const { data: receberData } = useContasReceber(1, 100);
  const { mutate: vincular, isPending } = useVincularErp(contaId);

  const contasPagar = (pagarData?.data ?? []).filter(
    (c) => c.status === 'ABERTA',
  ) as ContaPagar[];

  const contasReceber = (receberData?.data ?? []).filter(
    (c) => c.status === 'ABERTA',
  ) as ContaReceber[];

  const opcoes = isPagar ? contasPagar : contasReceber;

  function handleVincular() {
    if (!selecionado) return;
    vincular(
      { extratoId: lancamento.id, contaErpId: selecionado, tipo: isPagar ? 'PAGAR' : 'RECEBER' },
      { onSuccess: onClose },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-800">Vincular ao ERP</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {lancamento.descricao ?? lancamento.idExterno} — {brl(lancamento.valor)} em {fmtDate(lancamento.data)}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className={`text-xs font-medium px-3 py-1.5 rounded-full w-fit ${
            isPagar ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {isPagar ? 'Débito → Contas a Pagar' : 'Crédito → Contas a Receber'}
          </div>

          {opcoes.length === 0 ? (
            <p className="text-center py-8 text-gray-400 text-sm">
              Nenhuma conta {isPagar ? 'a pagar' : 'a receber'} aberta encontrada.
            </p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {opcoes.map((c) => {
                const isPagarItem = 'fornecedor' in c;
                const label = isPagarItem
                  ? (c as ContaPagar).fornecedor
                  : (c as ContaReceber).cliente;
                const data = isPagarItem
                  ? (c as ContaPagar).dataVencimento
                  : (c as ContaReceber).dataRecebimento;

                return (
                  <label
                    key={c.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      selecionado === c.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="erp-conta"
                      value={c.id}
                      checked={selecionado === c.id}
                      onChange={() => setSelecionado(c.id)}
                      className="accent-blue-600"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{c.descricao}</p>
                      <p className="text-xs text-gray-500">
                        {label ?? '—'} · {fmtDate(data)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 shrink-0">
                      {brl(c.valor)}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleVincular}
              disabled={!selecionado || isPending}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              <Link size={15} />
              {isPending ? 'Vinculando...' : 'Vincular'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
