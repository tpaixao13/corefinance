// ── Auth ──────────────────────────────────────────────
export interface LoginResponse {
  access_token: string;
  usuario: Usuario;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: Role;
  empresaId: string | null;
}

export type Role = 'SUPER_ADMIN' | 'ADMIN_EMPRESA' | 'USUARIO';

// ── Empresa ───────────────────────────────────────────
export interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  ativo: boolean;
  createdAt: string;
}

export interface CreateEmpresaPayload {
  nome: string;
  cnpj: string;
}

export interface UpdateEmpresaPayload {
  nome?: string;
  cnpj?: string;
  ativo?: boolean;
}

// ── Conta Bancária ────────────────────────────────────
export interface ContaBancaria {
  id: string;
  empresaId: string;
  banco: string;
  agencia: string;
  numero: string;
  descricao: string | null;
  saldoInicial: number;
  saldoAtual: number;
  ativo: boolean;
}

// ── Extrato ───────────────────────────────────────────
export type FormatoExtrato = 'OFX' | 'CSV' | 'XLSX';

export interface ExtratoImportacao {
  id: string;
  empresaId: string;
  contaId: string;
  nomeArquivo: string;
  formato: FormatoExtrato;
  totalLancamentos: number;
  periodoInicio: string | null;
  periodoFim: string | null;
  dataImportacao: string;
}

// ── Dashboard ─────────────────────────────────────────
export interface ResumoContaPeriodo {
  contaId: string;
  banco: string;
  agencia: string;
  numero: string;
  saldoInicial: number;
  saldoAtual: number;
  totalEntradas: number;
  totalSaidas: number;
  saldoCalculado: number;
  diferenca: number;
  totalConciliados: number;
  totalPendentes: number;
  totalNaoEncontrados: number;
}

export interface ResumoEmpresa {
  empresaId: string;
  totalContas: number;
  saldoTotal: number;
  totalEntradas: number;
  totalSaidas: number;
}

// ── Lançamentos ───────────────────────────────────────
export type TipoLancamento = 'CREDITO' | 'DEBITO';
export type StatusConciliacao = 'CONCILIADO' | 'PENDENTE' | 'NAO_ENCONTRADO';

export interface Lancamento {
  id: string;
  empresaId: string;
  contaId: string;
  importacaoId: string;
  idExterno: string | null;
  data: string;
  valor: string;
  descricao: string | null;
  tipo: TipoLancamento;
  saldoExtrato: string | null;
  statusConciliacao: StatusConciliacao;
  conciliacaoId: string | null;
  createdAt: string;
}

// ── Usuários ──────────────────────────────────────────
export interface UsuarioItem {
  id: string;
  nome: string;
  email: string;
  empresaId: string | null;
  role: Role;
  ativo: boolean;
  createdAt: string;
}

export interface CreateUsuarioPayload {
  empresaId?: string;
  nome: string;
  email: string;
  senha: string;
  role: Role;
}

export interface UpdateUsuarioPayload {
  nome?: string;
  ativo?: boolean;
}

// ── Auditoria ─────────────────────────────────────────
export type AcaoAuditoria =
  | 'IMPORTACAO_EXTRATO'
  | 'CONCILIACAO_AUTOMATICA'
  | 'CONCILIACAO_MANUAL'
  | 'AJUSTE_SALDO'
  | 'CRIACAO_CONTA'
  | 'ATUALIZACAO_CONTA'
  | 'CRIACAO_EMPRESA'
  | 'ATUALIZACAO_EMPRESA'
  | 'CRIACAO_USUARIO'
  | 'LOGIN'
  | 'ESTORNO_CONCILIACAO';

export interface AuditoriaLog {
  id: string;
  usuarioId: string | null;
  usuario: { id: string; nome: string; email: string } | null;
  empresaId: string | null;
  acao: AcaoAuditoria;
  entidade: string | null;
  entidadeId: string | null;
  dadosAntes: Record<string, unknown> | null;
  dadosDepois: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

// ── Paginação ─────────────────────────────────────────
export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ── Erros API ─────────────────────────────────────────
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
