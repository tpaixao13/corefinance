-- Módulo de Clientes: adiciona cliente_id em conta_receber
ALTER TABLE conta_receber ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES cliente(id);
