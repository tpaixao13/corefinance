-- ============================================================
-- TDGenFin - Schema Inicial
-- Multi-tenant: Single DB + empresa_id em todas as tabelas
-- ============================================================

-- Extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE role_enum AS ENUM ('SUPER_ADMIN', 'ADMIN_EMPRESA', 'USUARIO');
CREATE TYPE tipo_lancamento_enum AS ENUM ('CREDITO', 'DEBITO');
CREATE TYPE status_conciliacao_enum AS ENUM ('CONCILIADO', 'PENDENTE', 'NAO_ENCONTRADO');
CREATE TYPE formato_extrato_enum AS ENUM ('OFX', 'CSV', 'XLSX');
CREATE TYPE tipo_conciliacao_enum AS ENUM ('AUTOMATICA', 'MANUAL');
CREATE TYPE status_conciliacao_registro_enum AS ENUM ('CONCILIADO', 'ESTORNADO');
CREATE TYPE acao_auditoria_enum AS ENUM (
  'IMPORTACAO_EXTRATO',
  'CONCILIACAO_AUTOMATICA',
  'CONCILIACAO_MANUAL',
  'AJUSTE_SALDO',
  'CRIACAO_CONTA',
  'ATUALIZACAO_CONTA',
  'CRIACAO_EMPRESA',
  'ATUALIZACAO_EMPRESA',
  'CRIACAO_USUARIO',
  'LOGIN',
  'ESTORNO_CONCILIACAO'
);

