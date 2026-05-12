import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contasApi } from '../api/contas';
import { useEmpresa } from '../contexts/EmpresaContext';
import type { ContaBancaria } from '../types';

interface Props {
  editTarget?: ContaBancaria;
  onClose: () => void;
}

interface FormState {
  banco: string;
  agencia: string;
  numero: string;
  descricao: string;
  saldoInicial: number;
  ativo: boolean;
}

const VAZIO: FormState = {
  banco: '',
  agencia: '',
  numero: '',
  descricao: '',
  saldoInicial: 0,
  ativo: true,
};

export default function ContaBancariaForm({ editTarget, onClose }: Props) {
  const { empresaAtiva } = useEmpresa();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(VAZIO);
  const isEditing = !!editTarget;

  useEffect(() => {
    if (editTarget) {
      setForm({
        banco: editTarget.banco,
        agencia: editTarget.agencia,
        numero: editTarget.numero,
        descricao: editTarget.descricao ?? '',
        saldoInicial: editTarget.saldoInicial,
        ativo: editTarget.ativo,
      });
    }
  }, [editTarget]);

  const { mutate: criar, isPending: criando, error: erroCriar } = useMutation({
    mutationFn: () =>
      contasApi.criar({
        empresaId: empresaAtiva!.id,
        banco: form.banco,
        agencia: form.agencia,
        numero: form.numero,
        descricao: form.descricao || undefined,
        saldoInicial: form.saldoInicial,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas'] });
      onClose();
    },
  });

  const { mutate: atualizar, isPending: atualizando, error: erroAtualizar } = useMutation({
    mutationFn: () =>
      contasApi.atualizar(editTarget!.id, {
        banco: form.banco,
        agencia: form.agencia,
        numero: form.numero,
        descricao: form.descricao || undefined,
        ativo: form.ativo,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas'] });
      onClose();
    },
  });

  const isPending = criando || atualizando;

  const errorMsg = (() => {
    const err = erroCriar ?? erroAtualizar;
    if (!err) return null;
    const data = (err as any).response?.data;
    return data?.message ?? 'Erro ao salvar conta bancária';
  })();

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEditing) {
      atualizar();
    } else {
      criar();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">
            {isEditing ? 'Editar Conta Bancária' : 'Nova Conta Bancária'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Banco</label>
            <input
              type="text"
              value={form.banco}
              onChange={(e) => set('banco', e.target.value)}
              required
              maxLength={100}
              placeholder="Ex: Banco do Brasil"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Agência</label>
              <input
                type="text"
                value={form.agencia}
                onChange={(e) => set('agencia', e.target.value)}
                required
                maxLength={20}
                placeholder="0001"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Número da Conta</label>
              <input
                type="text"
                value={form.numero}
                onChange={(e) => set('numero', e.target.value)}
                required
                maxLength={30}
                placeholder="12345-6"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição (opcional)</label>
            <input
              type="text"
              value={form.descricao}
              onChange={(e) => set('descricao', e.target.value)}
              maxLength={200}
              placeholder="Ex: Conta corrente principal"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Saldo Inicial (R$)</label>
              <input
                type="number"
                value={form.saldoInicial}
                onChange={(e) => set('saldoInicial', parseFloat(e.target.value) || 0)}
                step={0.01}
                placeholder="0,00"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {isEditing && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="ativo"
                checked={form.ativo}
                onChange={(e) => set('ativo', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="ativo" className="text-sm font-medium text-gray-700">Conta ativa</label>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              {isPending ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
