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
  // Identificação
  nome: string;
  nomeFantasia?: string;
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  // Endereço
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  // Contato
  telefone?: string;
  email?: string;
  site?: string;
  // Status
  ativo: boolean;
  maxUsuarios: number;
  logoUrl?: string | null;
  createdAt: string;
}

export interface CreateEmpresaPayload {
  nome: string;
  nomeFantasia?: string;
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  telefone?: string;
  email?: string;
  site?: string;
  logoUrl?: string;
}

export interface UpdateEmpresaPayload extends Partial<CreateEmpresaPayload> {
  ativo?: boolean;
  maxUsuarios?: number;
}

export interface EnderecoCep {
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
}

// ── Permissões ────────────────────────────────────────
export interface PermissaoItem {
  chave: string;
  descricao: string;
  habilitado: boolean;
}

export interface UsuarioComPermissoes {
  usuarioId: string;
  nome: string;
  email: string;
  empresa: string | null;
  role: string;
  ativo: boolean;
  permissoes: PermissaoItem[];
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
  temMovimentacoes: boolean;
}

export interface CreateContaBancariaPayload {
  empresaId: string;
  banco: string;
  agencia: string;
  numero: string;
  descricao?: string;
  saldoInicial?: number;
}

export interface UpdateContaBancariaPayload {
  banco?: string;
  agencia?: string;
  numero?: string;
  descricao?: string;
  ativo?: boolean;
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
  | 'ESTORNO_CONCILIACAO'
  | 'ALTERACAO_LICENCA'
  | 'TENTATIVA_LIMITE_USUARIOS'
  | 'CRIACAO_OS'
  | 'EDICAO_OS'
  | 'FINALIZACAO_OS'
  | 'CANCELAMENTO_OS'
  | 'ENVIO_EMAIL_OS';

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

// ── Contas a Pagar ────────────────────────────────────
export type StatusContaPagar = 'ABERTA' | 'PAGA' | 'ATRASADA' | 'CANCELADA';
export type RecorrenciaContaPagar = 'NENHUMA' | 'SEMANAL' | 'MENSAL' | 'TRIMESTRAL' | 'ANUAL';

export interface ContaPagar {
  id: string;
  empresaId: string;
  descricao: string;
  fornecedor: string | null;
  valor: number;
  dataVencimento: string;
  recorrencia: RecorrenciaContaPagar;
  status: StatusContaPagar;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContaPagarPayload {
  descricao: string;
  fornecedor?: string;
  valor: number;
  dataVencimento: string;
  recorrencia: RecorrenciaContaPagar;
}

export interface UpdateContaPagarPayload {
  descricao?: string;
  fornecedor?: string;
  valor?: number;
  dataVencimento?: string;
  recorrencia?: RecorrenciaContaPagar;
  status?: StatusContaPagar;
}

// ── Contas a Receber ──────────────────────────────────
export type StatusContaReceber = 'ABERTA' | 'RECEBIDA' | 'ATRASADA' | 'CANCELADA';

export interface ContaReceber {
  id: string;
  empresaId: string;
  descricao: string;
  cliente: string | null;
  clienteId: string | null;
  valor: number;
  dataRecebimento: string;
  recorrencia: RecorrenciaContaPagar;
  status: StatusContaReceber;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContaReceberPayload {
  descricao: string;
  cliente?: string;
  clienteId?: string;
  valor: number;
  dataRecebimento: string;
  recorrencia: RecorrenciaContaPagar;
}

export interface UpdateContaReceberPayload {
  descricao?: string;
  cliente?: string;
  valor?: number;
  dataRecebimento?: string;
  recorrencia?: RecorrenciaContaPagar;
  status?: StatusContaReceber;
}

// ── Clientes ──────────────────────────────────────────
export interface Cliente {
  id: string;
  empresaId: string;
  nome: string;
  cpfCnpj: string | null;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  ativo: boolean;
  createdAt: string;
}

export interface CreateClientePayload {
  nome: string;
  cpfCnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
}

export interface UpdateClientePayload {
  nome?: string;
  cpfCnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
}

// ── Ordens de Serviço ─────────────────────────────────
export type StatusOrdemServico = 'ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';

export interface OrdemServico {
  id: string;
  empresaId: string;
  numero: number;
  cliente: string;
  descricao: string;
  valor: number;
  status: StatusOrdemServico;
  dataAbertura: string;
  dataConclusao: string | null;
  contaReceberId: string | null;
  clienteId: string | null;
  emailCliente: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrdemServicoPayload {
  clienteId: string;
  descricao: string;
  valor: number;
  dataAbertura: string;
  emailCliente?: string;
}

export interface UpdateOrdemServicoPayload {
  clienteId?: string;
  descricao?: string;
  valor?: number;
  dataAbertura?: string;
  emailCliente?: string;
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
