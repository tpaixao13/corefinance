import { api } from './client';
import type { Cliente, CreateClientePayload, Paginated } from '../types';

export const clientesApi = {
  buscar: (q: string): Promise<Cliente[]> =>
    api.get('/clientes/buscar', { params: { q } }).then((r) => r.data),

  listar: (page = 1, limit = 50): Promise<Paginated<Cliente>> =>
    api.get('/clientes', { params: { page, limit } }).then((r) => r.data),

  criar: (dto: CreateClientePayload): Promise<Cliente> =>
    api.post('/clientes', dto).then((r) => r.data),

  atualizar: (id: string, dto: Partial<CreateClientePayload>): Promise<Cliente> =>
    api.put(`/clientes/${id}`, dto).then((r) => r.data),
};
