import { useState } from 'react';
import { Download } from 'lucide-react';
import { useEmpresa } from '../contexts/EmpresaContext';
import { useAuth } from '../contexts/AuthContext';
import AcessoNegado from '../components/AcessoNegado';
import ExportarCSV from '../components/ExportarCSV';

function periodoInicial() {
  const d = new Date();
  const ini = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  const fim = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
  return { dataInicio: ini, dataFim: fim };
}

export default function Exportacao() {
  const { user } = useAuth();
  const { empresaAtiva } = useEmpresa();
  const [periodo, setPeriodo] = useState(periodoInicial);

  if (user?.role === 'USUARIO') return <AcessoNegado />;

  const empresaId = user?.role !== 'SUPER_ADMIN' ? empresaAtiva?.id : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Download size={22} className="text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Exportação Contábil</h2>
          <p className="text-sm text-gray-500">Exporte lançamentos para contabilidade ou auditoria</p>
        </div>
      </div>

      {/* Filtro de período */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Período — De</label>
          <input
            type="date"
            value={periodo.dataInicio}
            onChange={(e) => setPeriodo((p) => ({ ...p, dataInicio: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Até</label>
          <input
            type="date"
            value={periodo.dataFim}
            onChange={(e) => setPeriodo((p) => ({ ...p, dataFim: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <ExportarCSV params={{ ...periodo, empresaId }} />

      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700">
        <strong>Estrutura do CSV:</strong> Data, Tipo, Descrição, Valor, Banco, Conta, Status
        <br />
        Todos os lançamentos do período são incluídos, independente do status de conciliação.
      </div>
    </div>
  );
}
