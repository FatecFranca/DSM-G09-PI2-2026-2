const BASE_URL = '/api';

// ===== AUTENTICAÇÃO =====
async function login(email, senha) {
  const resposta = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  });

  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({ erro: 'Falha na autenticação' }));
    throw new Error(erro.erro || 'E-mail ou senha inválidos');
  }

  const dados = await resposta.json();
  localStorage.setItem('token', dados.token);
  localStorage.setItem('usuario', JSON.stringify(dados.usuario));
  return dados;
}

// ===== FUNÇÃO AUXILIAR DE REQUISIÇÃO =====
function _comAuth(opcoes = {}) {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('⚠️ Token não encontrado — redirecionando...');
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }

  return {
    ...opcoes,
    headers: {
      ...opcoes.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
}

// ===== CLIENTES =====
async function listarClientes() {
  const resposta = await fetch(`${BASE_URL}/clientes`, _comAuth());
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) throw new Error('Falha ao listar clientes');
  return resposta.json();
}

async function cadastrarCliente(dados) {
  const resposta = await fetch(`${BASE_URL}/clientes`, _comAuth({
    method: 'POST',
    body: JSON.stringify(dados)
  }));
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) {
    const e = await resposta.json();
    throw new Error(e.erro || 'Erro ao cadastrar');
  }
  return resposta.json();
}

async function atualizarCliente(id, dados) {
  const resposta = await fetch(`${BASE_URL}/clientes/${id}`, _comAuth({
    method: 'PUT',
    body: JSON.stringify(dados)
  }));
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) {
    const e = await resposta.json();
    throw new Error(e.erro || 'Erro ao atualizar');
  }
  return resposta.json();
}

async function excluirCliente(id) {
  const resposta = await fetch(`${BASE_URL}/clientes/${id}`, _comAuth({ method: 'DELETE' }));
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) throw new Error('Erro ao excluir');
  return resposta.json();
}

async function buscarClientePorId(id) {
  const resposta = await fetch(`${BASE_URL}/clientes/${id}`, _comAuth());
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) throw new Error('Cliente não encontrado');
  return resposta.json();
}

// ===== FORNECEDORES =====
async function listarFornecedores() {
  const resposta = await fetch(`${BASE_URL}/fornecedores`, _comAuth());
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) throw new Error('Falha ao listar fornecedores');
  return resposta.json();
}

async function cadastrarFornecedor(dados) {
  const resposta = await fetch(`${BASE_URL}/fornecedores`, _comAuth({
    method: 'POST',
    body: JSON.stringify(dados)
  }));
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) {
    const e = await resposta.json();
    throw new Error(e.erro || 'Erro ao cadastrar');
  }
  return resposta.json();
}

async function atualizarFornecedor(id, dados) {
  const resposta = await fetch(`${BASE_URL}/fornecedores/${id}`, _comAuth({
    method: 'PUT',
    body: JSON.stringify(dados)
  }));
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) {
    const e = await resposta.json();
    throw new Error(e.erro || 'Erro ao atualizar');
  }
  return resposta.json();
}

async function excluirFornecedor(id) {
  const resposta = await fetch(`${BASE_URL}/fornecedores/${id}`, _comAuth({ method: 'DELETE' }));
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) throw new Error('Erro ao excluir');
  return resposta.json();
}

async function buscarFornecedorPorId(id) {
  const resposta = await fetch(`${BASE_URL}/fornecedores/${id}`, _comAuth());
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) throw new Error('Fornecedor não encontrado');
  return resposta.json();
}

// ===== USUÁRIOS =====
async function listarUsuarios() {
  const resposta = await fetch(`${BASE_URL}/usuarios`, _comAuth());
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) throw new Error('Falha ao listar usuários');
  return resposta.json();
}

async function cadastrarUsuario(dados) {
  const resposta = await fetch(`${BASE_URL}/usuarios`, _comAuth({
    method: 'POST',
    body: JSON.stringify(dados)
  }));
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) {
    const e = await resposta.json();
    throw new Error(e.erro || 'Erro ao cadastrar');
  }
  return resposta.json();
}

async function atualizarUsuario(id, dados) {
  const resposta = await fetch(`${BASE_URL}/usuarios/${id}`, _comAuth({
    method: 'PUT',
    body: JSON.stringify(dados)
  }));
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) {
    const e = await resposta.json();
    throw new Error(e.erro || 'Erro ao atualizar');
  }
  return resposta.json();
}

async function excluirUsuario(id) {
  const resposta = await fetch(`${BASE_URL}/usuarios/${id}`, _comAuth({ method: 'DELETE' }));
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) throw new Error('Erro ao excluir');
  return resposta.json();
}

async function buscarUsuarioPorId(id) {
  const resposta = await fetch(`${BASE_URL}/usuarios/${id}`, _comAuth());
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) throw new Error('Usuário não encontrado');
  return resposta.json();
}

