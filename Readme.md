# SIS_PI — Sistema de Gestão Integrada

**Versão:** 1.0 | **Data:** 08/11/2026 | **Ambiente:** Node.js + MySQL + HTML5/React

---

## 1️⃣ ESTRUTURA DE DIRETÓRIOS

```
sis_pi/
├── backend/                          # Aplicação Node.js / Express
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # Conexão MySQL
│   │   │   └── jwt.js                # Configuração de token
│   │   ├── middleware/
│   │   │   ├── auth.js               # Validação de token
│   │   │   ├── nivelAcesso.js        # Controle de permissões
│   │   │   └── tratamentoErros.js    # Respostas padronizadas
│   │   ├── controllers/              # Lógica de negócio
│   │   │   ├── authController.js
│   │   │   ├── clientesController.js
│   │   │   ├── fornecedoresController.js
│   │   │   ├── materiaisController.js
│   │   │   ├── orcamentosController.js
│   │   │   ├── projetosController.js
│   │   │   └── usuariosController.js
│   │   ├── routes/                    # Definição de endpoints
│   │   │   ├── auth.js
│   │   │   ├── clientes.js
│   │   │   ├── fornecedores.js
│   │   │   ├── materiais.js
│   │   │   ├── orcamentos.js
│   │   │   ├── projetos.js
│   │   │   └── usuarios.js
│   │   ├── models/                    # Camada de acesso ao BD
│   │   └── server.js                  # Inicialização do servidor
│   ├── .env                           # Variáveis de ambiente
│   ├── package.json
│   └── sis_pi.sql                     # Script de criação do BD
│
├── frontend-html/                     # Versão Tradicional — Vanilla JS
│   ├── login.html
│   ├── dashboard.html
│   ├── clientes.html
│   ├── fornecedores.html
│   ├── materiais.html
│   ├── orcamentos.html
│   ├── projetos.html
│   ├── usuarios.html
│   ├── css/
│   │   └── estilo.css                 # Estilos globais
│   └── js/
│       ├── api.js                     # Cliente HTTP
│       ├── auth.js                    # Login/sessão
│       ├── validacoes.js              # Máscaras + ViaCEP
│       ├── dashboard.js
│       ├── clientes.js
│       ├── fornecedores.js
│       ├── materiais.js
│       ├── orcamentos.js
│       ├── projetos.js
│       └── usuarios.js
│
└── frontend-react/                    # Versão SPA — React
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── PrivateRoute.jsx
    │   │   └── Layout.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Home.jsx
    │   │   ├── clientes/
    │   │   │   ├── Listar.jsx
    │   │   │   ├── Cadastrar.jsx
    │   │   │   └── Editar.jsx
    │   │   ├── fornecedores/
    │   │   │   ├── Listar.jsx
    │   │   │   ├── Cadastrar.jsx
    │   │   │   └── Editar.jsx
    │   │   ├── materiais/
    │   │   ├── orcamentos/
    │   │   ├── projetos/
    │   │   └── usuarios/
    │   ├── services/
    │   │   └── api.js                 # Axios + interceptores
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

---

## 2️⃣ BANCO DE DADOS — `sis_pi`

### 2.1 Tabelas e Relacionamentos

Tabela

| Tabela | Campos Principais | Relacionamentos | Exclusão |
| --- | --- | --- | --- |
| **`niveis_acesso`** | `nivel_id`, `nivel_nome`, `ordem` | — | — |
| **`usuarios`** | `id`, `nome`, `email`, `senha`, `nivel_id`, `usu_ativo`, `ultimo_acesso` | `nivel_id` → `niveis_acesso` | SET NULL |
| **`user_tokens`** | `id`, `usuario_id`, `refresh_token`, `expires_at` | `usuario_id` → `usuarios` | CASCADE |
| **`clientes`** | `id`, `cli_tipo`, `cli_nome_razao`, `cli_cpf/cnpj`, `cli_endereco`, `cli_limite_credito` | `cadastrado_por` → `usuarios` | SET NULL |
| **`fornecedores`** | `id`, `for_tipo`, `for_nome_razao`, `for_categoria`, `for_banco`, `for_pix` | `cadastrado_por` → `usuarios` | SET NULL |
| **`materiais`** | `id`, `nome`, `unidade`, `preco_unitario`, `deleted_at` | — | — |
| **`status_orcamentos`** | `id`, `nome` (5 status fixos) | — | — |
| **`orcamentos`** | `id`, `cliente_id`, `tipo`, `data`, `valor_total`, `status_id`, `deleted_at` | `cliente_id` → `clientes`; `status_id` → `status_orcamentos` | CASCADE |
| **`orcamento_itens`** | `id`, `orcamento_id`, `material_id`, `quantidade`, `subtotal` | `orcamento_id` → `orcamentos`; `material_id` → `materiais` | CASCADE |
| **`status_projetos`** | `id`, `nome` (5 status fixos) | — | — |
| **`projetos`** | `id`, `nome`, `cliente_id`, `tipo`, `datas`, `status_id`, `deleted_at` | `cliente_id` → `clientes`; `status_id` → `status_projetos` | SET NULL |
| **`projeto_orcamentos`** | `id`, `projeto_id`, `orcamento_id` (chave única composta) | `projeto_id` → `projetos`; `orcamento_id` → `orcamentos` | CASCADE |

### 2.2 Diagrama de Fluxo

```
niveis_acesso
    ↓ 1:N