-- ============================================================
-- TABELA: empresa
-- ============================================================
CREATE TABLE IF NOT EXISTS empresa (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome        VARCHAR(200) NOT NULL,
  cnpj        VARCHAR(18) NOT NULL UNIQUE,
  ativo       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_empresa_cnpj ON empresa(cnpj);
CREATE INDEX idx_empresa_ativo ON empresa(ativo);

-- ============================================================
-- TABELA: usuario
-- ============================================================
CREATE TABLE IF NOT EXISTS usuario (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id  UUID REFERENCES empresa(id) ON DELETE SET NULL,
  nome        VARCHAR(200) NOT NULL,
  email       VARCHAR(200) NOT NULL UNIQUE,
  senha_hash  VARCHAR(255) NOT NULL,
  role        role_enum NOT NULL DEFAULT 'USUARIO',
  ativo       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usuario_empresa_id ON usuario(empresa_id);
CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_usuario_role ON usuario(role);

-- ============================================================
-- TABELA: conta_bancaria
-- ============================================================
CREATE TABLE IF NOT EXISTS conta_bancaria (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id    UUID NOT NULL REFERENCES empresa(id) ON DELETE RESTRICT,
  banco         VARCHAR(100) NOT NULL,
  agencia       VARCHAR(20) NOT NULL,
  numero        VARCHAR(30) NOT NULL,
  descricao     VARCHAR(200),
  saldo_inicial DECIMAL(15,2) NOT NULL DEFAULT 0,
  saldo_atual   DECIMAL(15,2) NOT NULL DEFAULT 0,
  ativo         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conta_bancaria_empresa_id ON conta_bancaria(empresa_id);
CREATE INDEX idx_conta_bancaria_ativo ON conta_bancaria(ativo);

-- ============================================================
-- TABELA: extrato_importacao
-- ============================================================
CREATE TABLE IF NOT EXISTS extrato_importacao (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id         UUID NOT NULL REFERENCES empresa(id) ON DELETE RESTRICT,
  conta_id           UUID NOT NULL REFERENCES conta_bancaria(id) ON DELETE RESTRICT,
  usuario_id         UUID NOT NULL REFERENCES usuario(id) ON DELETE RESTRICT,
  nome_arquivo       VARCHAR(255) NOT NULL,
  formato            formato_extrato_enum NOT NULL,
  hash_arquivo       VARCHAR(64) NOT NULL UNIQUE,  -- SHA256 para impedir duplicatas
  periodo_inicio     DATE,
  periodo_fim        DATE,
  total_lancamentos  INTEGER NOT NULL DEFAULT 0,
  data_importacao    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_extrato_importacao_empresa_id ON extrato_importacao(empresa_id);
CREATE INDEX idx_extrato_importacao_conta_id ON extrato_importacao(conta_id);
CREATE INDEX idx_extrato_importacao_hash ON extrato_importacao(hash_arquivo);
CREATE INDEX idx_extrato_importacao_data ON extrato_importacao(data_importacao);

-- ============================================================
-- TABELA: extrato_lancamento
-- ============================================================
CREATE TABLE IF NOT EXISTS extrato_lancamento (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id           UUID NOT NULL REFERENCES empresa(id) ON DELETE RESTRICT,
  conta_id             UUID NOT NULL REFERENCES conta_bancaria(id) ON DELETE RESTRICT,
  importacao_id        UUID NOT NULL REFERENCES extrato_importacao(id) ON DELETE RESTRICT,
  id_externo           VARCHAR(100),               -- FITID do OFX
  data                 DATE NOT NULL,
  valor                DECIMAL(15,2) NOT NULL,
  descricao            VARCHAR(500),
  tipo                 tipo_lancamento_enum NOT NULL,
  saldo_extrato        DECIMAL(15,2),
  status_conciliacao   status_conciliacao_enum NOT NULL DEFAULT 'PENDENTE',
  conciliacao_id       UUID,                       -- FK adicionada após criar tabela conciliacao
  created_at           TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_extrato_lancamento_empresa_id ON extrato_lancamento(empresa_id);
CREATE INDEX idx_extrato_lancamento_conta_id ON extrato_lancamento(conta_id);
CREATE INDEX idx_extrato_lancamento_data ON extrato_lancamento(data);
CREATE INDEX idx_extrato_lancamento_status ON extrato_lancamento(status_conciliacao);
CREATE INDEX idx_extrato_lancamento_tipo ON extrato_lancamento(tipo);

-- ============================================================
-- TABELA: conciliacao
-- ============================================================
CREATE TABLE IF NOT EXISTS conciliacao (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id            UUID NOT NULL REFERENCES empresa(id) ON DELETE RESTRICT,
  conta_id              UUID NOT NULL REFERENCES conta_bancaria(id) ON DELETE RESTRICT,
  lancamento_extrato_id UUID NOT NULL REFERENCES extrato_lancamento(id) ON DELETE RESTRICT,
  tipo                  tipo_conciliacao_enum NOT NULL,
  status                status_conciliacao_registro_enum NOT NULL DEFAULT 'CONCILIADO',
  observacao            VARCHAR(500),
  usuario_id            UUID REFERENCES usuario(id),
  created_at            TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conciliacao_empresa_id ON conciliacao(empresa_id);
CREATE INDEX idx_conciliacao_conta_id ON conciliacao(conta_id);
CREATE INDEX idx_conciliacao_lancamento ON conciliacao(lancamento_extrato_id);
CREATE INDEX idx_conciliacao_status ON conciliacao(status);

-- FK de extrato_lancamento para conciliacao (referência circular, adicionada após ambas)
ALTER TABLE extrato_lancamento
  ADD CONSTRAINT fk_extrato_lancamento_conciliacao
  FOREIGN KEY (conciliacao_id) REFERENCES conciliacao(id) ON DELETE SET NULL;

-- ============================================================
-- TABELA: auditoria_log
-- ============================================================
CREATE TABLE IF NOT EXISTS auditoria_log (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id   UUID REFERENCES usuario(id) ON DELETE SET NULL,
  empresa_id   UUID REFERENCES empresa(id) ON DELETE SET NULL,
  acao         acao_auditoria_enum NOT NULL,
  entidade     VARCHAR(100),
  entidade_id  VARCHAR(100),
  dados_antes  JSONB,
  dados_depois JSONB,
  ip_address   VARCHAR(45),
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_auditoria_empresa_id ON auditoria_log(empresa_id);
CREATE INDEX idx_auditoria_usuario_id ON auditoria_log(usuario_id);
CREATE INDEX idx_auditoria_acao ON auditoria_log(acao);
CREATE INDEX idx_auditoria_created_at ON auditoria_log(created_at);
-- Índice GIN para pesquisa dentro dos JSONs de auditoria
CREATE INDEX idx_auditoria_dados_depois ON auditoria_log USING gin(dados_depois);

-- ============================================================
-- TRIGGER: atualiza updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_empresa_updated_at
  BEFORE UPDATE ON empresa
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_usuario_updated_at
  BEFORE UPDATE ON usuario
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_conta_bancaria_updated_at
  BEFORE UPDATE ON conta_bancaria
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_conciliacao_updated_at
  BEFORE UPDATE ON conciliacao
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- VIEW: saldo_comparativo (facilita relatórios)
-- ============================================================
CREATE OR REPLACE VIEW vw_saldo_comparativo AS
SELECT
  cb.id as conta_id,
  cb.empresa_id,
  e.nome as empresa_nome,
  cb.banco,
  cb.agencia,
  cb.numero,
  cb.saldo_inicial,
  cb.saldo_atual,
  COALESCE(SUM(CASE WHEN el.tipo = 'CREDITO' THEN el.valor ELSE 0 END), 0) as total_entradas,
  COALESCE(SUM(CASE WHEN el.tipo = 'DEBITO' THEN el.valor ELSE 0 END), 0) as total_saidas,
  cb.saldo_inicial +
    COALESCE(SUM(CASE WHEN el.tipo = 'CREDITO' THEN el.valor ELSE -el.valor END), 0) as saldo_calculado,
  cb.saldo_atual - (
    cb.saldo_inicial +
    COALESCE(SUM(CASE WHEN el.tipo = 'CREDITO' THEN el.valor ELSE -el.valor END), 0)
  ) as diferenca
FROM conta_bancaria cb
JOIN empresa e ON e.id = cb.empresa_id
LEFT JOIN extrato_lancamento el ON el.conta_id = cb.id
WHERE cb.ativo = true
GROUP BY cb.id, cb.empresa_id, e.nome, cb.banco, cb.agencia, cb.numero,
         cb.saldo_inicial, cb.saldo_atual;
