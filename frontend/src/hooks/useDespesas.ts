import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { despesasApi } from '../api/despesas';
import { useAuth } from '../contexts/AuthContext';

export function useDespesas(contaId: string, page = 1, limit = 50) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['despesas', contaId, page],
    queryFn: () => despesasApi.listar(contaId, page, limit),
    enabled: isAuthenticated && !!contaId,
  });
}

export function useExcluirLancamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => despesasApi.excluir(id),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