usuarios → user_tokens (sessões)
    │
    ├→ clientes ←──┬── orcamentos ←── orcamento_itens → materiais
    │              │      ↓
    │              │      └── status_orcamentos
    │              │
    └→ fornecedores └── projetos ←── projeto_orcamentos ←──┘
                         ↓
                         └── status_projetos
```

### 2.3 Usuário Padrão

- **E-mail:** `admin@sistema.com`
- **Senha:** `123456` (hash bcrypt incluso no script)
- **Nível:** Administrador — permissão total

---

## 3️⃣ MÓDULOS DO SISTEMA

### 3.1 Autenticação

Tabela

| Item | Detalhe |
| --- | --- |
| Arquivo HTML | `login.html` |
| Arquivo JS | `auth.js` |
| Endpoint | `POST /api/auth/login` |
| Retorno | `{ token, refreshToken, usuario: { id, nome, email, nivel } }` |
| Sessão | `localStorage.setItem('token', ...)` |
| Logout | `POST /api/auth/logout` + limpeza do storage |

### 3.2 Dashboard — Painel de Visão Geral

Tabela

| Item | Detalhe |
| --- | --- |
| Arquivo | `dashboard.html` + `dashboard.js` |
| Contadores | Clientes, Fornecedores, Materiais, Orçamentos, Projetos, Usuários |
| Endpoints | `GET /api/clientes/contagem`, `/api/fornecedores/contagem`, etc. |
| Navegação | Botões "Novo" e "Ver Lista" → direcionam para cada módulo |

### 3.3 Módulo Clientes

Tabela

| Item | Detalhe |
| --- | --- |
| Arquivo | `clientes.html` + `clientes.js` |
| Tipo | Pessoa Física / Jurídica → campos alternam dinamicamente |
| Campos exclusivos | Limite de Crédito |
| Endpoints | `GET/POST/PUT/DELETE /api/clientes` |
| Validação | CPF/CNPJ + CEP (ViaCEP) |

### 3.4 Módulo Fornecedores

Tabela

| Item | Detalhe |
| --- | --- |
| Arquivo | `fornecedores.html` + `fornecedores.js` |
| Tipo | Pessoa Física / Jurídica |
| Campos exclusivos | Categoria, Condição de Pagamento, Prazo de Entrega, Dados Bancários, Chave PIX |
| Endpoints | `GET/POST/PUT/DELETE /api/fornecedores` |

### 3.5 Módulo Materiais

Tabela

| Item | Detalhe |
| --- | --- |
| Arquivo | `materiais.html` + `materiais.js` |
| Campos | Nome, Unidade, Preço Unitário |
| Uso | Composição de orçamentos (preço × quantidade = subtotal) |
| Endpoints | `GET/POST/PUT/DELETE /api/materiais` |
| Exclusão | Lógica (`deleted_at`) — preserva histórico |

### 3.6 Módulo Orçamentos

Tabela

| Item | Detalhe |
| --- | --- |
| Arquivo | `orcamentos.html` + `orcamentos.js` |
| Cabeçalho | Cliente, Tipo, Data, Status |
| Itens | Seleção de material + quantidade → cálculo automático de subtotal e valor total |
| Tipos | Rede Elétrica / Cabeamento Estruturado / IoT |
| Status | Pendente, Aguardando, Aprovado, Concluído, Cancelado |
| Endpoints | `GET/POST/PUT/DELETE /api/orcamentos` + `/api/orcamentos/:id/itens` |

### 3.7 Módulo Projetos

Tabela

| Item | Detalhe |
| --- | --- |
| Arquivo | `projetos.html` + `projetos.js` |
| Cabeçalho | Nome, Cliente, Tipo, Data Início/Término, Status |
| Vínculo | Seleção de Cliente+Tipo → carrega orçamentos correspondentes → seleção múltipla |
| Status | Planejamento, Em Execução, Concluído, Suspenso, Cancelado |
| Endpoints | `GET/POST/PUT/DELETE /api/projetos` + `/api/projetos/:id/orcamentos` |

### 3.8 Módulo Usuários

Tabela

| Item | Detalhe |
| --- | --- |
| Arquivo | `usuarios.html` + `usuarios.js` |
| Campos | Nome, E-mail, Senha (opcional em edição), Nível, Status Ativo/Inativo |
| Níveis | Administrador (1) → Gerente (2) → Operador (3) → Consulta (4) |
| Permissão | Restrito a Administradores |
| Endpoints | `GET/POST/PUT/DELETE /api/usuarios` + `/api/usuarios/niveis` |

---

## 4️⃣ ENDPOINTS PREVISTOS — Resumo

Tabela

| Módulo | GET Lista | POST Incluir | PUT Alterar | DELETE Excluir | Extra |
| --- | --- | --- | --- | --- | --- |
| **Auth** | — | `/login` | — | `/logout` | `/refresh` |
| **Clientes** | `/api/clientes` | ✅ | ✅ | ✅ | `/contagem` |
| **Fornecedores** | `/api/fornecedores` | ✅ | ✅ | ✅ | `/contagem` |
| **Materiais** | `/api/materiais` | ✅ | ✅ | ✅ | `/contagem` |
| **Orçamentos** | `/api/orcamentos` | ✅ | ✅ | ✅ | `/:id/itens`, `/contagem` |
| **Projetos** | `/api/projetos` | ✅ | ✅ | ✅ | `/:id/orcamentos`, `/contagem` |
| **Usuários** | `/api/usuarios` | ✅ | ✅ | ✅ | `/niveis`, `/contagem` |

### Padrão de Resposta

```
{
  "sucesso": true,
  "dados": { ... },
  "mensagem": "Operação realizada com sucesso"
}
```

**Erro:** `{ "sucesso": false, "erro": "Descrição do problema" }`

---

## 5️⃣ REGRAS DE PERMISSÃO — Níveis de Acesso

Tabela

| Nível | ID | Visualizar | Incluir/Editar | Excluir | Usuários |
| --- | --- | --- | --- | --- | --- |
| Consulta | 4 | ✅ | ❌ | ❌ | ❌ |
| Operador | 3 | ✅ | ✅ | ❌ | ❌ |
| Gerente | 2 | ✅ | ✅ | ✅ | Visualização |
| Administrador | 1 | ✅ | ✅ | ✅ | ✅ Completo |

---

## 6️⃣ RESUMO GERAL

Tabela

| Componente | Quantidade | Status |
| --- | --- | --- |
| Páginas HTML | 8 | ✅ Concluído |
| Scripts JS | 8 | ✅ Concluído |
| Tabelas no Banco | 12 | ✅ Definido |
| Usuário Padrão | 1 | ✅ Incluído |
| Endpoints Previstos | ~30 | ✅ Estruturado |
| Versão React SPA | Parcial | ⏳ Implementar módulos restantes |
| Documentação | — | ✅ Consolidada |