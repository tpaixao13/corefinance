import { useState } from 'react';
import { Download } from 'lucide-react';
import { relatoriosFinanceiroApi, type RelatorioParams } from '../api/relatoriosFinanceiro';

const TIPOS = [
  { value: 'geral',    label: 'Geral (tudo)' },
  { value: 'receitas', label: 'Apenas Receitas' },
  { value: 'despesas', label: 'Apenas Despesas' },
] as const;

interface Props {
  params: RelatorioParams;
}

export default function ExportarCSV({ params }: Props) {
  const [tipo, setTipo] = useState<'geral' | 'receitas' | 'despesas'>('geral');
  const [isPending, setIsPending] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleExportar() {
    setIsPending(true);
    setErro(null);
    try {
      await relatoriosFinanceiroApi.exportar({ ...params, tipo });
    } catch {
      setErro('Erro ao exportar. Tente novamente.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Exportar para CSV</h3>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as typeof tipo)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <button
          onClick={handleExportar}
          disabled={isPending}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Download size={15} />
          {isPending ? 'Gerando...' : 'Exportar CSV'}
        </button>
      </div>

      {erro && (
        <p className="mt-3 text-sm text-red-600">{erro}</p>
      )}

      <p className="mt-3 text-xs text-gray-400">
        Exporta lançamentos do período selecionado. Compatível com Excel.
      </p>
    </div>
  );
}
