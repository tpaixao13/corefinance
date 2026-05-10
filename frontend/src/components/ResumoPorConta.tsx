import type { ContaBancaria } from '../types';

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

interface Props {
  contas: ContaBancaria[];
  contaId: string;
  onSelect: (id: string) => void;
}

export default function ResumoPorConta({ contas, contaId, onSelect }: Props) {
  if (contas.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contas Bancárias</p>
      </div>
      <div className="divide-y divide-gray-100">
        {contas.map((c) => {
          const ativo = c.id === contaId;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors ${
                ativo ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-2 h-2 rounded-full shrink-0 ${ativo ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${ativo ? 'text-blue-700' : 'text-gray-700'}`}>
                    {c.banco}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    Ag. {c.agencia} · CC {c.numero}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className={`text-sm font-bold ${c.saldoAtual >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                  {brl(c.saldoAtual)}
                </p>
                {!c.ativo && (
                  <p className="text-xs text-gray-400">inativa</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
