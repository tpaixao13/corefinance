-- Novas ações de auditoria: exclusão de contas a pagar/receber (SUPER_ADMIN)
ALTER TYPE auditoria_log_acao_enum ADD VALUE IF NOT EXISTS 'EXCLUSAO_CONTA_PAGAR';
ALTER TYPE auditoria_log_acao_enum ADD VALUE IF NOT EXISTS 'EXCLUSAO_CONTA_RECEBER';
