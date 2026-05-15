-- Migration 009: Clientes, logo empresa, email OS, novas permissões e auditoria

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS cliente (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id  UUID NOT NULL REFERENCES empresa(id),
  nome        VARCHAR(200) NOT NULL,
  cpf_cnpj    VARCHAR(18),
  email       VARCHAR(200),
  telefone    VARCHAR(20),
  endereco    VARCHAR(300),
  ativo       BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cliente_empresa_id ON cliente(empresa_id);
CREATE INDEX IF NOT EXISTS idx_cliente_nome       ON cliente(nome);

-- Logo URL na empresa
ALTER TABLE empresa ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500);

-- Campos extras na ordem de serviço
ALTER TABLE ordem_servico ADD COLUMN IF NOT EXISTS cliente_id    UUID REFERENCES cliente(id);
ALTER TABLE ordem_servico ADD COLUMN IF NOT EXISTS email_cliente VARCHAR(200);

-- Novos eventos de auditoria
ALTER TYPE auditoria_log_acao_enum ADD VALUE IF NOT EXISTS 'ENVIO_EMAIL_OS';
