import { api } from './client';
import type {
  ContaPagar,
  CreateContaPagarPayload,
  UpdateContaPagarPayload,
  Paginated,
} from '../types';

export const contasPagarApi = {
  listar: (page = 1, limit = 50, status?: string) =>
    api
      .get<Paginated<ContaPagar>>('/contas-pagar', { params: { page, limit, ...(status ? { status } : {}) } })
      .then((r) => r.data),

  criar: (dto: CreateContaPagarPayload) =>
    api.post<ContaPagar>('/contas-pagar', dto).then((r) => r.data),

  atualizar: (id: string, dto: UpdateContaPagarPayload) =>
    api.put<ContaPagar>(`/contas-pagar/${id}`, dto).then((r) => r.data),
};
