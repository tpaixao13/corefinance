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
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissoesCtx } from '../contexts/PermissoesContext';


const navCls = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  }`;

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { temPermissao } = usePermissoesCtx();

  return (
    <aside className="w-64 text-white flex flex-col min-h-screen" style={{ backgroundColor: '#0B2A4A' }}>
      {/* Logo */}
      <div className="flex items-center justify-center py-4 px-6 border-b border-white/10">
        <img src="/logo.png?v=4" alt="TDGenFin" className="w-auto object-contain brightness-0 invert" style={{ height: '90px' }} />
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {temPermissao('DASHBOARD_VIEW') && (
          <NavLink to="/" end className={navCls}><LayoutDashboard size={18} />Dashboard</NavLink>
        )}

        <NavLink to="/contas" className={navCls}><Landmark size={18} />Contas</NavLink>

        {temPermissao('EXTRATO_IMPORT') && (
          <NavLink to="/importar" className={navCls}><Upload size={18} />Importar Extrato</NavLink>
        )}

        <NavLink to="/despesas" className={navCls}><TrendingDown size={18} />Despesas</NavLink>

        {temPermissao('CONTAS_PAGAR_VIEW') && (
          <NavLink to="/contas-pagar" className={navCls}><Receipt size={18} />Contas a Pagar</NavLink>
        )}

        {temPermissao('CONTAS_RECEBER_VIEW') && (
          <NavLink to="/contas-receber" className={navCls}><TrendingUp size={18} />Contas a Receber</NavLink>
        )}

        {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_EMPRESA') && temPermissao('CONCILIACAO_EXECUTAR') && (
          <NavLink to="/conciliacao" className={navCls}><GitMerge size={18} />Conciliação</NavLink>
        )}

        {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_EMPRESA') && (
          <NavLink to="/usuarios" className={navCls}><Users size={18} />Usuários</NavLink>
        )}

        {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_EMPRESA') && temPermissao('AUDITORIA_VIEW') && (
          <NavLink to="/auditoria" className={navCls}><Shield size={18} />Auditoria</NavLink>
        )}

        {user?.role === 'SUPER_ADMIN' && (
          <NavLink to="/permissoes" className={navCls}><ShieldCheck size={18} />Permissões</NavLink>
        )}

        <NavLink to="/dre" className={navCls}><TrendingUp size={18} />DRE</NavLink>

        <NavLink to="/relatorio-financeiro" className={navCls}><FileText size={18} />Rel. Financeiro</NavLink>

        {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_EMPRESA') && (
          <NavLink to="/exportacao" className={navCls}><Download size={18} />Exportação</NavLink>
        )}

        {user?.role === 'SUPER_ADMIN' && (
          <NavLink to="/relatorios" className={navCls}><BarChart2 size={18} />Permissões (Rel.)</NavLink>
        )}

        {user?.role === 'SUPER_ADMIN' && (
          <NavLink to="/empresas" className={navCls}><Building2 size={18} />Empresas</NavLink>
        )}
      </nav>

      {/* Rodapé com usuário */}
      <div className="px-3 py-4 border-t border-slate-700">
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
