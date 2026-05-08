import { api } from './client';
import type { Lancamento, Paginated } from '../types';

export const despesasApi = {
  listar: (contaId: string, page = 1, limit = 50) =>
    api
      .get<Paginated<Lancamento>>(`/extratos/lancamentos/${contaId}`, {
        params: { page, limit },
      })
      .then((r) => r.data),
};
