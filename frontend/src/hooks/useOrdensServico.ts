import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordensServicoApi } from '../api/ordensServico';
import type { CreateOrdemServicoPayload, UpdateOrdemServicoPayload } from '../types';

const KEY = 'ordens-servico';

export function useOrdensServico(page = 1, limit = 50) {
  return useQuery({
    queryKey: [KEY, page, limit],
    queryFn: () => ordensServicoApi.listar(page, limit),
    staleTime: 30_000,
  });
}

export function useCriarOrdemServico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateOrdemServicoPayload) => ordensServicoApi.criar(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useAtualizarOrdemServico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateOrdemServicoPayload }) =>
      ordensServicoApi.atualizar(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useFinalizarOrdemServico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dataConclusao }: { id: string; dataConclusao: string }) =>
      ordensServicoApi.finalizar(id, dataConclusao),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useCancelarOrdemServico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ordensServicoApi.cancelar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useEnviarEmailOs() {
  return useMutation({
    mutationFn: ({ id, email }: { id: string; email?: string }) =>
      ordensServicoApi.enviarEmail(id, email),
  });
}
