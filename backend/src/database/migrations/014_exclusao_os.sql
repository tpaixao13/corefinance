-- Nova ação de auditoria: exclusão de ordem de serviço (SUPER_ADMIN)
ALTER TYPE auditoria_log_acao_enum ADD VALUE IF NOT EXISTS 'EXCLUSAO_OS';
