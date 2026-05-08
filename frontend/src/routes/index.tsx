import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Contas from '../pages/Contas';
import ImportarExtrato from '../pages/ImportarExtrato';
import Empresas from '../pages/Empresas';
import Auditoria from '../pages/Auditoria';
import Usuarios from '../pages/Usuarios';
import Despesas from '../pages/Despesas';

function PrivateRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/contas" element={<Contas />} />
            <Route path="/importar" element={<ImportarExtrato />} />
            <Route path="/empresas" element={<Empresas />} />
            <Route path="/auditoria" element={<Auditoria />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/despesas" element={<Despesas />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
