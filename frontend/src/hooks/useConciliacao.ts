import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conciliacaoApi } from '../api/conciliacao';
import { useAuth } from '../contexts/AuthContext';

export function usePendentes(contaId: string, page = 1) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['conciliacao', 'pendentes', contaId, page],
    queryFn: () => conciliacaoApi.listarPendentes(contaId, page, 50),
    enabled: isAuthenticated && !!contaId,
  });
}

export function useConciliarManual(contaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lancamentoExtratoId, observacao }: { lancamentoExtratoId: string; observacao?: string }) =>
      conciliacaoApi.conciliarManual(contaId, lancamentoExtratoId, observacao),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conciliacao', 'pendentes', contaId] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['despesas'] });
      qc.invalidateQueries({ queryKey: ['dre'] });
      qc.invalidateQueries({ queryKey: ['relatorio-financeiro'] });
    },
  });
}

export function usePreviewAutomatica(contaId: string) {
  return useMutation({
    mutationFn: () => conciliacaoApi.previewAutomatica(contaId),
  });
}

export function useConfirmarAutomatica(contaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (matches: Array<{ lancamentoId: string; contaErpId: string; tipo: 'PAGAR' | 'RECEBER' }>) =>
      conciliacaoApi.confirmarAutomatica(contaId, matches),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conciliacao', 'pendentes', contaId] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['despesas'] });
      qc.invalidateQueries({ queryKey: ['contas-pagar'] });
      qc.invalidateQueries({ queryKey: ['contas-receber'] });
      qc.invalidateQueries({ queryKey: ['dre'] });
      qc.invalidateQueries({ queryKey: ['relatorio-financeiro'] });
    },
  });
}

export function useVincularErp(contaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ extratoId, contaErpId, tipo }: { extratoId: string; contaErpId: string; tipo: 'PAGAR' | 'RECEBER' }) =>
      conciliacaoApi.vincularErp(extratoId, contaErpId, tipo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conciliacao', 'pendentes', contaId] });
      qc.invalidateQueries({ queryKey: ['contas-pagar'] });
      qc.invalidateQueries({ queryKey: ['contas-receber'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
