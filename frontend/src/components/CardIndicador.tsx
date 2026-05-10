import type { ReactNode } from 'react';

type Variante = 'default' | 'green' | 'red' | 'blue' | 'yellow';

const estilos: Record<Variante, { icon: string; value: string }> = {
  default: { icon: 'bg-gray-100 text-gray-500',   value: 'text-gray-800' },
  green:   { icon: 'bg-green-100 text-green-600',  value: 'text-green-700' },
  red:     { icon: 'bg-red-100 text-red-600',      value: 'text-red-600' },
  blue:    { icon: 'bg-blue-100 text-blue-600',    value: 'text-blue-700' },
  yellow:  { icon: 'bg-yellow-100 text-yellow-600', value: 'text-yellow-700' },
};

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

interface Props {
  titulo: string;
  valor: number;
  icone: ReactNode;
  variante?: Variante;
  subtitulo?: string;
  badge?: { texto: string; cor: string };
}

export default function CardIndicador({
  titulo,
  valor,
  icone,
  variante = 'default',
  subtitulo,
  badge,
}: Props) {
  const e = estilos[variante];
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg ${e.icon}`}>{icone}</div>
        {badge && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.cor}`}>
            {badge.texto}
          </span>
        )}
      </div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{titulo}</p>
      <p className={`text-2xl font-bold ${e.value}`}>{brl(valor)}</p>
      {subtitulo && <p className="text-xs text-gray-400 mt-1">{subtitulo}</p>}
    </div>
  );
}
