import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Mail, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ordensServicoApi } from '../api/ordensServico';
import { useEnviarEmailOs } from '../hooks/useOrdensServico';
import { usePermissoesCtx } from '../contexts/PermissoesContext';
import { useEmpresa } from '../contexts/EmpresaContext';
import OrdemServicoDocumento from '../components/OrdemServicoDocumento';

export default function OrdemServicoView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { temPermissao } = usePermissoesCtx();
  const { empresaAtiva } = useEmpresa();

  const { data: os, isLoading, isError } = useQuery({
    queryKey: ['ordens-servico', id],
    queryFn: () => ordensServicoApi.buscarPorId(id!),
    enabled: !!id,
  });

  const { mutate: enviarEmail, isPending: enviando } = useEnviarEmailOs();

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailDestino, setEmailDestino] = useState('');
  const [emailMsg, setEmailMsg] = useState('');
  const [emailSucesso, setEmailSucesso] = useState(false);

  function handleImprimir() {
    window.print();
  }

  function handleEnviarEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailMsg('');
    enviarEmail(
      { id: id!, email: emailDestino || undefined },
      {
        onSuccess: (res) => {
          setEmailSucesso(true);
          setEmailMsg(`E-mail enviado para ${res.para}`);
        },
        onError: (err: unknown) => {
          const msg = (err as any).response?.data?.message ?? 'Erro ao enviar e-mail';
          setEmailMsg(msg);
        },
      },
    );
  }

  const empresa = empresaAtiva
    ? { nome: empresaAtiva.nome, cnpj: empresaAtiva.cnpj, logoUrl: empresaAtiva.logoUrl ?? null }
    : { nome: '—', cnpj: '—', logoUrl: null };

  return (
    <>
      {/* Estilo de impressão — oculta tudo exceto o documento */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          .print-root { display: block !important; }
          .print-root .no-print { display: none !important; }
          .os-documento { border: none !important; }
        }
      `}</style>

      <div className="print-root max-w-3xl mx-auto space-y-4">
        {/* Ações — ocultas na impressão */}
        <div className="no-print flex items-center justify-between">
          <button
            onClick={() => navigate('/ordens-servico')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
          <div className="flex gap-2">
            {temPermissao('ORDEM_SERVICO_ENVIAR_EMAIL') && (
              <button
                onClick={() => { setShowEmailModal(true); setEmailDestino(os?.emailCliente ?? ''); setEmailMsg(''); setEmailSucesso(false); }}
                className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                <Mail size={15} />
                Enviar por E-mail
              </button>
            )}
            {temPermissao('ORDEM_SERVICO_IMPRIMIR') && (
              <button
                onClick={handleImprimir}
                className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-900 transition-colors"
              >
                <Printer size={15} />
                Imprimir
              </button>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-16 text-gray-400 text-sm">Carregando...</div>
        )}
        {isError && (
          <div className="text-center py-16 text-red-500 text-sm">Erro ao carregar ordem de serviço.</div>
        )}

        {os && <OrdemServicoDocumento os={os} empresa={empresa} />}
      </div>

      {/* Modal de e-mail */}
      {showEmailModal && os && (
        <div className="no-print fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-800">Enviar por E-mail</h3>
              <button onClick={() => setShowEmailModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEnviarEmail} className="px-6 py-5 space-y-4">
              {emailSucesso ? (
                <p className="text-green-600 text-sm font-medium">{emailMsg}</p>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    O documento da OS será enviado como e-mail HTML para o destinatário.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      E-mail do destinatário
                    </label>
                    <input
                      type="email"
                      value={emailDestino}
                      onChange={(e) => setEmailDestino(e.target.value)}
                      placeholder={os.emailCliente ?? 'cliente@email.com'}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Deixe vazio para usar o e-mail do cliente vinculado.
                    </p>
                  </div>
                  {emailMsg && <p className="text-red-600 text-xs">{emailMsg}</p>}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowEmailModal(false)}
                      className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={enviando}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60"
                    >
                      <Mail size={14} />
                      {enviando ? 'Enviando...' : 'Enviar'}
                    </button>
                  </div>
                </>
              )}
              {emailSucesso && (
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm hover:bg-gray-50"
                >
                  Fechar
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
