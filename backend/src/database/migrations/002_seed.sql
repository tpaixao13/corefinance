-- ============================================================
-- TDGenFin - Seed de dados iniciais
-- Senha padrão: Admin@123 (bcrypt hash)
-- ============================================================

-- Empresa demo
INSERT INTO empresa (id, nome, cnpj, ativo)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Empresa Demo Ltda',
  '12.345.678/0001-90',
  true
) ON CONFLICT (cnpj) DO NOTHING;

-- SUPER_ADMIN (sem empresa_id)
-- Senha: Admin@123
INSERT INTO usuario (id, empresa_id, nome, email, senha_hash, role, ativo)
VALUES (
  'f1e2d3c4-b5a6-7890-fedc-ba0987654321',
  NULL,
  'Super Admin',
  'admin@tdgenfin.com',
  '$2b$12$q7VkIxpFxVWRIWPOoUJbFOOQPL6sMdpBLxrpuGHKDdTHHyqZh3n.6',  -- Admin@123
  'SUPER_ADMIN',
  true
) ON CONFLICT (email) DO NOTHING;

-- ADMIN_EMPRESA da empresa demo
-- Senha: Admin@123
INSERT INTO usuario (id, empresa_id, nome, email, senha_hash, role, ativo)
VALUES (
  'c3d4e5f6-a7b8-9012-cdef-012345678901',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Admin Empresa Demo',
  'admin@empresa-demo.com',
  '$2b$12$q7VkIxpFxVWRIWPOoUJbFOOQPL6sMdpBLxrpuGHKDdTHHyqZh3n.6',  -- Admin@123
  'ADMIN_EMPRESA',
  true
) ON CONFLICT (email) DO NOTHING;

-- Conta bancária demo
INSERT INTO conta_bancaria (id, empresa_id, banco, agencia, numero, descricao, saldo_inicial, saldo_atual)
VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f01234567890',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Banco do Brasil',
  '1234-5',
  '12345-6',
  'Conta Corrente Principal',
  10000.00,
  10000.00
) ON CONFLICT DO NOTHING;
