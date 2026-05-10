-- ============================================================
-- TDGenFin - Seed inicial
-- Apenas o SUPER_ADMIN do sistema
-- ============================================================

INSERT INTO usuario (id, empresa_id, nome, email, senha_hash, role, ativo)
VALUES (
  gen_random_uuid(),
  NULL,
  'Super Admin',
  'admin@corefinance.com.br',
  '$2b$12$rLuX3Wy.rsbobSQzsJY27uhkDZAbTqDlvzlh4Xm7WFG8bnIHrXNYu',
  'SUPER_ADMIN',
  true
) ON CONFLICT (email) DO NOTHING;
