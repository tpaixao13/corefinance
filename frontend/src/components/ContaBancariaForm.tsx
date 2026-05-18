import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contasApi } from '../api/contas';
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
}

const VAZIO: FormState = { banco: '', agencia: '', numero: '', descricao: '', saldoInicial: 0 };

export default function ContaBancariaForm({ editTarget, onClose }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(VAZIO);
  const isEditing = !!editTarget;
  const bloqueado = isEditing && !!editTarget?.temMovimentacoes;

  useEffect(() => {
    if (editTarget) {
      setForm({
        banco: editTarget.banco,
        agencia: editTarget.agencia,
        numero: editTarget.numero,
        descricao: editTarget.descricao ?? '',
        saldoInicial: editTarget.saldoInicial,
      });
    }
  }, [editTarget]);

  const { mutate: criar, isPending: criando, error: erroCriar } = useMutation({
    mutationFn: () =>
      contasApi.criar({
        banco: form.banco,
        agencia: form.agencia,
        numero: form.numero,
        descricao: form.descricao || undefined,
        saldoInicial: form.saldoInicial,
      }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['contas'] }); onClose(); },
  });

  const { mutate: atualizar, isPending: atualizando, error: erroAtualizar } = useMutation({
    mutationFn: () =>
      contasApi.atualizar(editTarget!.id, {
        banco: bloqueado ? undefined : form.banco,
        agencia: bloqueado ? undefined : form.agencia,
        numero: bloqueado ? undefined : form.numero,
        descricao: form.descricao || undefined,
      }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['contas'] }); onClose(); },
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
    isEditing ? atualizar() : criar();
  }

  const inputCls = (disabled: boolean) =>
    `w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''
    }`;

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
          {bloqueado && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>Esta conta já possui movimentações financeiras. Banco, agência e número não podem ser alterados.</span>
            </div>
          )}

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
              required={!bloqueado}
              disabled={bloqueado}
              maxLength={100}
              placeholder="Ex: Banco do Brasil"
              className={inputCls(bloqueado)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Agência</label>
              <input
                type="text"
                value={form.agencia}
                onChange={(e) => set('agencia', e.target.value)}
                required={!bloqueado}
                disabled={bloqueado}
                maxLength={20}
                placeholder="0001"
                className={inputCls(bloqueado)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Número da Conta</label>
              <input
                type="text"
                value={form.numero}
                onChange={(e) => set('numero', e.target.value)}
                required={!bloqueado}
                disabled={bloqueado}
                maxLength={30}
                placeholder="12345-6"
                className={inputCls(bloqueado)}
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
              className={inputCls(false)}
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
                className={inputCls(false)}
              />
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
