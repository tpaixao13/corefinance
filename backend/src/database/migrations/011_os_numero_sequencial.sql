-- Adiciona número sequencial por empresa na ordem_servico
ALTER TABLE ordem_servico ADD COLUMN IF NOT EXISTS numero INTEGER;

-- Backfill: numera os existentes por empresa em ordem cronológica
UPDATE ordem_servico os
SET numero = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY empresa_id ORDER BY created_at ASC) AS rn
  FROM ordem_servico
) sub
WHERE os.id = sub.id;

ALTER TABLE ordem_servico ALTER COLUMN numero SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_os_empresa_numero ON ordem_servico(empresa_id, numero);
