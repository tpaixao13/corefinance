import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard';
import { useAuth } from '../contexts/AuthContext';
import type { Periodo } from '../components/FiltroPeriodo';

export function useDashboardFinanceiro(
  contaId: string,
  periodo: Periodo,
  empresaAtivaId: string | undefined,
) {
  const { user, isAuthenticated } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const hasEmpresa = isSuperAdmin ? !!empresaAtivaId : true;

  const resumoConta = useQuery({
    queryKey: ['dashboard', 'conta', contaId, periodo.dataInicio, periodo.dataFim],
    queryFn: () => dashboardApi.resumoConta(contaId, periodo.dataInicio, periodo.dataFim),
    enabled: isAuthenticated && !!contaId,
  });

  const resumoEmpresa = useQuery({
    queryKey: ['dashboard', 'empresa', empresaAtivaId],
    queryFn: dashboardApi.resumoEmpresa,
    enabled: isAuthenticated && hasEmpresa,
  });

  const resumoTodasEmpresas = useQuery({
    queryKey: ['dashboard', 'empresas'],
    queryFn: dashboardApi.resumoTodasEmpresas,
    enabled: isAuthenticated && isSuperAdmin && !empresaAtivaId,
  });

  return { resumoConta, resumoEmpresa, resumoTodasEmpresas };
}
