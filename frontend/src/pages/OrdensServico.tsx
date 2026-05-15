import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, Pencil, CheckCircle, XCircle, X, CalendarCheck, FileText } from 'lucide-react';
import {
  useOrdensServico,
  useCriarOrdemServico,
  useAtualizarOrdemServico,
  useFinalizarOrdemServico,
  useCancelarOrdemServico,
} from '../hooks/useOrdensServico';
import { usePermissoesCtx } from '../contexts/PermissoesContext';
import OrdemServicoForm from '../components/OrdemServicoForm';
import type { OrdemServico, StatusOrdemServico } from '../types';

const STATUS_LABEL: Record<StatusOrdemServico, string> = {
  ABERTA: 'Aberta',
  EM_ANDAMENTO: 'Em Andamento',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
};

const STATUS_COR: Record<StatusOrdemServico, string> = {
  ABERTA: 'bg-blue-100 text-blue-700',
  EM_ANDAMENTO: 'bg-yellow-100 text-yellow-700',
  CONCLUIDA: 'bg-green-100 text-green-700',
  CANCELADA: 'bg-gray-100 text-gray-500',
};

const fmtMoeda = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const fmtData = (d: string | null) =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—';

export default function OrdensServico() {
  const navigate = useNavigate();
  const { temPermissao } = usePermissoesCtx();

  const { data, isLoading, isError, error } = useOrdensServico();
  const { mutate: criar, isPending: criando } = useCriarOrdemServico();
  const { mutate: atualizar, isPending: atualizando } = useAtualizarOrdemServico();
  const { mutate: finalizar, isPending: finalizando } = useFinalizarOrdemServico();
  const { mutate: cancelar, isPending: cancelando } = useCancelarOrdemServico();

  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<OrdemServico | null>(null);
  const [finalizarOs, setFinalizarOs] = useState<OrdemServico | null>(null);
  const [dataConclusao, setDataConclusao] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const ordens = data?.data ?? [];

  function handleSave(dto: any) {
    setErrorMsg('');
    const onError = (err: unknown) => {
      const msg = (err as any).response?.data?.message ?? 'Erro ao salvar';
      setErrorMsg(msg);
    };
    if (editando) {
      atualizar({ id: editando.id, dto }, { onSuccess: () => { setEditando(null); setShowForm(false); }, onError });
    } else {
      criar(dto, { onSuccess: () => setShowForm(false), onError });
    }
  }

  function handleFinalizar() {
    if (!finalizarOs || !dataConclusao) return;
    setErrorMsg('');
    finalizar(
      { id: finalizarOs.id, dataConclusao },
      {
        onSuccess: () => { setFinalizarOs(null); setDataConclusao(''); },
        onError: (err: unknown) => {
          const msg = (err as any).response?.data?.message ?? 'Erro ao finalizar';
          setErrorMsg(msg);
        },
      },
    );
  }

  function handleCancelar(os: OrdemServico) {
    if (!confirm(`Cancelar a OS de ${os.cliente}?`)) return;
    cancelar(os.id);
  }

  const canCreate = temPermissao('ORDEM_SERVICO_CREATE');
  const canEdit = temPermissao('ORDEM_SERVICO_EDIT');
  const canFinalizar = temPermissao('ORDEM_SERVICO_FINALIZAR');

  const isTerminal = (s: StatusOrdemServico) => s === 'CONCLUIDA' || s === 'CANCELADA';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList size={22} className="text-gray-600" />
          <h2 className="text-2xl font-bold text-gray-800">Ordens de Serviço</h2>
        </div>
        {canCreate && (
          <button
            onClick={() => { setEditando(null); setShowForm(true); setErrorMsg(''); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Nova OS
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {errorMsg}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isLoading && (
          <div className="text-center py-16 text-gray-400 text-sm">Carregando ordens de serviço...</div>
        )}
        {isError && (
          <div className="text-center py-16 text-sm text-gray-500">
            {(error as any)?.response?.status === 400
              ? 'Selecione uma empresa no menu superior para visualizar as ordens de serviço.'
              : 'Erro ao carregar. Tente novamente.'}
          </div>
        )}
        {!isLoading && !isError && ordens.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">Nenhuma ordem de serviço cadastrada.</div>
        )}
        {!isLoading && !isError && ordens.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Descrição</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Valor</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Abertura</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Conclusão</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ordens.map((os) => (
                  <tr key={os.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{os.cliente}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={os.descricao}>
                      {os.descricao}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      {fmtMoeda(Number(os.valor))}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{fmtData(os.dataAbertura)}</td>
                    <td className="px-4 py-3 text-gray-600">{fmtData(os.dataConclusao)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COR[os.status]}`}>
                        {STATUS_LABEL[os.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => navigate(`/ordens-servico/${os.id}`)}
                          className="text-gray-400 hover:text-gray-700 transition-colors"
                          title="Ver documento"
                        >
                          <FileText size={15} />
                        </button>
                        {!isTerminal(os.status) && canEdit && (
                          <button
                            onClick={() => { setEditando(os); setShowForm(true); setErrorMsg(''); }}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            title="Editar"
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        {!isTerminal(os.status) && canFinalizar && (
                          <button
                            onClick={() => { setFinalizarOs(os); setDataConclusao(new Date().toISOString().split('T')[0]); setErrorMsg(''); }}
                            className="text-gray-400 hover:text-green-600 transition-colors"
                            title="Finalizar"
                          >
                            <CheckCircle size={15} />
                          </button>
                        )}
                        {!isTerminal(os.status) && canEdit && (
                          <button
                            onClick={() => handleCancelar(os)}
                            disabled={cancelando}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Cancelar OS"
                          >
                            <XCircle size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal criar/editar */}
      {showForm && (
        <OrdemServicoForm
          os={editando}
          onClose={() => { setShowForm(false); setEditando(null); }}
          onSave={handleSave}
          isPending={criando || atualizando}
        />
      )}

      {/* Modal finalizar */}
      {finalizarOs && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-800">Finalizar Ordem de Serviço</h3>
              <button onClick={() => setFinalizarOs(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-gray-600">
                Ao finalizar, uma <strong>Conta a Receber</strong> será criada automaticamente
                para <strong>{finalizarOs.cliente}</strong> no valor de{' '}
                <strong>{fmtMoeda(Number(finalizarOs.valor))}</strong>.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Data de Conclusão <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={dataConclusao}
                  onChange={(e) => setDataConclusao(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {errorMsg && (
                <p className="text-red-600 text-xs">{errorMsg}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFinalizarOs(null)}
                  className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-50"
                >
                  Voltar
                </button>
                <button
                  onClick={handleFinalizar}
                  disabled={finalizando || !dataConclusao}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                >
                  <CalendarCheck size={15} />
                  {finalizando ? 'Finalizando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
