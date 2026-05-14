# CoreFinance — Manual do Usuário

> Sistema financeiro SaaS multi-tenant para gestão de contas bancárias, conciliação, contas a pagar/receber e relatórios.

---

## Sumário

1. [Perfis de Acesso](#1-perfis-de-acesso)
2. [Login](#2-login)
3. [Esqueci minha senha](#3-esqueci-minha-senha)
4. [Navegação — Barra lateral e Cabeçalho](#4-navegação--barra-lateral-e-cabeçalho)
5. [Dashboard Financeiro](#5-dashboard-financeiro)
6. [Contas Bancárias](#6-contas-bancárias)
7. [Importar Extrato](#7-importar-extrato)
8. [Despesas](#8-despesas)
9. [Contas a Pagar](#9-contas-a-pagar)
10. [Contas a Receber](#10-contas-a-receber)
11. [Conciliação Bancária](#11-conciliação-bancária)
12. [DRE — Resultado Financeiro](#12-dre--resultado-financeiro)
13. [Relatório Financeiro](#13-relatório-financeiro)
14. [Exportação Contábil](#14-exportação-contábil)
15. [Usuários](#15-usuários)
16. [Permissões](#16-permissões)
17. [Relatório de Permissões](#17-relatório-de-permissões)
18. [Auditoria](#18-auditoria)
19. [Empresas (SUPER_ADMIN)](#19-empresas-super_admin)
20. [Visualizar Empresa](#20-visualizar-empresa)
21. [Cadastrar / Editar Empresa](#21-cadastrar--editar-empresa)

---

## 1. Perfis de Acesso

O sistema possui três níveis de acesso. O que cada usuário vê e pode fazer depende do seu perfil.

| Perfil | Descrição |
|---|---|
| **SUPER_ADMIN** | Acesso total ao sistema. Gerencia todas as empresas, define limites de licença e tem visibilidade global. |
| **ADMIN_EMPRESA** | Administrador de uma empresa específica. Pode ter permissões individuais habilitadas ou desabilitadas por um SUPER_ADMIN. Por padrão, já vem com Dashboard e Contas Bancárias habilitados. |
| **USUARIO** | Acesso somente leitura. Não pode criar nem editar registros. |

> **Nota:** SUPER_ADMIN e ADMIN_EMPRESA nunca veem dados de outras empresas misturados — cada um enxerga apenas o que pertence à sua empresa (ou, no caso do SUPER_ADMIN, à empresa selecionada no cabeçalho).

---

## 2. Login

**Rota:** `/login`

Tela de acesso ao sistema. Dividida em dois painéis: logo à esquerda (azul escuro) e formulário à direita.

### Campos

| Campo | Descrição |
|---|---|
| **E-mail** | Endereço de e-mail cadastrado no sistema. |
| **Senha** | Senha do usuário. |

### Botões

| Botão | Ação |
|---|---|
| **Entrar** | Valida as credenciais e, se corretas, redireciona para o Dashboard. Fica desabilitado enquanto a requisição está em andamento. |
| **Esqueceu a senha?** | Link que redireciona para a tela de recuperação de senha. |

### Mensagens de erro

Se o e-mail ou senha estiverem incorretos, uma mensagem em vermelho é exibida acima do formulário.

> **Segurança:** O sistema limita a 5 tentativas de login por minuto por IP. Após exceder, novas tentativas são bloqueadas temporariamente.

---

## 3. Esqueci minha senha

**Rota:** `/esqueci-senha`

Permite solicitar o envio de um link de redefinição de senha para o e-mail cadastrado.

### Campos

| Campo | Descrição |
|---|---|
| **E-mail** | E-mail associado à conta. |

### Botões

| Botão | Ação |
|---|---|
| **Enviar link de redefinição** | Envia um e-mail com link temporário para redefinição de senha. |
| **Voltar para o login** | Retorna à tela de login sem realizar nenhuma ação. |

Após o envio, uma mensagem de confirmação é exibida. O link recebido por e-mail leva à tela `/reset-senha`, onde a nova senha deve ser digitada duas vezes para confirmação.

---

## 4. Navegação — Barra lateral e Cabeçalho

### Barra lateral (Sidebar)

A barra lateral fica sempre visível no lado esquerdo da tela (cor azul escuro `#0B2A4A`). Os itens exibidos variam conforme o perfil do usuário logado.

| Item do menu | Quem vê | Permissão necessária |
|---|---|---|
| Dashboard | Todos | `DASHBOARD_VIEW` |
| Contas Bancárias | Todos | `CONTA_BANCARIA_VIEW` |
| Importar Extrato | Todos | `EXTRATO_IMPORT` |
| Despesas | Todos | — |
| Contas a Pagar | Todos | `CONTAS_PAGAR_VIEW` |
| Contas a Receber | Todos | `CONTAS_RECEBER_VIEW` |
| Conciliação | SUPER_ADMIN e ADMIN_EMPRESA | `CONCILIACAO_EXECUTAR` |
| Usuários | SUPER_ADMIN e ADMIN_EMPRESA | — |
| Permissões | SUPER_ADMIN e ADMIN_EMPRESA | — |
| Relatório de Permissões | SUPER_ADMIN e ADMIN_EMPRESA | — |
| Auditoria | SUPER_ADMIN e ADMIN_EMPRESA | `AUDITORIA_VIEW` |
| DRE | SUPER_ADMIN e ADMIN_EMPRESA | — |
| Relatório Financeiro | SUPER_ADMIN e ADMIN_EMPRESA | — |
| Exportação | SUPER_ADMIN e ADMIN_EMPRESA | — |
| Empresas | SUPER_ADMIN apenas | — |

> SUPER_ADMIN sempre tem acesso total, independentemente de permissões configuradas.

### Cabeçalho (Header)

Exibido no topo de todas as telas após o login.

| Elemento | Descrição |
|---|---|
| **Seletor de empresa** (SUPER_ADMIN) | Dropdown que lista todas as empresas cadastradas. O SUPER_ADMIN deve selecionar uma empresa para visualizar dados específicos. A seleção é salva no navegador (localStorage). |
| **Nome do usuário / botão Sair** | Exibe o nome do usuário logado. Clicando em **Sair**, a sessão é encerrada e o usuário é redirecionado para o login. |

---

## 5. Dashboard Financeiro

**Rota:** `/`  
**Permissão:** `DASHBOARD_VIEW`

Visão consolidada da situação financeira da empresa no período selecionado.

### Filtro de Período

| Elemento | Descrição |
|---|---|
| **Campo "De"** | Data de início do período analisado. Padrão: primeiro dia do mês atual. |
| **Campo "Até"** | Data de fim do período analisado. Padrão: dia de hoje. |

Ao alterar qualquer data, os dados são recarregados automaticamente.

### Cards de Resumo Consolidado

Exibidos no topo, mostram totais de todas as contas da empresa:

| Card | O que mostra |
|---|---|
| **Contas Ativas** | Número total de contas bancárias ativas. |
| **Saldo Consolidado** | Soma dos saldos atuais de todas as contas. Fica em azul se positivo, vermelho se negativo. |
| **Total Entradas** | Soma de todos os créditos conciliados no período. |
| **Total Saídas** | Soma de todos os débitos conciliados no período. |

### Painel por Conta

Área dividida em dois:

**Esquerda — lista de contas (ResumoPorConta):**  
Cada conta é listada com banco, agência, número e saldo atual. Clique em uma conta para ver seus detalhes à direita.

**Direita — detalhes da conta selecionada:**

| Card | O que mostra |
|---|---|
| **Saldo Inicial** | Saldo de abertura da conta (configurado no cadastro). |
| **Total Entradas** | Créditos no período selecionado. |
| **Total Saídas** | Débitos no período selecionado. |
| **Saldo Atual** | Saldo calculado atual. Badge amarelo indica lançamentos pendentes de conciliação. |

**Alerta de diferença de conciliação:** aparece automaticamente se houver divergência entre o saldo calculado pelo sistema e o saldo do extrato bancário.

**Status de Conciliação:**

| Indicador | Significado |
|---|---|
| **Conciliados** (verde) | Lançamentos do extrato já vinculados a registros do sistema. |
| **Pendentes** (amarelo) | Lançamentos importados ainda aguardando conciliação. |
| **Não encontrados** (vermelho) | Lançamentos do extrato sem correspondência no sistema. |

> Se o SUPER_ADMIN não tiver selecionado uma empresa no cabeçalho, um banner azul pede que ele faça a seleção antes de ver qualquer dado.

---

## 6. Contas Bancárias

**Rota:** `/contas`  
**Permissão:** `CONTA_BANCARIA_VIEW`

Lista todas as contas bancárias da empresa em cards.

### Botões do cabeçalho

| Botão | Permissão | Ação |
|---|---|---|
| **Atualizar** | Todos | Recarrega a lista de contas do servidor. |
| **Nova Conta Bancária** | `CONTA_BANCARIA_CREATE` | Abre o formulário de cadastro de nova conta. |

### Card de cada conta

Cada conta exibe banco, agência, número da conta corrente, descrição (se houver), saldo inicial e saldo atual (em verde se positivo, vermelho se negativo). Um badge indica se a conta está **Ativa** ou **Inativa**.

| Botão no card | Permissão | Ação |
|---|---|---|
| **Lápis (Editar)** | `CONTA_BANCARIA_EDIT` | Abre o formulário de edição da conta selecionada. |
| **PowerOff (Inativar)** | `CONTA_BANCARIA_EDIT` | Inativa a conta. Aparece apenas em contas ativas. |
| **Power (Ativar)** | `CONTA_BANCARIA_EDIT` | Reativa a conta. Aparece apenas em contas inativas. |

> Contas inativas ficam com fundo amarelo claro. Uma conta não pode ser inativada se ainda tiver movimentações pendentes.

### Formulário de conta (modal)

Aberto ao clicar em **Nova Conta Bancária** ou no lápis de edição.

| Campo | Obrigatório | Descrição |
|---|---|---|
| Banco | Sim | Nome do banco (ex: Itaú, Bradesco). |
| Agência | Sim | Número da agência. |
| Número da conta | Sim | Número da conta corrente. |
| Descrição | Não | Apelido ou observação para identificar a conta. |
| Saldo Inicial | Não | Saldo de abertura. Padrão: R$ 0,00. Só disponível no cadastro. |

---

## 7. Importar Extrato

**Rota:** `/importar`  
**Permissão:** `EXTRATO_IMPORT`

Permite importar lançamentos bancários a partir de arquivo digital.

### Campos

| Campo | Obrigatório | Descrição |
|---|---|---|
| **Conta Bancária** | Sim | Selecione a conta para a qual o extrato pertence. |
| **Arquivo** | Sim | Arquivo do extrato bancário. |

### Área de upload

- **Arrastar e soltar:** arraste o arquivo diretamente para a área pontilhada.
- **Clique para selecionar:** clique na área para abrir o seletor de arquivos do sistema operacional.
- Após selecionar, o nome do arquivo aparece com um ícone de documento verde.
- O botão **X** ao lado do nome remove o arquivo selecionado para escolher outro.

### Formatos suportados

| Formato | Extensão | Descrição |
|---|---|---|
| OFX | `.ofx`, `.qfx` | Open Financial Exchange — padrão dos bancos brasileiros. |
| CSV | `.csv` | Planilha separada por vírgulas. |
| XLSX | `.xlsx`, `.xls` | Planilha Excel. |

Tamanho máximo: **10 MB**.

### Botões

| Botão | Ação |
|---|---|
| **Importar Extrato** | Envia o arquivo para processamento. Fica desabilitado se conta ou arquivo não estiverem selecionados. |

### Proteção contra duplicatas

O sistema calcula um hash SHA-256 de cada arquivo. Se o mesmo extrato já foi importado anteriormente, a importação é bloqueada automaticamente.

---

## 8. Despesas

**Rota:** `/despesas`  
**Permissão:** — (todos os usuários autenticados)

Exibe os lançamentos de débito (saídas) das contas bancárias importadas via extrato.

### Filtros

| Filtro | Descrição |
|---|---|
| **Conta** | Seleciona a conta bancária a ser visualizada. A primeira conta é selecionada automaticamente. |
| **Data início / Data fim** | Filtra lançamentos por intervalo de datas. |
| **Status** | Filtra por status de conciliação: Todos, Conciliado, Pendente ou Não encontrado. |

### Botões de filtro

| Botão | Ação |
|---|---|
| **Limpar** | Remove os filtros de data e status, mantendo a conta selecionada. |

### Tabela de despesas

Cada linha mostra: data, descrição, valor (em vermelho) e status de conciliação (badge colorido).

### Total filtrado

Exibido no canto superior direito: soma dos valores de todas as despesas atualmente visíveis na tabela.

### Paginação

| Botão | Ação |
|---|---|
| **Anterior** | Vai para a página anterior. Desabilitado na primeira página. |
| **Próxima** | Vai para a próxima página. Desabilitado na última página. |

---

## 9. Contas a Pagar

**Rota:** `/contas-pagar`  
**Permissão:** `CONTAS_PAGAR_VIEW`

Gerencia as previsões de pagamentos futuros (contas a pagar).

> **Importante:** Contas a pagar são previsões. O status **Paga** é atualizado automaticamente pela conciliação bancária — não é possível marcar como paga manualmente.

### Cabeçalho

| Elemento | Descrição |
|---|---|
| **Total em aberto** | Soma das contas com status ABERTA. Exibido em laranja. |
| **Nova Conta a Pagar** | Abre o formulário de cadastro. Visível apenas para usuários com permissão `CONTAS_PAGAR_CREATE`. |

### Tabela

Colunas: Descrição, Fornecedor, Valor, Vencimento, Recorrência, Status.

Badges de status:

| Status | Cor | Significado |
|---|---|---|
| ABERTA | Amarelo | Ainda não paga, dentro do prazo. |
| PAGA | Verde | Conciliada — pagamento identificado no extrato bancário. |
| ATRASADA | Vermelho | Vencimento passou sem conciliação. |
| CANCELADA | Cinza | Conta cancelada manualmente. |

### Botão de edição (por linha)

| Botão | Permissão | Ação |
|---|---|---|
| **Editar (lápis)** | `CONTAS_PAGAR_EDIT` | Abre o formulário de edição. Não disponível para contas com status PAGA. |

### Formulário de cadastro/edição

| Campo | Obrigatório | Descrição |
|---|---|---|
| Descrição | Sim | Identificação do pagamento (ex: "Aluguel Janeiro"). |
| Fornecedor | Não | Nome do fornecedor ou credor. |
| Valor | Sim | Valor do pagamento em reais. |
| Data de Vencimento | Sim | Data prevista para o pagamento. |
| Recorrência | Sim | Frequência: Nenhuma, Semanal, Mensal, Trimestral ou Anual. |
| Status | Sim (edição) | Permite alterar para CANCELADA. Não permite alterar para PAGA (apenas a conciliação faz isso). |

### Paginação

Navegação página a página com botões **Anterior** e **Próxima** (aparecem apenas quando há mais de 50 registros).

---

## 10. Contas a Receber

**Rota:** `/contas-receber`  
**Permissão:** `CONTAS_RECEBER_VIEW`

Gerencia as previsões de recebimentos futuros.

> **Importante:** Contas a receber são previsões. O status **Recebida** é atualizado automaticamente pela conciliação bancária.

### Cabeçalho

| Elemento | Descrição |
|---|---|
| **Total em aberto** | Soma das contas com status ABERTA. Exibido em verde. |
| **Nova Conta a Receber** | Abre o formulário de cadastro. Visível apenas para usuários com permissão `CONTAS_RECEBER_CREATE`. |

### Tabela

Colunas: Descrição, Cliente, Valor, Data de Recebimento, Recorrência, Status.

Badges de status:

| Status | Cor | Significado |
|---|---|---|
| ABERTA | Amarelo | Aguardando recebimento. |
| RECEBIDA | Verde | Identificada no extrato bancário via conciliação. |
| ATRASADA | Vermelho | Data de recebimento passou sem conciliação. |
| CANCELADA | Cinza | Conta cancelada. |

### Formulário de cadastro/edição

| Campo | Obrigatório | Descrição |
|---|---|---|
| Descrição | Sim | Identificação do recebimento (ex: "Fatura Cliente XYZ"). |
| Cliente | Não | Nome do cliente ou devedor. |
| Valor | Sim | Valor esperado em reais. |
| Data de Recebimento | Sim | Data prevista para o recebimento. |
| Recorrência | Sim | Frequência: Nenhuma, Semanal, Mensal, Trimestral ou Anual. |

---

## 11. Conciliação Bancária

**Rota:** `/conciliacao`  
**Permissão:** `CONCILIACAO_EXECUTAR` (SUPER_ADMIN e ADMIN_EMPRESA)

Permite reconciliar os lançamentos do extrato bancário com os registros do sistema.

### Filtros

| Filtro | Descrição |
|---|---|
| **Conta** | Seleciona a conta bancária. A primeira é selecionada automaticamente. |
| **Data início / Data fim** | Filtra lançamentos por data. |
| **Tipo** | Filtra por Crédito ou Débito. |

| Botão | Ação |
|---|---|
| **Limpar** | Remove os filtros de data e tipo, mantendo a conta. |

### Ações de conciliação (no cabeçalho)

| Botão | Ação |
|---|---|
| **Conciliação Automática** | O sistema tenta vincular automaticamente lançamentos do extrato com registros do sistema usando tolerância de ±2 dias e correspondência de valor. |
| **Conciliação Manual** | Permite ao usuário selecionar manualmente quais lançamentos do extrato correspondem a quais registros internos. |

### Badge de pendentes

Número amarelo ao lado do título "Conciliação" mostrando quantos lançamentos ainda estão aguardando conciliação.

### Tabela de lançamentos pendentes

Exibe os lançamentos importados com status **Pendente**. Colunas: Data, Descrição, Valor, Tipo, Ações.

Para cada lançamento, o ADMIN_EMPRESA pode vincular manualmente a uma Conta a Pagar ou Conta a Receber existente (botão de vínculo na coluna de ações). Após vinculação, o status muda para **Conciliado** e a conta a pagar/receber tem seu status atualizado automaticamente para Paga/Recebida.

**Estornar conciliação:** É possível desfazer uma conciliação já realizada, retornando o lançamento ao status Pendente e a conta a pagar/receber ao status original.

### Paginação

Botões **Anterior** e **Próxima** para navegar entre páginas de 50 registros.

---

## 12. DRE — Resultado Financeiro

**Rota:** `/dre`  
**Acesso:** SUPER_ADMIN e ADMIN_EMPRESA

Demonstrativo de Resultado do Exercício baseado exclusivamente em lançamentos **conciliados**.

### Filtro de período

| Campo | Descrição |
|---|---|
| **De** | Data de início do período. Padrão: primeiro dia do mês atual. |
| **Até** | Data de fim do período. Padrão: último dia do mês atual. |

| Botão | Ação |
|---|---|
| **Calcular** | Recalcula o DRE para o período selecionado. |

### Resultado exibido

O DRE apresenta:

| Item | Descrição |
|---|---|
| **Receitas** | Total de créditos conciliados no período. |
| **Despesas** | Total de débitos conciliados no período. |
| **Resultado** | Receitas menos Despesas. Positivo (verde) = lucro; Negativo (vermelho) = prejuízo. |

> **Atenção:** Apenas lançamentos conciliados entram no cálculo. Se o resultado aparecer zerado, verifique se a conciliação foi executada para o período.

---

## 13. Relatório Financeiro

**Rota:** `/relatorio-financeiro`  
**Acesso:** SUPER_ADMIN e ADMIN_EMPRESA

Visão detalhada dos lançamentos por período, com possibilidade de exportação.

### Filtro de período

Campos **De** e **Até** para selecionar o intervalo de análise.

### Botões

| Botão | Acesso | Ação |
|---|---|---|
| **Exportar CSV** | SUPER_ADMIN e ADMIN_EMPRESA | Baixa um arquivo CSV com todos os lançamentos do período. |

### Dados exibidos

Tabela com colunas: Data, Tipo (Crédito/Débito), Descrição, Valor, Banco, Conta Corrente, Status de Conciliação.

---

## 14. Exportação Contábil

**Rota:** `/exportacao`  
**Acesso:** SUPER_ADMIN e ADMIN_EMPRESA

Exporta lançamentos para uso em sistemas de contabilidade ou auditoria externa.

### Filtro de período

| Campo | Descrição |
|---|---|
| **Período — De** | Data de início. Padrão: primeiro dia do mês atual. |
| **Até** | Data de fim. Padrão: último dia do mês atual. |

### Botão de exportação

| Botão | Ação |
|---|---|
| **Baixar CSV** | Gera e faz download de um arquivo CSV com todos os lançamentos do período, independentemente do status de conciliação. |

### Estrutura do arquivo CSV exportado

`Data | Tipo | Descrição | Valor | Banco | Conta | Status`

---

## 15. Usuários

**Rota:** `/usuarios`  
**Acesso:** SUPER_ADMIN e ADMIN_EMPRESA

Gerencia os usuários com acesso ao sistema.

### Cabeçalho

| Elemento | Descrição |
|---|---|
| **Indicador de licença** (ADMIN_EMPRESA) | Exibe "X / Y usuários ativos", onde X é o número atual de ativos e Y é o limite contratado. Aparece em vermelho quando o limite está atingido. |
| **Novo Usuário** | Abre o formulário de criação. Fica desabilitado quando o limite de licença está atingido (ADMIN_EMPRESA). O botão mostra um tooltip explicativo ao passar o mouse. |

### Tabela de usuários

Colunas: Nome, E-mail, Empresa, Role (perfil), Status (Ativo/Inativo), Data de criação, Ações.

> SUPER_ADMIN vê usuários de todas as empresas. ADMIN_EMPRESA vê apenas os usuários da sua própria empresa.

### Formulário de novo usuário (modal)

| Campo | Obrigatório | Descrição |
|---|---|---|
| Nome | Sim | Nome completo do usuário. |
| E-mail | Sim | E-mail de acesso (único no sistema). |
| Senha | Sim | Senha inicial (mínimo recomendado: 8 caracteres). |
| Perfil (Role) | Sim | SUPER_ADMIN pode criar qualquer perfil. ADMIN_EMPRESA pode criar ADMIN_EMPRESA ou USUARIO. |
| Empresa | Sim (SUPER_ADMIN) | SUPER_ADMIN seleciona a empresa. ADMIN_EMPRESA já tem a empresa definida automaticamente. |

> Ao criar um ADMIN_EMPRESA, o sistema habilita automaticamente as permissões **Dashboard** e **Contas Bancárias**.

### Limite de licença

O ADMIN_EMPRESA só pode criar novos usuários até o limite configurado pelo SUPER_ADMIN na empresa (campo "Limite de usuários ativos"). Se o limite estiver atingido, o sistema bloqueia a criação e registra a tentativa no log de auditoria.

---

## 16. Permissões

**Rota:** `/permissoes`  
**Acesso:** SUPER_ADMIN e ADMIN_EMPRESA

Permite controlar individualmente quais funcionalidades cada usuário pode acessar.

### Painel esquerdo — lista de usuários

Campo de busca para filtrar por nome, e-mail ou empresa. A lista exibe todos os usuários visíveis para o perfil logado. Clique em um usuário para carregar suas permissões no painel direito.

### Painel direito — permissões do usuário

Exibe o nome, e-mail, empresa e perfil do usuário selecionado.

Abaixo, os toggles de permissão organizados em grupos:

| Grupo | Permissões |
|---|---|
| **Visualização** | Ver Dashboard, Ver Auditoria |
| **Extratos** | Importar Extrato |
| **Conciliação** | Executar Conciliação |
| **Contas Bancárias** | Ver, Criar, Editar Contas Bancárias |
| **Contas a Pagar** | Ver, Criar, Editar Contas a Pagar |
| **Contas a Receber** | Ver, Criar, Editar Contas a Receber |

Cada toggle tem dois estados:
- **Azul (ativado):** permissão habilitada — o usuário pode acessar a funcionalidade.
- **Cinza (desativado):** permissão desabilitada — o usuário vê a mensagem "Acesso Negado" ao tentar acessar.

A alteração é salva imediatamente ao clicar no toggle (sem botão de salvar). Um ícone giratório aparece enquanto a requisição está em andamento.

> Para usuários SUPER_ADMIN, os toggles ficam bloqueados e não podem ser alterados — SUPER_ADMIN tem acesso total por padrão.

---

## 17. Relatório de Permissões

**Rota:** `/relatorios`  
**Acesso:** SUPER_ADMIN e ADMIN_EMPRESA

Visão consolidada de todas as permissões de todos os usuários, útil para auditoria de acessos.

### Busca

Campo de texto para filtrar usuários por nome, e-mail ou empresa.

### Lista de usuários

Cada usuário aparece em um card clicável com:
- Nome, perfil (badge colorido) e status (Inativo se desativado).
- E-mail e empresa.
- Contador "X/13 permissões" mostrando quantas estão habilitadas.

Clique no card para **expandir** e ver o detalhe de cada permissão com ícone verde (habilitada) ou cinza (desabilitada).

### Botões

| Botão | Ação |
|---|---|
| **Exportar CSV** | Baixa um arquivo com todas as permissões de todos os usuários no formato: Nome, E-mail, Empresa, Role, Permissão, Habilitado. Desabilitado se não houver usuários carregados. |

---

## 18. Auditoria

**Rota:** `/auditoria`  
**Permissão:** `AUDITORIA_VIEW`

Registro imutável de todas as ações sensíveis realizadas no sistema.

### Filtro

| Campo | Descrição |
|---|---|
| **Tipo de ação** | Dropdown para filtrar por categoria de evento (Login, Importação, Conciliação, etc.). |

| Botão | Ação |
|---|---|
| **Limpar filtro** | Remove o filtro de ação selecionado. Aparece apenas quando um filtro está ativo. |

### Tabela de registros

Colunas: Data/hora, Usuário, Empresa, Ação (badge colorido), Entidade, Dados antes/depois.

Tipos de ação registrados:

| Ação | Descrição |
|---|---|
| LOGIN | Acesso ao sistema |
| IMPORTACAO_EXTRATO | Importação de arquivo de extrato |
| CONCILIACAO_AUTOMATICA | Execução de conciliação automática |
| CONCILIACAO_MANUAL | Vinculação manual de lançamento |
| ESTORNO_CONCILIACAO | Desfazer conciliação |
| CRIACAO_CONTA | Cadastro de conta bancária |
| ATUALIZACAO_CONTA | Edição de conta bancária |
| CRIACAO_EMPRESA | Cadastro de empresa |
| ATUALIZACAO_EMPRESA | Edição de empresa |
| CRIACAO_USUARIO | Cadastro de novo usuário |
| ALTERACAO_PERMISSAO | Alteração de permissão de usuário |
| CRIACAO_CONTA_PAGAR | Criação de conta a pagar |
| EDICAO_CONTA_PAGAR | Edição de conta a pagar |
| CRIACAO_CONTA_RECEBER | Criação de conta a receber |
| EDICAO_CONTA_RECEBER | Edição de conta a receber |
| ALTERACAO_LICENCA | Alteração do limite de usuários da empresa |
| TENTATIVA_LIMITE_USUARIOS | Tentativa bloqueada de criar usuário acima do limite |
| SOLICITACAO_RESET_SENHA | Solicitação de redefinição de senha |
| RESET_SENHA | Redefinição de senha concluída |

### Contador

Total de registros exibido no canto superior direito.

### Paginação

Botões **Anterior** e **Próxima** para navegar (aparecem apenas com mais de 50 registros).

---

## 19. Empresas (SUPER_ADMIN)

**Rota:** `/empresas`  
**Acesso:** Exclusivo para SUPER_ADMIN

Lista todas as empresas cadastradas no sistema.

### Botões do cabeçalho

| Botão | Ação |
|---|---|
| **Nova Empresa** | Navega para o formulário de cadastro de nova empresa (`/empresas/nova`). |

### Tabela de empresas

Colunas: Nome, CNPJ, Status (Ativa/Inativa), Data de cadastro, Ações.

| Botão na tabela | Ação |
|---|---|
| **Visualizar (olho)** | Navega para a tela de detalhes da empresa (`/empresas/:id`). |
| **Editar (lápis)** | Navega para o formulário de edição (`/empresas/:id/editar`). |

---

## 20. Visualizar Empresa

**Rota:** `/empresas/:id`  
**Acesso:** SUPER_ADMIN (todas), ADMIN_EMPRESA (própria empresa)

Exibe todos os dados cadastrados da empresa em formato somente leitura.

### Seções

| Seção | Dados exibidos |
|---|---|
| **Identificação** | Razão Social, Nome Fantasia, CNPJ, Inscrição Estadual, Inscrição Municipal |
| **Endereço** | CEP, Logradouro, Número, Complemento, Bairro, Cidade, Estado |
| **Contato** | Telefone, E-mail, Site |
| **Licença** | Limite máximo de usuários ativos |
| **Status** | Ativa ou Inativa, data de cadastro |

### Botões

| Botão | Acesso | Ação |
|---|---|---|
| **Editar** | SUPER_ADMIN | Navega para o formulário de edição. |
| **Voltar** | Todos | Retorna para a listagem de empresas. |

---

## 21. Cadastrar / Editar Empresa

**Rota:** `/empresas/nova` e `/empresas/:id/editar`  
**Acesso:** Exclusivo para SUPER_ADMIN

Formulário completo de cadastro ou edição de empresa.

### Seção — Identificação

| Campo | Obrigatório | Descrição |
|---|---|---|
| Razão Social | Sim | Nome oficial da empresa (até 200 caracteres). |
| Nome Fantasia | Não | Nome comercial/fantasia. |
| CNPJ | Sim | No formato `XX.XXX.XXX/XXXX-XX`. O sistema valida o formato automaticamente. |
| Inscrição Estadual | Não | Número de inscrição estadual. |
| Inscrição Municipal | Não | Número de inscrição municipal. |

### Seção — Endereço

| Campo | Obrigatório | Descrição |
|---|---|---|
| CEP | Não | Ao sair do campo (onBlur), o sistema busca automaticamente o endereço via API de CEP e preenche logradouro, bairro, cidade e estado. |
| Logradouro | Não | Rua, Avenida, etc. |
| Número | Não | Número do imóvel. |
| Complemento | Não | Apartamento, sala, bloco, etc. |
| Bairro | Não | Bairro. |
| Cidade | Não | Cidade. |
| Estado | Não | UF com 2 letras (convertido automaticamente para maiúsculas). |

### Seção — Contato

| Campo | Obrigatório | Descrição |
|---|---|---|
| Telefone | Não | Formatado automaticamente como `(00) 00000-0000`. |
| E-mail | Não | E-mail de contato da empresa. |
| Site | Não | Endereço web da empresa. |

### Seção — Licença

| Campo | Obrigatório | Descrição |
|---|---|---|
| Limite de usuários ativos | Sim | Número máximo de usuários ativos que a empresa pode ter. Padrão: 5. Mínimo: 1. Somente SUPER_ADMIN pode alterar este valor. |

### Seção — Status (somente na edição)

| Campo | Descrição |
|---|---|
| **Empresa ativa** (checkbox) | Desmarcado = empresa inativa (bloqueia acesso de todos os usuários da empresa). |

### Botões

| Botão | Ação |
|---|---|
| **Cancelar** | Retorna para a listagem de empresas sem salvar alterações. |
| **Criar Empresa / Salvar Alterações** | Valida e salva os dados. Fica desabilitado durante o processamento. |

> Ao criar uma empresa, o limite de usuários padrão é **5**. Pode ser ajustado a qualquer momento pelo SUPER_ADMIN no formulário de edição.

---

*Manual gerado automaticamente com base no código-fonte do CoreFinance.*  
*Versão: 2026-05-13*
