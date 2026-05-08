import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Landmark,
  Upload,
  Building2,
  Shield,
  Users,
  TrendingDown,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/contas', icon: Landmark, label: 'Contas' },
  { to: '/importar', icon: Upload, label: 'Importar Extrato' },
  { to: '/despesas', icon: TrendingDown, label: 'Despesas' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 text-white flex flex-col min-h-screen" style={{ backgroundColor: '#0B2A4A' }}>
      {/* Logo */}
      <div className="flex items-center justify-center py-4 px-6 border-b border-white/10">
        <img src="/logo.png" alt="TDGenFin" className="w-full h-auto object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        {/* Usuários — SUPER_ADMIN e ADMIN_EMPRESA */}
        {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_EMPRESA') && (
          <NavLink
            to="/usuarios"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Users size={18} />
            Usuários
          </NavLink>
        )}

        {/* Auditoria — SUPER_ADMIN e ADMIN_EMPRESA */}
        {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_EMPRESA') && (
          <NavLink
            to="/auditoria"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Shield size={18} />
            Auditoria
          </NavLink>
        )}

        {/* Empresas — apenas SUPER_ADMIN */}
        {user?.role === 'SUPER_ADMIN' && (
          <NavLink
            to="/empresas"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Building2 size={18} />
            Empresas
          </NavLink>
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
