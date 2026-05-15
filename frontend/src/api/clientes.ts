import { api } from './client';
import type { Cliente, CreateClientePayload, UpdateClientePayload, Paginated } from '../types';

export const clientesApi = {
  buscar: (q: string): Promise<Cliente[]> =>
    api.get('/clientes/buscar', { params: { q } }).then((r) => r.data),

  listar: (page = 1, limit = 50, todos = false): Promise<Paginated<Cliente>> =>
    api.get('/clientes', { params: { page, limit, todos: todos ? 'true' : undefined } }).then((r) => r.data),

  buscarPorId: (id: string): Promise<Cliente> =>
    api.get(`/clientes/${id}`).then((r) => r.data),

  criar: (dto: CreateClientePayload): Promise<Cliente> =>
    api.post('/clientes', dto).then((r) => r.data),

  atualizar: (id: string, dto: UpdateClientePayload): Promise<Cliente> =>
    api.put(`/clientes/${id}`, dto).then((r) => r.data),

  inativar: (id: string): Promise<Cliente> =>
    api.patch(`/clientes/${id}/inativar`).then((r) => r.data),
};
