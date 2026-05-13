import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { DreResult } from '../api/relatoriosFinanceiro';

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

interface Props {
  dre: DreResult;
}

export default function DreResumo({ dre }: Props) {
  const lucro = dre.status === 'LUCRO';

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
          {dre.periodo.inicio} — {dre.periodo.fim}
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {/* Receitas */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={18} className="text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Receitas (conciliadas)</span>
          </div>
          <span className="text-base font-semibold text-green-600">{brl(dre.receitas)}</span>
        </div>

        {/* Despesas */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown size={18} className="text-red-500" />
            </div>
            <span className="text-sm font-medium text-gray-700">Despesas (conciliadas)</span>
          </div>
          <span className="text-base font-semibold text-red-500">({brl(dre.despesas)})</span>
        </div>

        {/* Resultado */}
        <div className={`flex items-center justify-between px-6 py-5 ${lucro ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${lucro ? 'bg-green-200' : 'bg-red-200'}`}>
              <Minus size={18} className={lucro ? 'text-green-700' : 'text-red-700'} />
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-800">Resultado do Período</span>
              <div className={`inline-flex items-center gap-1 ml-3 text-xs font-bold px-2 py-0.5 rounded-full ${
                lucro ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {lucro ? '✓ Lucro' : '✗ Prejuízo'}
              </div>
            </div>
          </div>
          <span className={`text-xl font-bold ${lucro ? 'text-green-700' : 'text-red-700'}`}>
            {brl(Math.abs(dre.resultado))}
          </span>
        </div>
      </div>
    </div>
  );
}
