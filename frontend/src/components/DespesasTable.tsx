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
}

export default function DespesasTable({ despesas, banco }: Props) {
  if (despesas.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        Nenhuma despesa encontrada para os filtros selecionados.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <th className="pb-3 pr-4">Data</th>
            <th className="pb-3 pr-4">Descrição</th>
            <th className="pb-3 pr-4">Conta</th>
            <th className="pb-3 pr-4 text-right">Valor</th>
            <th className="pb-3">Status</th>
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
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
