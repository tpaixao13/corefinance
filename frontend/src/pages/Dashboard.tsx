import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertTriangle,
  GitMerge,
  CheckCheck,
  Clock,
  CalendarClock,
  BarChart2,
} from 'lucide-react';
import { contasApi } from '../api/contas';
import { useAuth } from '../contexts/AuthContext';
import { useEmpresa } from '../contexts/EmpresaContext';
import { useDashboardFinanceiro } from '../hooks/useDashboardFinanceiro';
import { useDashboardPrevisao, useDashboardFluxo, useDashboardSimulacao } from '../hooks/useDashboardAvancado';
import FiltroPeriodo, { type Periodo } from '../components/FiltroPeriodo';
import CardIndicador from '../components/CardIndicador';
import ResumoPorConta from '../components/ResumoPorConta';
import FluxoCaixaChart from '../components/FluxoCaixaChart';
import ResumoCaixaModal from '../components/ResumoCaixaModal';
import type { ContaBancaria } from '../types';

function isoHoje() {
  return new Date().toISOString().slice(0, 10);
}

function isoPrimeiroDiaDoMes() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function formatData(iso: string) {
  return iso.split('-').reverse().join('/');
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth();
  const { empresaAtiva } = useEmpresa();
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const hasEmpresa = isSuperAdmin ? !!empresaAtiva : true;

  const [contaId, setContaId] = useState('');
  const [periodo, setPeriodo] = useState<Periodo>({
    dataInicio: isoPrimeiroDiaDoMes(),
    dataFim: isoHoje(),
  });

  const { data: contas } = useQuery<ContaBancaria[]>({
    queryKey: ['contas', empresaAtiva?.id],
    queryFn: contasApi.listar,
    enabled: isAuthenticated && hasEmpresa,
  });

  // contaIdAtual é '' imediatamente quando a conta não pertence à empresa atual
  // (evita race condition do useEffect que só roda pós-render)
  const contaIdAtual = contas?.some((c) => c.id === contaId) ? contaId : '';

  // Seleciona a primeira conta automaticamente quando as contas carregam
  useEffect(() => {
    if (contas && contas.length > 0 && !contaIdAtual) {
      setContaId(contas[0].id);
    }
  }, [contas, contaIdAtual]);

  const [showResumoCaixa, setShowResumoCaixa] = useState(false);
  const [dataSimulacao, setDataSimulacao] = useState('');
  const [dataSimulacaoAtiva, setDataSimulacaoAtiva] = useState('');

  const { resumoConta, resumoEmpresa } = useDashboardFinanceiro(
    contaIdAtual,
    periodo,
    empresaAtiva?.id,
  );

  const empresaId = empresaAtiva?.id;
  const { data: dadosPrevisao } = useDashboardPrevisao(empresaId);
  const { data: dadosFluxo } = useDashboardFluxo(empresaId);
  const { data: dadosSimulacao, isLoading: simulacaoLoading } = useDashboardSimulacao(empresaId, dataSimulacaoAtiva);

  const contaAtiva = contas?.find((c) => c.id === contaIdAtual);
  const resumo = resumoConta.data;
  const empresa = resumoEmpresa.data;

  return (
    <div className="space-y-6">
      {/* ── Cabeçalho ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Financeiro</h2>
          {empresaAtiva && (
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <Building2 size={13} />
              {empresaAtiva.nome}
            </p>
          )}
        </div>
        <FiltroPeriodo value={periodo} onChange={setPeriodo} />
      </div>

      {/* ── Banner SUPER_ADMIN sem empresa ── */}
      {isSuperAdmin && !empresaAtiva && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-5 text-sm">
          <p className="font-semibold">Selecione uma empresa no topo para ver o dashboard.</p>
          <p className="text-xs mt-1 text-blue-500">Use o seletor de empresa no cabeçalho.</p>
        </div>
      )}

      {/* ── Resumo consolidado da empresa ── */}
      {empresa && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Contas Ativas</p>
            <p className="text-3xl font-bold text-gray-800">{empresa.totalContas}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Saldo Consolidado</p>
            <p className={`text-xl font-bold ${empresa.saldoTotal >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
              {brl(empresa.saldoTotal)}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Total Entradas</p>
            <p className="text-xl font-bold text-green-600">{brl(empresa.totalEntradas)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Total Saídas</p>
            <p className="text-xl font-bold text-red-600">{brl(empresa.totalSaidas)}</p>
          </div>
        </div>
      )}

      {/* ── Sem contas ── */}
      {hasEmpresa && contas && contas.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg p-4 text-sm">
          Nenhuma conta bancária cadastrada para esta empresa.
        </div>
      )}

      {/* ── Previsão ERP ── */}
      {hasEmpresa && empresaAtiva && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
            <h3 className="text-sm font-semibold text-gray-700">📊 Previsão (ERP)</h3>
            <span className="ml-auto text-xs text-gray-400">contas abertas</span>
          </div>
          {!dadosPrevisao ? (
            <p className="text-sm text-gray-400 animate-pulse">Carregando...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center justify-between sm:flex-col sm:items-start gap-1">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <TrendingUp size={12} className="text-green-500" />
                  A receber (em aberto)
                </span>
                <span className="text-base font-semibold text-green-600">{brl(dadosPrevisao.aReceber)}</span>
              </div>
              <div className="flex items-center justify-between sm:flex-col sm:items-start gap-1">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <TrendingDown size={12} className="text-red-400" />
                  A pagar (em aberto)
                </span>
                <span className="text-base font-semibold text-red-600">{brl(dadosPrevisao.aPagar)}</span>
              </div>
              <div className="flex items-center justify-between sm:flex-col sm:items-start gap-1">
                <span className="text-xs text-gray-500">Resultado futuro previsto</span>
                <span className={`text-base font-bold ${dadosPrevisao.resultado >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {brl(dadosPrevisao.resultado)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Fluxo de Caixa Projetado ── */}
      {hasEmpresa && empresaAtiva && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={16} className="text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-700">Fluxo de Caixa Projetado</h3>
            <span className="ml-auto text-xs text-gray-400">próximos 90 dias</span>
          </div>
          {!dadosFluxo ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm animate-pulse">
              Carregando projeção...
            </div>
          ) : (
            <FluxoCaixaChart dados={dadosFluxo} />
          )}
        </div>
      )}

      {/* ── Simulação de Saldo Futuro ── */}
      {hasEmpresa && empresaAtiva && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock size={16} className="text-violet-600" />
            <h3 className="text-sm font-semibold text-gray-700">Simulação de Saldo Futuro</h3>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Simular até</label>
              <input
                type="date"
                value={dataSimulacao}
                onChange={(e) => setDataSimulacao(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <button
              onClick={() => setDataSimulacaoAtiva(dataSimulacao)}
              disabled={!dataSimulacao}
              className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Simular
            </button>
          </div>

          {simulacaoLoading && (
            <p className="text-sm text-gray-400 mt-4 animate-pulse">Calculando...</p>
          )}

          {dadosSimulacao && !simulacaoLoading && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Saldo Atual</p>
                <p className={`text-sm font-bold ${dadosSimulacao.saldoAtual >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                  {brl(dadosSimulacao.saldoAtual)}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">+ Entradas previstas</p>
                <p className="text-sm font-bold text-green-600">{brl(dadosSimulacao.totalEntradas)}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">− Saídas previstas</p>
                <p className="text-sm font-bold text-red-600">{brl(dadosSimulacao.totalSaidas)}</p>
              </div>
              <div className={`rounded-lg p-3 ${dadosSimulacao.saldoProjetado >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <p className="text-xs text-gray-400 mb-1">Saldo Projetado</p>
                <p className={`text-sm font-bold ${dadosSimulacao.saldoProjetado >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {brl(dadosSimulacao.saldoProjetado)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Contas + detalhes ── */}
      {hasEmpresa && contas && contas.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de contas (seletor) */}
          <ResumoPorConta
            contas={contas}
            contaId={contaId}
            onSelect={setContaId}
          />

          {/* Detalhes da conta selecionada */}
          <div className="lg:col-span-2 space-y-4">
            {contaAtiva && (
              <p className="text-sm text-gray-500 flex flex-wrap gap-x-2">
                <span className="font-medium text-gray-700">{contaAtiva.banco}</span>
                <span>·</span>
                <span>Ag. {contaAtiva.agencia}</span>
                <span>·</span>
                <span>CC {contaAtiva.numero}</span>
                <span>·</span>
                <span>{formatData(periodo.dataInicio)} a {formatData(periodo.dataFim)}</span>
              </p>
            )}

            {resumoConta.isLoading && (
              <div className="text-center py-12 text-gray-400 text-sm">
                Carregando dados da conta...
              </div>
            )}

            {resumo && (
              <>
                {/* 4 Cards principais */}
                <div className="grid grid-cols-2 gap-3">
                  <CardIndicador
                    titulo="Saldo Inicial"
                    valor={resumo.saldoInicial}
                    icone={<Wallet size={16} />}
                    variante="default"
                    subtitulo="Saldo de abertura da conta"
                  />
                  <CardIndicador
                    titulo="Total Entradas"
                    valor={resumo.totalEntradas}
                    icone={<TrendingUp size={16} />}
                    variante="green"
                    subtitulo="Créditos no período"
                    onClick={() => navigate('/contas-receber?status=RECEBIDA')}
                  />
                  <CardIndicador
                    titulo="Total Saídas"
                    valor={resumo.totalSaidas}
                    icone={<TrendingDown size={16} />}
                    variante="red"
                    subtitulo="Débitos no período"
                    onClick={() => navigate('/contas-pagar?status=PAGA')}
                  />
                  <CardIndicador
                    titulo="Saldo Atual"
                    valor={resumo.saldoAtual}
                    icone={<Wallet size={16} />}
                    variante={resumo.saldoAtual >= 0 ? 'blue' : 'red'}
                    onClick={() => setShowResumoCaixa(true)}
                    badge={
                      resumo.totalPendentes > 0
                        ? { texto: `${resumo.totalPendentes} pendentes`, cor: 'bg-yellow-100 text-yellow-700' }
                        : undefined
                    }
                  />
                </div>

                {/* Alerta de diferença de conciliação */}
                {Math.abs(resumo.diferenca) > 0.01 && (
                  <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-xl px-5 py-4 text-sm">
                    <AlertTriangle size={18} className="shrink-0" />
                    <div>
                      <p className="font-semibold">Diferença de conciliação detectada</p>
                      <p className="text-xs mt-0.5">
                        Saldo calculado: {brl(resumo.saldoCalculado)} · Diferença: {brl(resumo.diferenca)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Status de conciliação */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <GitMerge size={15} className="text-blue-600" />
                    Status de Conciliação
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div
                      className="text-center p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                      onClick={() => navigate('/conciliacao?status=CONCILIADO')}
                    >
                      <p className="text-2xl font-bold text-green-700">{resumo.totalConciliados}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <CheckCheck size={11} className="text-green-500" />
                        <p className="text-xs text-green-600 font-medium">Conciliados</p>
                      </div>
                    </div>
                    <div
                      className="text-center p-3 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
                      onClick={() => navigate('/conciliacao?status=PENDENTE')}
                    >
                      <p className="text-2xl font-bold text-yellow-700">{resumo.totalPendentes}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Clock size={11} className="text-yellow-500" />
                        <p className="text-xs text-yellow-600 font-medium">Pendentes</p>
                      </div>
                    </div>
                    <div
                      className="text-center p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                      onClick={() => navigate('/conciliacao?status=NAO_ENCONTRADO')}
                    >
                      <p className="text-2xl font-bold text-red-700">{resumo.totalNaoEncontrados}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <AlertTriangle size={11} className="text-red-400" />
                        <p className="text-xs text-red-600 font-medium">Não encontrados</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {showResumoCaixa && resumo && contaAtiva && (
        <ResumoCaixaModal
          resumo={resumo}
          conta={contaAtiva}
          periodo={periodo}
          onClose={() => setShowResumoCaixa(false)}
        />
      )}
    </div>
  );
}