// ===== NÍVEIS DE ACESSO =====
async function listarNiveisAcesso() {
  const resposta = await fetch(`${BASE_URL}/usuarios/niveis`, _comAuth());
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) throw new Error('Falha ao carregar níveis');
  return resposta.json();
}

// ===== MATERIAIS =====
async function listarMateriais() {
  const resposta = await fetch(`${BASE_URL}/materiais`, _comAuth());
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) throw new Error('Falha ao listar materiais');
  return resposta.json();
}

async function cadastrarMaterial(dados) {
  const resposta = await fetch(`${BASE_URL}/materiais`, _comAuth({
    method: 'POST',
    body: JSON.stringify(dados)
  }));
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) {
    const e = await resposta.json();
    throw new Error(e.erro || 'Erro ao cadastrar material');
  }
  return resposta.json();
}

async function atualizarMaterial(id, dados) {
  const resposta = await fetch(`${BASE_URL}/materiais/${id}`, _comAuth({
    method: 'PUT',
    body: JSON.stringify(dados)
  }));
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) {
    const e = await resposta.json();
    throw new Error(e.erro || 'Erro ao atualizar material');
  }
  return resposta.json();
}

async function excluirMaterial(id) {
  const resposta = await fetch(`${BASE_URL}/materiais/${id}`, _comAuth({ method: 'DELETE' }));
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) throw new Error('Erro ao excluir material');
  return resposta.json();
}

async function buscarMaterialPorId(id) {
  const resposta = await fetch(`${BASE_URL}/materiais/${id}`, _comAuth());
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) throw new Error('Material não encontrado');
  return resposta.json();
}

// ===== ORÇAMENTOS =====
async function listarOrcamentos() {
  const resposta = await fetch(`${BASE_URL}/orcamentos`, _comAuth());
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) throw new Error('Falha ao listar orçamentos');
  return resposta.json();
}

async function cadastrarOrcamento(dados) {
  const resposta = await fetch(`${BASE_URL}/orcamentos`, _comAuth({
    method: 'POST',
    body: JSON.stringify(dados)
  }));
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) {
    const e = await resposta.json();
    throw new Error(e.erro || 'Erro ao cadastrar orçamento');
  }
  return resposta.json();
}

async function atualizarOrcamento(id, dados) {
  const resposta = await fetch(`${BASE_URL}/orcamentos/${id}`, _comAuth({
    method: 'PUT',
    body: JSON.stringify(dados)
  }));
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) {
    const e = await resposta.json();
    throw new Error(e.erro || 'Erro ao atualizar orçamento');
  }
  return resposta.json();
}

async function excluirOrcamento(id) {
  const resposta = await fetch(`${BASE_URL}/orcamentos/${id}`, _comAuth({ method: 'DELETE' }));
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) throw new Error('Erro ao excluir orçamento');
  return resposta.json();
}

async function buscarOrcamentoPorId(id) {
  const resposta = await fetch(`${BASE_URL}/orcamentos/${id}`, _comAuth());
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) throw new Error('Orçamento não encontrado');
  return resposta.json();
}

async function listarStatusOrcamentos() {
  const resposta = await fetch(`${BASE_URL}/orcamentos/status`, _comAuth());
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) throw new Error('Falha ao carregar status de orçamentos');
  return resposta.json();
}

// ===== PROJETOS =====
async function listarProjetos() {
  const resposta = await fetch(`${BASE_URL}/projetos`, _comAuth());
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) throw new Error('Falha ao listar projetos');
  return resposta.json();
}

async function cadastrarProjeto(dados) {
  const resposta = await fetch(`${BASE_URL}/projetos`, _comAuth({
    method: 'POST',
    body: JSON.stringify(dados)
  }));
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) {
    const e = await resposta.json();
    throw new Error(e.erro || 'Erro ao cadastrar projeto');
  }
  return resposta.json();
}

async function atualizarProjeto(id, dados) {
  const resposta = await fetch(`${BASE_URL}/projetos/${id}`, _comAuth({
    method: 'PUT',
    body: JSON.stringify(dados)
  }));
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) {
    const e = await resposta.json();
    throw new Error(e.erro || 'Erro ao atualizar projeto');
  }
  return resposta.json();
}

async function excluirProjeto(id) {
  const resposta = await fetch(`${BASE_URL}/projetos/${id}`, _comAuth({ method: 'DELETE' }));
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) throw new Error('Erro ao excluir projeto');
  return resposta.json();
}

async function buscarProjetoPorId(id) {
  const resposta = await fetch(`${BASE_URL}/projetos/${id}`, _comAuth());
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) throw new Error('Projeto não encontrado');
  return resposta.json();
}

async function listarStatusProjetos() {
  const resposta = await fetch(`${BASE_URL}/projetos/status`, _comAuth());
  if (resposta.status === 401) {
    localStorage.clear();
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }
  if (!resposta.ok) throw new Error('Falha ao carregar status de projetos');
  return resposta.json();
}
