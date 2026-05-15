import { api } from './client';
import type {
  OrdemServico,
  CreateOrdemServicoPayload,
  UpdateOrdemServicoPayload,
  Paginated,
} from '../types';

export const ordensServicoApi = {
  listar: (page = 1, limit = 50): Promise<Paginated<OrdemServico>> =>
    api.get('/ordens-servico', { params: { page, limit } }).then((r) => r.data),

  buscarPorId: (id: string): Promise<OrdemServico> =>
    api.get(`/ordens-servico/${id}`).then((r) => r.data),

  criar: (dto: CreateOrdemServicoPayload): Promise<OrdemServico> =>
    api.post('/ordens-servico', dto).then((r) => r.data),

  atualizar: (id: string, dto: UpdateOrdemServicoPayload): Promise<OrdemServico> =>
    api.put(`/ordens-servico/${id}`, dto).then((r) => r.data),

  finalizar: (id: string, dataConclusao: string): Promise<OrdemServico> =>
    api.patch(`/ordens-servico/${id}/finalizar`, { dataConclusao }).then((r) => r.data),

  cancelar: (id: string): Promise<OrdemServico> =>
    api.patch(`/ordens-servico/${id}/cancelar`).then((r) => r.data),

  enviarEmail: (id: string, email?: string): Promise<{ enviado: boolean; para: string }> =>
    api.post(`/ordens-servico/${id}/enviar-email`, { email }).then((r) => r.data),
};
