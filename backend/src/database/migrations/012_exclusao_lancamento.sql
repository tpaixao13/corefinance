-- Nova ação de auditoria: exclusão de lançamento de extrato (SUPER_ADMIN)
ALTER TYPE auditoria_log_acao_enum ADD VALUE IF NOT EXISTS 'EXCLUSAO_LANCAMENTO';
