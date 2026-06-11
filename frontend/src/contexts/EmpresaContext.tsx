import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Empresa } from '../types';
import { useAuth } from './AuthContext';
import { empresaApi } from '../api/empresa';

interface EmpresaContextValue {
  empresaAtiva: Empresa | null;
  setEmpresaAtiva: (empresa: Empresa) => void;
}

const EmpresaContext = createContext<EmpresaContextValue | null>(null);

export function EmpresaProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [empresaAtiva, setEmpresaAtivaState] = useState<Empresa | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (empresaAtiva) return;

    // ADMIN_EMPRESA/USUARIO: usa o empresaId do próprio JWT
    // SUPER_ADMIN: tenta restaurar o último selecionado do localStorage
    const empresaIdToLoad = user?.empresaId ?? localStorage.getItem('empresaId');
    if (!empresaIdToLoad) return;

    empresaApi.buscar(empresaIdToLoad)
      .then(setEmpresaAtivaState)
      .catch(() => {});
  }, [isAuthenticated, user?.empresaId]);

  const setEmpresaAtiva = useCallback((empresa: Empresa) => {
    localStorage.setItem('empresaId', empresa.id);
    setEmpresaAtivaState(empresa);
    // Invalida todo o cache para que os dados da nova empresa sejam buscados
    queryClient.invalidateQueries();
  }, [queryClient]);

  return (
    <EmpresaContext.Provider value={{ empresaAtiva, setEmpresaAtiva }}>
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa() {
  const ctx = useContext(EmpresaContext);
  if (!ctx) throw new Error('useEmpresa deve ser usado dentro de EmpresaProvider');
  return ctx;
}
