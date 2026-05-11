import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();
  const { mutate: login, isPending, error } = useLogin();

  const errorMsg = (() => {
    if (!error) return null;
    const data = (error as any).response?.data;
    return data?.message ?? 'Erro ao fazer login';
  })();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login({ email, senha }, { onSuccess: () => navigate('/') });
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Lado esquerdo — imagem ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12" style={{ backgroundColor: '#0B2A4A' }}>
        <img
          src="/logo.png?v=4"
          alt="TDGenFin"
          className="w-auto object-contain mb-12 brightness-0 invert"
          style={{ height: '106px' }}
        />
        <h2 className="text-3xl font-bold text-white leading-tight text-center">
          Gestão financeira<br />para negócios
        </h2>
        <p className="text-slate-300 mt-3 text-sm text-center">
          Controle completo de extratos, conciliação e saldos bancários.
        </p>
      </div>

      {/* ── Lado direito — formulário ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-sm">

          {/* Logo mobile (só aparece em telas menores) */}
          <div className="flex justify-center mb-8 lg:hidden">
            <img
              src="/logo.png?v=4"
              alt="TDGenFin"
              className="object-contain"
              style={{ height: '114px' }}
            />
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">


            <h2 className="text-xl font-semibold text-gray-800 mb-6">Entrar na conta</h2>

            {errorMsg && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
                <AlertCircle size={16} className="shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seu@email.com"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition-colors mt-2"
              >
                {isPending ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
