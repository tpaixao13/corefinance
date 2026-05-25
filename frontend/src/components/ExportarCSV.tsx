import { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
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

  async function handleExportar(formato: 'xlsx' | 'csv') {
    setIsPending(true);
    setErro(null);
    try {
      if (formato === 'xlsx') {
        await relatoriosFinanceiroApi.exportarXlsx({ ...params, tipo });
      } else {
        await relatoriosFinanceiroApi.exportar({ ...params, tipo });
      }
    } catch (e: any) {
      setErro(e?.message ?? 'Erro ao exportar. Tente novamente.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Exportar Relatório</h3>

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
          onClick={() => handleExportar('xlsx')}
          disabled={isPending}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <FileSpreadsheet size={15} />
          {isPending ? 'Gerando...' : 'Exportar Excel (.xlsx)'}
        </button>

        <button
          onClick={() => handleExportar('csv')}
          disabled={isPending}
          className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-60 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Download size={15} />
          CSV
        </button>
      </div>

      {erro && (
        <p className="mt-3 text-sm text-red-600">{erro}</p>
      )}

      <p className="mt-3 text-xs text-gray-400">
        Excel: formatado com cabeçalhos, colunas ajustadas e compatível com Excel/LibreOffice.
      </p>
    </div>
  );
}
