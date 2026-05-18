import { api } from './client';
import type {
  ContaReceber,
  CreateContaReceberPayload,
  UpdateContaReceberPayload,
  Paginated,
} from '../types';

export const contasReceberApi = {
  listar: (page = 1, limit = 50, status?: string) =>
    api
      .get<Paginated<ContaReceber>>('/contas-receber', { params: { page, limit, ...(status ? { status } : {}) } })
      .then((r) => r.data),

  criar: (dto: CreateContaReceberPayload) =>
    api.post<ContaReceber>('/contas-receber', dto).then((r) => r.data),

  atualizar: (id: string, dto: UpdateContaReceberPayload) =>
    api.put<ContaReceber>(`/contas-receber/${id}`, dto).then((r) => r.data),
};
