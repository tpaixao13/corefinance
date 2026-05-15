import type { OrdemServico, Empresa, StatusOrdemServico } from '../types';

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

interface Props {
  os: OrdemServico;
  empresa: Pick<Empresa, 'nome' | 'cnpj' | 'logoUrl'>;
}

export default function OrdemServicoDocumento({ os, empresa }: Props) {
  return (
    <div className="os-documento bg-white rounded-xl border border-gray-200 overflow-hidden print:border-0 print:rounded-none print:shadow-none">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-8 py-6 print:px-6 print:py-4" style={{ backgroundColor: '#0B2A4A' }}>
        <div>
          {empresa.logoUrl ? (
            <img
              src={empresa.logoUrl}
              alt="Logo"
              className="h-16 max-w-[180px] object-contain bg-white rounded p-1"
            />
          ) : (
            <div className="text-white font-bold text-xl">{empresa.nome}</div>
          )}
        </div>
        <div className="text-right text-white">
          <div className="text-xs tracking-widest opacity-70 uppercase mb-1">Ordem de Serviço</div>
          <div className="text-2xl font-bold font-mono">Nº {String(os.numero).padStart(6, '0')}</div>
        </div>
      </div>

      {/* Corpo */}
      <div className="px-8 py-6 space-y-6 print:px-6 print:py-4 print:space-y-4">
        {/* Empresa */}
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 border-b border-gray-100 pb-1">
            Empresa Prestadora
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400">Razão Social</p>
              <p className="text-sm font-semibold text-gray-800">{empresa.nome}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">CNPJ</p>
              <p className="text-sm font-semibold text-gray-800">{empresa.cnpj}</p>
            </div>
          </div>
        </section>

        {/* Cliente */}
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 border-b border-gray-100 pb-1">
            Cliente
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400">Nome</p>
              <p className="text-sm font-semibold text-gray-800">{os.cliente}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">E-mail</p>
              <p className="text-sm font-semibold text-gray-800">{os.emailCliente ?? '—'}</p>
            </div>
          </div>
        </section>

        {/* Dados da OS */}
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 border-b border-gray-100 pb-1">
            Dados da Ordem
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-400">Data de Abertura</p>
              <p className="text-sm font-semibold text-gray-800">{fmtData(os.dataAbertura)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Data de Conclusão</p>
              <p className="text-sm font-semibold text-gray-800">{fmtData(os.dataConclusao)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Status</p>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COR[os.status]}`}>
                {STATUS_LABEL[os.status]}
              </span>
            </div>
          </div>
        </section>

        {/* Descrição */}
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 border-b border-gray-100 pb-1">
            Descrição do Serviço
          </p>
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {os.descricao}
          </div>
        </section>

        {/* Valor */}
        <div className="text-right border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Valor Total</p>
          <p className="text-3xl font-bold text-gray-900" style={{ color: '#0B2A4A' }}>
            {fmtMoeda(Number(os.valor))}
          </p>
        </div>
      </div>

      {/* Rodapé */}
      <div className="px-8 py-3 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-400 print:px-6">
        Documento gerado em {new Date().toLocaleDateString('pt-BR')} — CoreFinance
      </div>
    </div>
  );
}
