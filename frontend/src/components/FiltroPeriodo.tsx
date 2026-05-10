import { Calendar } from 'lucide-react';

export interface Periodo {
  dataInicio: string;
  dataFim: string;
}

interface Props {
  value: Periodo;
  onChange: (periodo: Periodo) => void;
}

function isoHoje() {
  return new Date().toISOString().slice(0, 10);
}

function isoPrimeiroDiaDoMes(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

const ATALHOS: { label: string; get: () => Periodo }[] = [
  {
    label: 'Este mês',
    get: () => ({ dataInicio: isoPrimeiroDiaDoMes(), dataFim: isoHoje() }),
  },
  {
    label: 'Mês anterior',
    get: () => {
      const d = new Date();
      const inicio = new Date(d.getFullYear(), d.getMonth() - 1, 1);
      const fim = new Date(d.getFullYear(), d.getMonth(), 0);
      return { dataInicio: inicio.toISOString().slice(0, 10), dataFim: fim.toISOString().slice(0, 10) };
    },
  },
  {
    label: 'Últimos 30 dias',
    get: () => {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      return { dataInicio: d.toISOString().slice(0, 10), dataFim: isoHoje() };
    },
  },
  {
    label: 'Últimos 90 dias',
    get: () => {
      const d = new Date();
      d.setDate(d.getDate() - 90);
      return { dataInicio: d.toISOString().slice(0, 10), dataFim: isoHoje() };
    },
  },
];

export default function FiltroPeriodo({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Calendar size={15} className="text-gray-400 shrink-0" />

      {ATALHOS.map((a) => {
        const p = a.get();
        const ativo = value.dataInicio === p.dataInicio && value.dataFim === p.dataFim;
        return (
          <button
            key={a.label}
            onClick={() => onChange(p)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              ativo
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            {a.label}
          </button>
        );
      })}

      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={value.dataInicio}
          onChange={(e) => onChange({ ...value, dataInicio: e.target.value })}
          className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <span className="text-gray-400 text-xs">até</span>
        <input
          type="date"
          value={value.dataFim}
          onChange={(e) => onChange({ ...value, dataFim: e.target.value })}
          className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>
    </div>
  );
}
