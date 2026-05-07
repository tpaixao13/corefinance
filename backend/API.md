# TDGenFin - API Reference

Base URL: `http://localhost:3000/api/v1`

## Autenticação

### Login
```
POST /auth/login
Body: { "email": "admin@tdgenfin.com", "senha": "Admin@123" }
Response: { "access_token": "jwt...", "usuario": { ... } }
```

Todas as demais rotas requerem: `Authorization: Bearer <token>`

---

## Empresas

| Método | Rota             | Role mínima   | Descrição           |
|--------|------------------|---------------|---------------------|
| POST   | /empresas        | SUPER_ADMIN   | Criar empresa       |
| GET    | /empresas        | USUARIO       | Listar empresas     |
| GET    | /empresas/:id    | USUARIO       | Buscar por ID       |
| PATCH  | /empresas/:id    | SUPER_ADMIN   | Atualizar empresa   |

---

## Usuários

| Método | Rota             | Role mínima    | Descrição           |
|--------|------------------|----------------|---------------------|
| POST   | /usuarios        | ADMIN_EMPRESA  | Criar usuário       |
| GET    | /usuarios        | ADMIN_EMPRESA  | Listar usuários     |
| GET    | /usuarios/:id    | ADMIN_EMPRESA  | Buscar por ID       |
| PATCH  | /usuarios/:id    | ADMIN_EMPRESA  | Atualizar usuário   |

---

## Contas Bancárias

| Método | Rota                              | Role mínima    | Descrição              |
|--------|-----------------------------------|----------------|------------------------|
| POST   | /contas-bancarias                 | ADMIN_EMPRESA  | Criar conta            |
| GET    | /contas-bancarias                 | USUARIO        | Listar contas          |
| GET    | /contas-bancarias/:id             | USUARIO        | Buscar por ID          |
| PATCH  | /contas-bancarias/:id/recalcular-saldo | ADMIN_EMPRESA | Recalcular saldo  |

---

## Extratos

### Importar extrato (multipart/form-data)
```
POST /extratos/importar/:contaId
Role: ADMIN_EMPRESA
Form: arquivo (file) - OFX, CSV ou XLSX
```

| Método | Rota                           | Role mínima    | Descrição                    |
|--------|--------------------------------|----------------|------------------------------|
| POST   | /extratos/importar/:contaId    | ADMIN_EMPRESA  | Importar arquivo             |
| GET    | /extratos/importacoes          | USUARIO        | Listar importações           |
| GET    | /extratos/lancamentos/:contaId | USUARIO        | Listar lançamentos (paginado)|

Query params: `?page=1&limit=50&contaId=uuid`

---

## Conciliação

| Método | Rota                               | Role mínima    | Descrição               |
|--------|------------------------------------|----------------|-------------------------|
| POST   | /conciliacao/automatica/:contaId   | ADMIN_EMPRESA  | Executar automática     |
| POST   | /conciliacao/manual/:contaId       | ADMIN_EMPRESA  | Conciliar manualmente   |
| DELETE | /conciliacao/estornar/:id          | ADMIN_EMPRESA  | Estornar conciliação    |
| GET    | /conciliacao                       | USUARIO        | Listar conciliações     |

```
POST /conciliacao/manual/:contaId
Body: { "lancamentoExtratoId": "uuid", "observacao": "motivo" }

Response automática: { "conciliados": 5, "pendentes": 2, "naoEncontrados": 1 }
```

---

## Dashboard

| Método | Rota                              | Role mínima  | Descrição                    |
|--------|-----------------------------------|--------------|------------------------------|
| GET    | /dashboard/conta/:contaId         | USUARIO      | Resumo da conta              |
| GET    | /dashboard/empresa                | USUARIO      | Resumo da empresa            |
| GET    | /dashboard/empresas               | SUPER_ADMIN  | Resumo de todas as empresas  |
| GET    | /dashboard/conta/:contaId/evolucao| USUARIO      | Evolução mensal do saldo     |

Query params: `?dataInicio=2024-01-01&dataFim=2024-01-31&meses=6`

---

## Auditoria

| Método | Rota        | Role mínima    | Descrição           |
|--------|-------------|----------------|---------------------|
| GET    | /auditoria  | ADMIN_EMPRESA  | Listar logs         |

---

## Códigos de Status

| Código | Significado                      |
|--------|----------------------------------|
| 200    | Sucesso                          |
| 201    | Criado com sucesso               |
| 400    | Dados inválidos                  |
| 401    | Não autenticado                  |
| 403    | Sem permissão (role insuficiente)|
| 404    | Recurso não encontrado           |
| 409    | Conflito (duplicata)             |
| 500    | Erro interno                     |

---

## Credenciais de teste (seed)

| Email                    | Senha      | Role          |
|--------------------------|------------|---------------|
| admin@tdgenfin.com       | Admin@123  | SUPER_ADMIN   |
| admin@empresa-demo.com   | Admin@123  | ADMIN_EMPRESA |
