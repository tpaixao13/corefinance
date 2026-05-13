import { TrendingUp, TrendingDown, Wallet, Clock, Activity } from 'lucide-react';
import type { FinanceiroResult } from '../api/relatoriosFinanceiro';

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

interface CardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  bg: string;
}

function Card({ icon, label, value, color, bg }: CardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

interface Props {
  data: FinanceiroResult;
}

export default function FinanceiroCards({ data }: Props) {
  const positivo = data.saldoPeriodo >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        icon={<TrendingUp size={20} className="text-green-600" />}
        label="Total de Receitas"
        value={brl(data.totalReceitas)}
        color="text-green-600"
        bg="bg-green-100"
      />
      <Card
        icon={<TrendingDown size={20} className="text-red-500" />}
        label="Total de Despesas"
        value={brl(data.totalDespesas)}
        color="text-red-500"
        bg="bg-red-100"
      />
      <Card
        icon={<Wallet size={20} className={positivo ? 'text-blue-600' : 'text-orange-500'} />}
        label="Saldo do Período"
        value={brl(data.saldoPeriodo)}
        color={positivo ? 'text-blue-600' : 'text-orange-500'}
        bg={positivo ? 'bg-blue-100' : 'bg-orange-100'}
      />
      <Card
        icon={<Clock size={20} className="text-amber-600" />}
        label="Lançamentos Pendentes"
        value={String(data.totalPendentes)}
        color="text-amber-600"
        bg="bg-amber-100"
      />
      <Card
        icon={<Activity size={20} className="text-slate-600" />}
        label="Total de Transações"
        value={String(data.quantidadeTransacoes)}
        color="text-slate-700"
        bg="bg-slate-100"
      />
    </div>
  );
}
