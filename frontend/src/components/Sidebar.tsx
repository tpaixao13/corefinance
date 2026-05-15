import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Landmark,
  Upload,
  Building2,
  Shield,
  Users,
  TrendingDown,
  TrendingUp,
  GitMerge,
  Receipt,
  ShieldCheck,
  BarChart2,
  FileText,
  Download,
  LogOut,
  ClipboardList,
  UserRound,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissoesCtx } from '../contexts/PermissoesContext';

const navCls = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  }`;

const subNavCls = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 pl-7 pr-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
  }`;

function GroupLabel({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors"
    >
      {label}
      <ChevronDown
        size={13}
        className={`transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`}
      />
    </button>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { temPermissao } = usePermissoesCtx();

  const [openCadastros, setOpenCadastros] = useState(true);
  const [openFinanceiro, setOpenFinanceiro] = useState(true);
  const [openOperacional, setOpenOperacional] = useState(true);
  const [openAdmin, setOpenAdmin] = useState(true);

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_EMPRESA';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const temCadastros =
    isSuperAdmin ||
    temPermissao('CLIENTE_VIEW') ||
    temPermissao('CONTA_BANCARIA_VIEW');

  const temFinanceiro =
    temPermissao('CONTAS_PAGAR_VIEW') ||
    temPermissao('CONTAS_RECEBER_VIEW') ||
    temPermissao('CONCILIACAO_EXECUTAR') ||
    temPermissao('EXTRATO_IMPORT');

  const temOperacional = temPermissao('ORDEM_SERVICO_VIEW');

  const temAdminArea = isAdmin && (temPermissao('AUDITORIA_VIEW') || isSuperAdmin);

  return (
    <aside className="w-64 text-white flex flex-col min-h-screen" style={{ backgroundColor: '#0B2A4A' }}>
      {/* Logo */}
      <div className="flex items-center justify-center py-4 px-6 border-b border-white/10">
        <img src="/logo.png?v=4" alt="TDGenFin" className="w-auto object-contain brightness-0 invert" style={{ height: '90px' }} />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Dashboard */}
        {temPermissao('DASHBOARD_VIEW') && (
          <NavLink to="/" end className={navCls}>
            <LayoutDashboard size={18} />Dashboard
          </NavLink>
        )}

        <div className="pt-2" />

        {/* ── Cadastros ── */}
        {temCadastros && (
          <>
            <GroupLabel label="Cadastros" open={openCadastros} onToggle={() => setOpenCadastros((v) => !v)} />
            {openCadastros && (
              <div className="space-y-0.5">
                {isSuperAdmin && (
                  <NavLink to="/empresas" className={subNavCls}>
                    <Building2 size={16} />Empresas
                  </NavLink>
                )}
                {isAdmin && (
                  <NavLink to="/usuarios" className={subNavCls}>
                    <Users size={16} />Usuários
                  </NavLink>
                )}
                {temPermissao('CONTA_BANCARIA_VIEW') && (
                  <NavLink to="/contas" className={subNavCls}>
                    <Landmark size={16} />Contas Bancárias
                  </NavLink>
                )}
                {temPermissao('CLIENTE_VIEW') && (
                  <NavLink to="/clientes" className={subNavCls}>
                    <UserRound size={16} />Clientes
                  </NavLink>
                )}
              </div>
            )}
          </>
        )}

        <div className="pt-2" />

        {/* ── Financeiro ── */}
        {temFinanceiro && (
          <>
            <GroupLabel label="Financeiro" open={openFinanceiro} onToggle={() => setOpenFinanceiro((v) => !v)} />
            {openFinanceiro && (
              <div className="space-y-0.5">
                {temPermissao('CONTAS_PAGAR_VIEW') && (
                  <NavLink to="/contas-pagar" className={subNavCls}>
                    <Receipt size={16} />Contas a Pagar
                  </NavLink>
                )}
                {temPermissao('CONTAS_RECEBER_VIEW') && (
                  <NavLink to="/contas-receber" className={subNavCls}>
                    <TrendingUp size={16} />Contas a Receber
                  </NavLink>
                )}
                {temPermissao('EXTRATO_IMPORT') && (
                  <NavLink to="/importar" className={subNavCls}>
                    <Upload size={16} />Importar Extrato
                  </NavLink>
                )}
                {temPermissao('CONCILIACAO_EXECUTAR') && (
                  <NavLink to="/conciliacao" className={subNavCls}>
                    <GitMerge size={16} />Conciliação
                  </NavLink>
                )}
                <NavLink to="/despesas" className={subNavCls}>
                  <TrendingDown size={16} />Despesas
                </NavLink>
                <NavLink to="/dre" className={subNavCls}>
                  <TrendingUp size={16} />DRE
                </NavLink>
                <NavLink to="/relatorio-financeiro" className={subNavCls}>
                  <FileText size={16} />Rel. Financeiro
                </NavLink>
                {isAdmin && (
                  <NavLink to="/exportacao" className={subNavCls}>
                    <Download size={16} />Exportação
                  </NavLink>
                )}
              </div>
            )}
          </>
        )}

        <div className="pt-2" />

        {/* ── Operacional ── */}
        {temOperacional && (
          <>
            <GroupLabel label="Operacional" open={openOperacional} onToggle={() => setOpenOperacional((v) => !v)} />
            {openOperacional && (
              <div className="space-y-0.5">
                <NavLink to="/ordens-servico" className={subNavCls}>
                  <ClipboardList size={16} />Ordens de Serviço
                </NavLink>
              </div>
            )}
          </>
        )}

        <div className="pt-2" />

        {/* ── Administração ── */}
        {temAdminArea && (
          <>
            <GroupLabel label="Administração" open={openAdmin} onToggle={() => setOpenAdmin((v) => !v)} />
            {openAdmin && (
              <div className="space-y-0.5">
                {temPermissao('AUDITORIA_VIEW') && (
                  <NavLink to="/auditoria" className={subNavCls}>
                    <Shield size={16} />Auditoria
                  </NavLink>
                )}
                {isSuperAdmin && (
                  <NavLink to="/permissoes" className={subNavCls}>
                    <ShieldCheck size={16} />Permissões
                  </NavLink>
                )}
                {isSuperAdmin && (
                  <NavLink to="/relatorios" className={subNavCls}>
                    <BarChart2 size={16} />Relatórios (Admin)
                  </NavLink>
                )}
              </div>
            )}
          </>
        )}
      </nav>

      {/* Rodapé */}
      <div className="px-3 py-4 border-t border-slate-700 shrink-0">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium text-white truncate">{user?.nome}</p>
          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          <span className="inline-block mt-1 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
            {user?.role}
          </span>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}
