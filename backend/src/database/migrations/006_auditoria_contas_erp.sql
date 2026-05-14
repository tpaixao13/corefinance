-- Migration 006: Novos valores de auditoria para Contas a Pagar e Receber
-- Executar no servidor:
--   cd /var/www/corefinance
--   export $(grep -v '^#' backend/.env | xargs)
--   PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_NAME -f backend/src/database/migrations/006_auditoria_contas_erp.sql

ALTER TYPE auditoria_log_acao_enum ADD VALUE IF NOT EXISTS 'CRIACAO_CONTA_PAGAR';
ALTER TYPE auditoria_log_acao_enum ADD VALUE IF NOT EXISTS 'EDICAO_CONTA_PAGAR';
ALTER TYPE auditoria_log_acao_enum ADD VALUE IF NOT EXISTS 'CRIACAO_CONTA_RECEBER';
ALTER TYPE auditoria_log_acao_enum ADD VALUE IF NOT EXISTS 'EDICAO_CONTA_RECEBER';
