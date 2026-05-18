import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contasPagarApi } from '../api/contasPagar';
import { useAuth } from '../contexts/AuthContext';
import type { CreateContaPagarPayload, UpdateContaPagarPayload } from '../types';

export function useContasPagar(page = 1, limit = 50, status?: string) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['contas-pagar', page, status],
    queryFn: () => contasPagarApi.listar(page, limit, status),
    enabled: isAuthenticated,
  });
}

export function useCriarContaPagar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateContaPagarPayload) => contasPagarApi.criar(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contas-pagar'] }),
  });
}

export function useAtualizarContaPagar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateContaPagarPayload }) =>
      contasPagarApi.atualizar(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contas-pagar'] }),
  });
}
