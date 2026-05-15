import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientesApi } from '../api/clientes';
import type { CreateClientePayload } from '../types';

export function useBuscarClientes(q: string) {
  return useQuery({
    queryKey: ['clientes-busca', q],
    queryFn: () => clientesApi.buscar(q),
    enabled: q.trim().length >= 2,
    staleTime: 15_000,
  });
}

export function useCriarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateClientePayload) => clientesApi.criar(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes-busca'] }),
  });
}
