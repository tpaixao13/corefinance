import { useState } from 'react';
import { Users, Plus, Search, Pencil, UserX, UserCheck, X } from 'lucide-react';
import { useListarClientes, useCriarCliente, useAtualizarCliente, useInativarCliente } from '../hooks/useClientes';
import { usePermissoesCtx } from '../contexts/PermissoesContext';
import type { Cliente, CreateClientePayload, UpdateClientePayload } from '../types';

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

function maskCpfCnpj(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 14);
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return d
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

function maskTelefone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d)/, '($1) $2-$3');
  return d.replace(/^(\d{2})(\d{5})(\d)/, '($1) $2-$3');
}

const VAZIO: CreateClientePayload = { nome: '', cpfCnpj: '', email: '', telefone: '', endereco: '' };

interface FormModalProps {
  inicial: Partial<CreateClientePayload>;
  titulo: string;
  onSalvar: (dto: CreateClientePayload) => void;
  onFechar: () => void;
  salvando: boolean;
  erro: string;
}

function FormModal({ inicial, titulo, onSalvar, onFechar, salvando, erro }: FormModalProps) {
  const [form, setForm] = useState<CreateClientePayload>({ ...VAZIO, ...inicial });

  function set(field: keyof CreateClientePayload, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSalvar(form);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">{titulo}</h3>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{erro}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.nome}
              onChange={(e) => set('nome', e.target.value)}
              placeholder="Nome completo ou razão social"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF / CNPJ</label>
              <input
                type="text"
                value={form.cpfCnpj ?? ''}
                onChange={(e) => set('cpfCnpj', maskCpfCnpj(e.target.value))}
                placeholder="000.000.000-00"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                type="text"
                value={form.telefone ?? ''}
                onChange={(e) => set('telefone', maskTelefone(e.target.value))}
                placeholder="(00) 00000-0000"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              value={form.email ?? ''}
              onChange={(e) => set('email', e.target.value)}
              placeholder="cliente@email.com"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
            <input
              type="text"
              value={form.endereco ?? ''}
              onChange={(e) => set('endereco', e.target.value)}
              placeholder="Rua, número, bairro, cidade"
              className={inputCls}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onFechar}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ClientesPage() {
  const { temPermissao } = usePermissoesCtx();
  const [busca, setBusca] = useState('');
  const [page, setPage] = useState(1);
  const [verTodos, setVerTodos] = useState(false);
  const [modalNovo, setModalNovo] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [confirmInativar, setConfirmInativar] = useState<Cliente | null>(null);
  const [erroModal, setErroModal] = useState('');

  const { data, isLoading } = useListarClientes(page, 50, verTodos);
  const { mutate: criar, isPending: criando } = useCriarCliente();
  const { mutate: atualizar, isPending: atualizando } = useAtualizarCliente();
  const { mutate: inativar, isPending: inativando } = useInativarCliente();

  const clientes = data?.data ?? [];
  const total = data?.total ?? 0;

  const filtrados = busca.trim()
    ? clientes.filter(
        (c) =>
          c.nome.toLowerCase().includes(busca.toLowerCase()) ||
          (c.cpfCnpj ?? '').includes(busca) ||
          (c.email ?? '').toLowerCase().includes(busca.toLowerCase()),
      )
    : clientes;

  function handleCriar(dto: CreateClientePayload) {
    setErroModal('');
    criar(dto, {
      onSuccess: () => setModalNovo(false),
      onError: (err: unknown) => {
        const msg = (err as any).response?.data?.message;
        setErroModal(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Erro ao criar cliente');
      },
    });
  }

  function handleAtualizar(dto: CreateClientePayload) {
    if (!editando) return;
    setErroModal('');
    const payload: UpdateClientePayload = {
      nome: dto.nome,
      cpfCnpj: dto.cpfCnpj,
      email: dto.email,
      telefone: dto.telefone,
      endereco: dto.endereco,
    };
    atualizar(
      { id: editando.id, dto: payload },
      {
        onSuccess: () => setEditando(null),
        onError: (err: unknown) => {
          const msg = (err as any).response?.data?.message;
          setErroModal(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Erro ao atualizar cliente');
        },
      },
    );
  }

  function handleInativar() {
    if (!confirmInativar) return;
    inativar(confirmInativar.id, {
      onSuccess: () => setConfirmInativar(null),
      onError: (err: unknown) => {
        const msg = (err as any).response?.data?.message;
        alert(msg ?? 'Erro ao inativar cliente');
        setConfirmInativar(null);
      },
    });
  }

  const podeCriar = temPermissao('CLIENTE_CREATE');
  const podeEditar = temPermissao('CLIENTE_EDIT');
  const podeInativar = temPermissao('CLIENTE_INATIVAR');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users size={22} className="text-gray-600" />
          <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
          {total > 0 && (
            <span className="text-sm text-gray-400 font-normal">({total} total)</span>
          )}
        </div>
        {podeCriar && (
          <button
            onClick={() => { setErroModal(''); setModalNovo(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Novo Cliente
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, CPF/CNPJ ou e-mail..."
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={verTodos}
            onChange={(e) => { setVerTodos(e.target.checked); setPage(1); }}
            className="w-4 h-4 accent-blue-600"
          />
          Incluir inativos
        </label>
      </div>

      {/* Tabela */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-gray-400">Carregando...</div>
        ) : filtrados.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            {busca ? 'Nenhum cliente encontrado para a busca.' : 'Nenhum cliente cadastrado.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">CPF / CNPJ</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">E-mail</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Telefone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrados.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{c.nome}</td>
                  <td className="px-4 py-3 text-gray-600">{c.cpfCnpj ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.telefone ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.ativo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {c.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      {podeEditar && (
                        <button
                          onClick={() => { setErroModal(''); setEditando(c); }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                      )}
                      {podeInativar && c.ativo && (
                        <button
                          onClick={() => setConfirmInativar(c)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Inativar"
                        >
                          <UserX size={15} />
                        </button>
                      )}
                      {podeInativar && !c.ativo && (
                        <button
                          onClick={() => atualizar({ id: c.id, dto: { nome: c.nome } })}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Reativar"
                        >
                          <UserCheck size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginação */}
      {total > 50 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Exibindo {(page - 1) * 50 + 1}–{Math.min(page * 50, total)} de {total}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Anterior
            </button>
            <button
              disabled={page * 50 >= total}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {/* Modal novo cliente */}
      {modalNovo && (
        <FormModal
          titulo="Novo Cliente"
          inicial={VAZIO}
          onSalvar={handleCriar}
          onFechar={() => setModalNovo(false)}
          salvando={criando}
          erro={erroModal}
        />
      )}

      {/* Modal editar */}
      {editando && (
        <FormModal
          titulo="Editar Cliente"
          inicial={{
            nome: editando.nome,
            cpfCnpj: editando.cpfCnpj ?? '',
            email: editando.email ?? '',
            telefone: editando.telefone ?? '',
            endereco: editando.endereco ?? '',
          }}
          onSalvar={handleAtualizar}
          onFechar={() => setEditando(null)}
          salvando={atualizando}
          erro={erroModal}
        />
      )}

      {/* Confirmação inativar */}
      {confirmInativar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-semibold text-gray-800">Inativar cliente</h3>
            <p className="text-sm text-gray-600">
              Tem certeza que deseja inativar <strong>{confirmInativar.nome}</strong>?
              O cliente não poderá ser vinculado a novas OS ou Contas a Receber.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmInativar(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleInativar}
                disabled={inativando}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-medium"
              >
                {inativando ? 'Inativando...' : 'Inativar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
