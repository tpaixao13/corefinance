import { X, TrendingUp, TrendingDown, Wallet, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ResumoContaPeriodo, ContaBancaria } from '../types';

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

interface Props {
  resumo: ResumoContaPeriodo;
  conta: ContaBancaria;
  periodo: { dataInicio: string; dataFim: string };
  onClose: () => void;
}

function formatData(iso: string) {
  return iso.split('-').reverse().join('/');
}

export default function ResumoCaixaModal({ resumo, conta, periodo, onClose }: Props) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-800">Resumo de Caixa</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {conta.banco} · Ag. {conta.agencia} · CC {conta.numero}
            </p>
            <p className="text-xs text-gray-400">
              {formatData(periodo.dataInicio)} a {formatData(periodo.dataFim)}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Corpo */}
        <div className="px-6 py-5 space-y-3">
          {/* Saldo inicial */}
          <div className="flex items-center justify-between py-2">
            <span className="flex items-center gap-2 text-sm text-gray-600">
              <Wallet size={14} className="text-gray-400" />
              Saldo inicial
            </span>
            <span className="text-sm font-medium text-gray-700">{brl(resumo.saldoInicial)}</span>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Entradas */}
          <div className="flex items-center justify-between py-2">
            <span className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp size={14} className="text-green-500" />
              Entradas conciliadas
            </span>
            <span className="text-sm font-semibold text-green-600">+ {brl(resumo.totalEntradas)}</span>
          </div>

          {/* Saídas */}
          <div className="flex items-center justify-between py-2">
            <span className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingDown size={14} className="text-red-400" />
              Saídas conciliadas
            </span>
            <span className="text-sm font-semibold text-red-600">− {brl(resumo.totalSaidas)}</span>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Saldo atual */}
          <div className="flex items-center justify-between py-2 bg-gray-50 rounded-lg px-3">
            <span className="text-sm font-semibold text-gray-700">Saldo atual</span>
            <span className={`text-lg font-bold ${resumo.saldoAtual >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
              {brl(resumo.saldoAtual)}
            </span>
          </div>

          {/* Alerta de diferença */}
          {Math.abs(resumo.diferenca) > 0.01 && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Diferença de conciliação: {brl(resumo.diferenca)}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="px-6 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={() => { onClose(); navigate('/conciliacao'); }}
            className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            Ver extrato
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
