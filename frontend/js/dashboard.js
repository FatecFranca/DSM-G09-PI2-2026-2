// ========== VERIFICAÇÃO DE SESSÃO ==========
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'index.html';
}

// Dados do usuário — compatível com estrutura existente
let usuario;
try {
  usuario = JSON.parse(localStorage.getItem('usuario'));
} catch (e) {
  localStorage.clear();
  window.location.href = 'index.html';
}

// Exibe dados do usuário
document.getElementById('nomeUsuario').textContent = usuario.nome || usuario.email || 'Usuário';

// Tag de nível — compatível com ambos os formatos
const nivelTexto = (usuario.nivel_nome || usuario.nivel || 'consulta').toLowerCase().trim();
const tagNivel = document.getElementById('tagNivel');
if (tagNivel) {
  tagNivel.textContent = nivelTexto;
  tagNivel.className = `tag-nivel ${nivelTexto}`;
}

// Logout
document.getElementById('btnSair').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'index.html';
});

// ========== CARREGAR CONTADORES AUTOMATICAMENTE ==========
document.addEventListener('DOMContentLoaded', async () => {
  await carregarContadores();
});

async function carregarContadores() {
  // Carregar Clientes
  try {
    if (typeof listarClientes === 'function') {
      const dados = await listarClientes();
      document.getElementById('qtdClientes').textContent = dados.length;
    } else {
      document.getElementById('qtdClientes').textContent = '—';
      console.warn('Função listarClientes não encontrada');
    }
  } catch {
    document.getElementById('qtdClientes').textContent = '—';
  }

  // Carregar Materiais
  try {
    if (typeof listarMateriais === 'function') {
      const dados = await listarMateriais();
      document.getElementById('qtdMateriais').textContent = dados.length;
    } else {
      const res = await fetch('/api/materiais', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const dados = await res.json();
        document.getElementById('qtdMateriais').textContent = Array.isArray(dados) ? dados.length : '—';
      } else {
        document.getElementById('qtdMateriais').textContent = '—';
      }
    }
  } catch {
    document.getElementById('qtdMateriais').textContent = '—';
  }

  // Carregar Fornecedores
  try {
    if (typeof listarFornecedores === 'function') {
      const dados = await listarFornecedores();
      document.getElementById('qtdFornecedores').textContent = dados.length;
    } else {
      document.getElementById('qtdFornecedores').textContent = '—';
      console.warn('Função listarFornecedores não encontrada');
    }
  } catch {
    document.getElementById('qtdFornecedores').textContent = '—';
  }

  // Carregar ORÇAMENTOS
  try {
    const res = await fetch('/api/orcamentos', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const dados = await res.json();
      document.getElementById('qtdOrcamentos').textContent = Array.isArray(dados) ? dados.length : '—';
    } else {
      document.getElementById('qtdOrcamentos').textContent = '—';
    }
  } catch {
    document.getElementById('qtdOrcamentos').textContent = '—';
  }

  // Carregar PROJETOS ✅ NOVO
  try {
    if (typeof listarProjetos === 'function') {
      const dados = await listarProjetos();
      document.getElementById('qtdProjetos').textContent = dados.length;
    } else {
      const res = await fetch('/api/projetos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const dados = await res.json();
        document.getElementById('qtdProjetos').textContent = Array.isArray(dados) ? dados.length : '—';
      } else {
        document.getElementById('qtdProjetos').textContent = '—';
      }
    }
  } catch {
    document.getElementById('qtdProjetos').textContent = '—';
  }

  // Carregar Usuários
  try {
    if (typeof listarUsuarios === 'function') {
      const dados = await listarUsuarios();
      document.getElementById('qtdUsuarios').textContent = dados.length;
    } else {
      const res = await fetch('http://localhost:3001/api/usuarios', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const dados = await res.json();
        document.getElementById('qtdUsuarios').textContent = Array.isArray(dados) ? dados.length : '—';
      } else {
        document.getElementById('qtdUsuarios').textContent = '—';
      }
    }
  } catch {
    document.getElementById('qtdUsuarios').textContent = '—';
  }
}
