import { useState, useRef, useEffect } from 'react';
import { Search, X, UserPlus } from 'lucide-react';
import { useBuscarClientes, useCriarCliente } from '../hooks/useClientes';
import type { Cliente } from '../types';

interface Props {
  value: Cliente | null;
  onChange: (c: Cliente | null) => void;
}

export default function ClienteAutocomplete({ value, onChange }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [showCriar, setShowCriar] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoTel, setNovoTel] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const { data: resultados = [], isFetching } = useBuscarClientes(query);
  const { mutate: criar, isPending: criando } = useCriarCliente();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function selecionar(c: Cliente) {
    onChange(c);
    setQuery('');
    setOpen(false);
  }

  function limpar() {
    onChange(null);
    setQuery('');
  }

  function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    criar(
      { nome: novoNome, email: novoEmail || undefined, telefone: novoTel || undefined },
      {
        onSuccess: (novo) => {
          selecionar(novo);
          setShowCriar(false);
          setNovoNome('');
          setNovoEmail('');
          setNovoTel('');
        },
      },
    );
  }

  if (value) {
    return (
      <div className="flex items-center gap-2 border border-green-300 bg-green-50 rounded-lg px-3 py-2.5">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{value.nome}</p>
          {value.email && <p className="text-xs text-gray-500 truncate">{value.email}</p>}
        </div>
        <button type="button" onClick={limpar} className="text-gray-400 hover:text-red-500 shrink-0">
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar cliente pelo nome ou CPF/CNPJ..."
          className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {isFetching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {resultados.length === 0 && !isFetching && (
            <div className="px-4 py-3 text-sm text-gray-500">
              Nenhum cliente encontrado.
            </div>
          )}
          {resultados.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => selecionar(c)}
              className="w-full text-left px-4 py-2.5 hover:bg-blue-50 border-b border-gray-100 last:border-0"
            >
              <p className="text-sm font-medium text-gray-800">{c.nome}</p>
              <p className="text-xs text-gray-400">{c.cpfCnpj ?? c.email ?? '—'}</p>
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setShowCriar(true); setOpen(false); setNovoNome(query); }}
            className="w-full text-left px-4 py-2.5 bg-gray-50 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 border-t border-gray-100"
          >
            <UserPlus size={14} />
            Criar cliente "{query}"
          </button>
        </div>
      )}

      {showCriar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800">Novo Cliente</h3>
              <button type="button" onClick={() => setShowCriar(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCriar} className="px-5 py-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nome *</label>
                <input
                  type="text"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">E-mail</label>
                <input
                  type="email"
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Telefone</label>
                <input
                  type="text"
                  value={novoTel}
                  onChange={(e) => setNovoTel(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCriar(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={criando}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60"
                >
                  {criando ? 'Salvando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
