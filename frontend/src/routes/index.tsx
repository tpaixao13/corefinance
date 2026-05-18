import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

const Login = lazy(() => import('../pages/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Contas = lazy(() => import('../pages/Contas'));
const ImportarExtrato = lazy(() => import('../pages/ImportarExtrato'));
const Empresas = lazy(() => import('../pages/Empresas'));
const EmpresaView = lazy(() => import('../pages/EmpresaView'));
const EmpresaFormPage = lazy(() => import('../pages/EmpresaForm'));
const Auditoria = lazy(() => import('../pages/Auditoria'));
const Usuarios = lazy(() => import('../pages/Usuarios'));
const Despesas = lazy(() => import('../pages/Despesas'));
const Conciliacao = lazy(() => import('../pages/Conciliacao'));
const ContasPagar = lazy(() => import('../pages/ContasPagar'));
const ContasReceber = lazy(() => import('../pages/ContasReceber'));
const Permissoes = lazy(() => import('../pages/Permissoes'));
const Relatorios = lazy(() => import('../pages/Relatorios'));
const Dre = lazy(() => import('../pages/Dre'));
const RelatorioFinanceiro = lazy(() => import('../pages/RelatorioFinanceiro'));
const Exportacao = lazy(() => import('../pages/Exportacao'));
const EsqueciSenha = lazy(() => import('../pages/EsqueciSenha'));
const ResetSenha = lazy(() => import('../pages/ResetSenha'));
const OrdensServico = lazy(() => import('../pages/OrdensServico'));
const OrdemServicoView = lazy(() => import('../pages/OrdemServicoView'));
const Clientes = lazy(() => import('../pages/Clientes'));

function PrivateRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/esqueci-senha" element={<EsqueciSenha />} />
          </Route>

          {/* Reset de senha: acessível mesmo logado (token já é a autenticação) */}
          <Route path="/reset-senha" element={<ResetSenha />} />

          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="/contas" element={<Contas />} />
              <Route path="/importar" element={<ImportarExtrato />} />
              <Route path="/empresas" element={<Empresas />} />
              <Route path="/empresas/nova" element={<EmpresaFormPage />} />
              <Route path="/empresas/:id" element={<EmpresaView />} />
              <Route path="/empresas/:id/editar" element={<EmpresaFormPage />} />
              <Route path="/auditoria" element={<Auditoria />} />
              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/despesas" element={<Despesas />} />
              <Route path="/conciliacao" element={<Conciliacao />} />
              <Route path="/contas-pagar" element={<ContasPagar />} />
              <Route path="/contas-receber" element={<ContasReceber />} />
              <Route path="/permissoes" element={<Permissoes />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/dre" element={<Dre />} />
              <Route path="/relatorio-financeiro" element={<RelatorioFinanceiro />} />
              <Route path="/exportacao" element={<Exportacao />} />
              <Route path="/ordens-servico" element={<OrdensServico />} />
              <Route path="/ordens-servico/:id" element={<OrdemServicoView />} />
              <Route path="/clientes" element={<Clientes />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
