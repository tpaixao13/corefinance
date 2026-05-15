-- Migration 008: Módulo de Ordem de Serviço

-- Cria o tipo enum para status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ordem_servico_status_enum') THEN
    CREATE TYPE ordem_servico_status_enum AS ENUM ('ABERTA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA');
  END IF;
END $$;

-- Cria a tabela principal
CREATE TABLE IF NOT EXISTS ordem_servico (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id    UUID NOT NULL REFERENCES empresa(id),
  cliente       VARCHAR(200) NOT NULL,
  descricao     VARCHAR(1000) NOT NULL,
  valor         NUMERIC(15, 2) NOT NULL,
  status        ordem_servico_status_enum NOT NULL DEFAULT 'ABERTA',
  data_abertura DATE NOT NULL,
  data_conclusao DATE,
  conta_receber_id UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ordem_servico_empresa_id ON ordem_servico(empresa_id);
CREATE INDEX IF NOT EXISTS idx_ordem_servico_status    ON ordem_servico(status);

-- Novas permissões são inseridas como varchar — não requerem ALTER TYPE

-- Adiciona novos eventos de auditoria ao enum
ALTER TYPE auditoria_log_acao_enum ADD VALUE IF NOT EXISTS 'CRIACAO_OS';
ALTER TYPE auditoria_log_acao_enum ADD VALUE IF NOT EXISTS 'EDICAO_OS';
ALTER TYPE auditoria_log_acao_enum ADD VALUE IF NOT EXISTS 'FINALIZACAO_OS';
ALTER TYPE auditoria_log_acao_enum ADD VALUE IF NOT EXISTS 'CANCELAMENTO_OS';
