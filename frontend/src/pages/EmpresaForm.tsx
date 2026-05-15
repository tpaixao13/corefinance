import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Save } from 'lucide-react';
import { useEmpresaById, useCriarEmpresa, useAtualizarEmpresa } from '../hooks/useEmpresa';
import { enderecosApi } from '../api/enderecos';
import EmpresaEnderecoForm, { type EnderecoFormData } from '../components/EmpresaEnderecoForm';
import type { CreateEmpresaPayload } from '../types';

function maskCnpj(v: string) {
  return v
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

function maskTelefone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d)/, '($1) $2-$3');
  return d.replace(/^(\d{2})(\d{5})(\d)/, '($1) $2-$3');
}

interface FormData extends EnderecoFormData {
  nome: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  inscricaoMunicipal: string;
  telefone: string;
  email: string;
  site: string;
  ativo: boolean;
  maxUsuarios: number;
  logoUrl: string;
}

const VAZIO: FormData = {
  nome: '', nomeFantasia: '', cnpj: '',
  inscricaoEstadual: '', inscricaoMunicipal: '',
  cep: '', logradouro: '', numero: '', complemento: '',
  bairro: '', cidade: '', estado: '',
  telefone: '', email: '', site: '',
  ativo: true,
  maxUsuarios: 1,
  logoUrl: '',
};

const inputCls =
  'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

