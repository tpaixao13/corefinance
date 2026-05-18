import { api } from './client';
import type { AuditoriaLog, Paginated } from '../types';

export const auditoriaApi = {
  listar: (page = 1, limit = 50, acao?: string) =>
    api
      .get<Paginated<AuditoriaLog>>('/auditoria', { params: { page, limit, acao } })
      .then((r) => r.data),
};
