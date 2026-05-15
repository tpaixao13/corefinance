import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { OrdemServico, CreateOrdemServicoPayload, UpdateOrdemServicoPayload } from '../types';

interface Props {
  os?: OrdemServico | null;
  onClose: () => void;
  onSave: (data: CreateOrdemServicoPayload | UpdateOrdemServicoPayload) => void;
  isPending: boolean;
}

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

const hoje = () => new Date().toISOString().split('T')[0];

export default function OrdemServicoForm({ os, onClose, onSave, isPending }: Props) {
  const isEdit = !!os;
  const [form, setForm] = useState({
    cliente: '',
    descricao: '',
    valor: '',
    dataAbertura: hoje(),
  });

  useEffect(() => {
    if (os) {
      setForm({
        cliente: os.cliente,
        descricao: os.descricao,
        valor: String(os.valor),
        dataAbertura: os.dataAbertura,
      });
    }
  }, [os]);

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      cliente: form.cliente,
      descricao: form.descricao,
      valor: parseFloat(form.valor),
      dataAbertura: form.dataAbertura,
    };
    onSave(payload);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-800">
            {isEdit ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Cliente <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.cliente}
              onChange={(e) => set('cliente', e.target.value)}
              required
              maxLength={200}
              placeholder="Nome do cliente"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Descrição <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.descricao}
              onChange={(e) => set('descricao', e.target.value)}
              required
              maxLength={1000}
              rows={3}
              placeholder="Descreva o serviço a ser realizado"
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Valor (R$) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.valor}
                onChange={(e) => set('valor', e.target.value)}
                required
                min="0.01"
                step="0.01"
                placeholder="0,00"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Data de Abertura <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.dataAbertura}
                onChange={(e) => set('dataAbertura', e.target.value)}
                required
                className={inputCls}
              />
            </div>
          </div>

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
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              <Save size={15} />
              {isPending ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar OS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
