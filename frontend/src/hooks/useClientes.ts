import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientesApi } from '../api/clientes';
import type { CreateClientePayload, UpdateClientePayload } from '../types';

export function useBuscarClientes(q: string) {
  return useQuery({
    queryKey: ['clientes-busca', q],
    queryFn: () => clientesApi.buscar(q),
    enabled: q.trim().length >= 2,
    staleTime: 15_000,
  });
}

export function useListarClientes(page = 1, limit = 50, todos = false) {
  return useQuery({
    queryKey: ['clientes', page, limit, todos],
    queryFn: () => clientesApi.listar(page, limit, todos),
    staleTime: 30_000,
  });
}

export function useCriarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateClientePayload) => clientesApi.criar(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clientes'] });
      qc.invalidateQueries({ queryKey: ['clientes-busca'] });
    },
  });
}

export function useAtualizarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateClientePayload }) =>
      clientesApi.atualizar(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });
}

export function useInativarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientesApi.inativar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });
}