export default function EmpresaFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState<FormData>(VAZIO);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cepErro, setCepErro] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: empresa } = useEmpresaById(id ?? '');
  const { mutate: criar, isPending: criando } = useCriarEmpresa();
  const { mutate: atualizar, isPending: atualizando } = useAtualizarEmpresa();
  const isPending = criando || atualizando;

  useEffect(() => {
    if (empresa) {
      setForm({
        nome: empresa.nome ?? '',
        nomeFantasia: empresa.nomeFantasia ?? '',
        cnpj: empresa.cnpj ?? '',
        inscricaoEstadual: empresa.inscricaoEstadual ?? '',
        inscricaoMunicipal: empresa.inscricaoMunicipal ?? '',
        cep: empresa.cep ?? '',
        logradouro: empresa.logradouro ?? '',
        numero: empresa.numero ?? '',
        complemento: empresa.complemento ?? '',
        bairro: empresa.bairro ?? '',
        cidade: empresa.cidade ?? '',
        estado: empresa.estado ?? '',
        telefone: empresa.telefone ?? '',
        email: empresa.email ?? '',
        site: empresa.site ?? '',
        ativo: empresa.ativo,
        maxUsuarios: empresa.maxUsuarios ?? 1,
        logoUrl: empresa.logoUrl ?? '',
      });
    }
  }, [empresa]);

  function set(field: keyof FormData, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleCepBlur() {
    const cepLimpo = form.cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;
    setBuscandoCep(true);
    setCepErro('');
    try {
      const end = await enderecosApi.buscarCep(cepLimpo);
      setForm((f) => ({
        ...f,
        logradouro: end.logradouro,
        bairro: end.bairro,
        cidade: end.cidade,
        estado: end.estado,
      }));
    } catch {
      setCepErro('CEP não encontrado.');
    } finally {
      setBuscandoCep(false);
    }
  }

  function buildPayload(): CreateEmpresaPayload & { maxUsuarios: number } {
    return {
      nome: form.nome,
      nomeFantasia: form.nomeFantasia || undefined,
      cnpj: form.cnpj,
      inscricaoEstadual: form.inscricaoEstadual || undefined,
      inscricaoMunicipal: form.inscricaoMunicipal || undefined,
      cep: form.cep || undefined,
      logradouro: form.logradouro || undefined,
      numero: form.numero || undefined,
      complemento: form.complemento || undefined,
      bairro: form.bairro || undefined,
      cidade: form.cidade || undefined,
      estado: form.estado || undefined,

      telefone: form.telefone || undefined,
      email: form.email || undefined,
      site: form.site || undefined,
      maxUsuarios: form.maxUsuarios,
      logoUrl: form.logoUrl || undefined,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    const onError = (err: unknown) => {
      const data = (err as any).response?.data;
      setErrorMsg(data?.message ?? 'Erro ao salvar empresa');
    };

    if (isEdit && id) {
      atualizar(
        { id, dto: { ...buildPayload(), ativo: form.ativo } },
        { onSuccess: () => navigate(`/empresas/${id}`), onError },
      );
    } else {
      criar(buildPayload(), { onSuccess: (emp) => navigate(`/empresas/${emp.id}`), onError });
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/empresas')}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <Building2 size={22} className="text-gray-600" />
        <h2 className="text-2xl font-bold text-gray-800">
          {isEdit ? 'Editar Empresa' : 'Nova Empresa'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {errorMsg}
          </div>
        )}

        {/* ── Identificação ── */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 pb-2 border-b border-gray-100">
            Identificação
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Razão Social <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => set('nome', e.target.value)}
                required
                placeholder="Nome oficial da empresa"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome Fantasia</label>
              <input
                type="text"
                value={form.nomeFantasia}
                onChange={(e) => set('nomeFantasia', e.target.value)}
                placeholder="Nome comercial"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                CNPJ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.cnpj}
                onChange={(e) => set('cnpj', maskCnpj(e.target.value))}
                required
                placeholder="00.000.000/0001-00"
                maxLength={18}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Inscrição Estadual</label>
              <input
                type="text"
                value={form.inscricaoEstadual}
                onChange={(e) => set('inscricaoEstadual', e.target.value)}
                placeholder="Opcional"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Inscrição Municipal</label>
              <input
                type="text"
                value={form.inscricaoMunicipal}
                onChange={(e) => set('inscricaoMunicipal', e.target.value)}
                placeholder="Opcional"
                className={inputCls}
              />
            </div>
          </div>
        </section>

        {/* ── Endereço ── */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <EmpresaEnderecoForm
            form={form}
            onChange={(field, value) => set(field, value)}
            onCepBlur={handleCepBlur}
            buscandoCep={buscandoCep}
          />
          {cepErro && <p className="text-red-500 text-xs mt-2">{cepErro}</p>}
        </section>

        {/* ── Contato ── */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 pb-2 border-b border-gray-100">
            Contato
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone</label>
              <input
                type="text"
                value={form.telefone}
                onChange={(e) => set('telefone', maskTelefone(e.target.value))}
                placeholder="(00) 00000-0000"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="contato@empresa.com.br"
                className={inputCls}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Site</label>
              <input
                type="text"
                value={form.site}
                onChange={(e) => set('site', e.target.value)}
                placeholder="https://www.empresa.com.br (opcional)"
                className={inputCls}
              />
            </div>
          </div>
        </section>

        {/* ── Licença ── */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 pb-2 border-b border-gray-100">
            Licença
          </h3>
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Limite de usuários ativos <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={form.maxUsuarios}
              onChange={(e) => setForm((f) => ({ ...f, maxUsuarios: Math.max(1, parseInt(e.target.value) || 1) }))}
              required
              className={inputCls}
            />
            <p className="text-xs text-gray-400 mt-1">Número máximo de usuários ativos permitidos para esta empresa.</p>
          </div>
          <div className="max-w-lg">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              URL do Logotipo
            </label>
            <input
              type="url"
              value={form.logoUrl}
              onChange={(e) => set('logoUrl', e.target.value)}
              placeholder="https://sua-empresa.com/logo.png (opcional)"
              className={inputCls}
            />
            <p className="text-xs text-gray-400 mt-1">Exibido no cabeçalho das Ordens de Serviço.</p>
            {form.logoUrl && (
              <img src={form.logoUrl} alt="Pré-visualização" className="mt-2 h-12 object-contain border border-gray-200 rounded p-1" />
            )}
          </div>
        </section>

        {/* ── Status ── */}
        {isEdit && (
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-700 pb-2 border-b border-gray-100 mb-4">
              Status
            </h3>
            <label className="flex items-center gap-3 cursor-pointer w-fit">
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(e) => set('ativo', e.target.checked)}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm text-gray-700">Empresa ativa</span>
            </label>
          </section>
        )}

        {/* ── Ações ── */}
        <div className="flex gap-3 pb-8">
          <button
            type="button"
            onClick={() => navigate('/empresas')}
            className="px-6 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            <Save size={15} />
            {isPending ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Empresa'}
          </button>
        </div>
      </form>
    </div>
  );
}
