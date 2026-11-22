// =====================================================
// USUÁRIOS — Sistema de Gestão (com tabela niveis_acesso)
// =====================================================

// Verificar sessão
if (!localStorage.getItem('token')) {
  window.location.href = 'index.html';
}
const usuario = JSON.parse(localStorage.getItem('usuario'));
document.getElementById('nomeUsuario').textContent = usuario.nome;
document.getElementById('nivelUsuario').textContent = usuario.nivel;

// Logout
document.getElementById('btnSair').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'index.html';
});

// Elementos
const form = document.getElementById('formUsuario');
const tituloForm = document.getElementById('tituloForm');
const mensagem = document.getElementById('mensagem');
const lista = document.getElementById('listaUsuarios');
const btnCancelar = document.getElementById('btnCancelar');
const btnListar = document.getElementById('btnListar');
const selectNivel = document.getElementById('usu_nivel');

let listaNiveis = [];

// Inicializar
carregarNiveis();
carregarLista();
btnListar.addEventListener('click', carregarLista);

// Carregar níveis do banco
async function carregarNiveis() {
  try {
    listaNiveis = await listarNiveisAcesso();
    renderizarNiveis();
  } catch (erro) {
    console.error('Erro ao carregar níveis:', erro);
    selectNivel.innerHTML = '<option value="">Erro ao carregar</option>';
  }
}

function renderizarNiveis(valorSelecionado = null) {
  selectNivel.innerHTML = listaNiveis.map(n => `
    <option value="${n.nivel_id}" ${valorSelecionado == n.nivel_id ? 'selected' : ''}>
      ${n.nivel_nome}
    </option>
  `).join('');
}

// Submissão do formulário
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  mensagem.textContent = '';
  mensagem.className = 'mensagem';

  const id = document.getElementById('usuarioId').value;
  const dados = {
    nome: document.getElementById('usu_nome').value.trim(),
    email: document.getElementById('usu_email').value.trim(),
    senha: document.getElementById('usu_senha').value.trim() || null,
    nivelId: parseInt(selectNivel.value),
    ativo: parseInt(document.getElementById('usu_ativo').value)
  };

  try {
    if (id) {
      await atualizarUsuario(id, dados);
      mensagem.textContent = '✅ Usuário atualizado com sucesso!';
    } else {
      if (!dados.senha) {
        mensagem.textContent = '❌ Senha é obrigatória para novo usuário';
        mensagem.classList.add('erro');
        return;
      }
      await cadastrarUsuario(dados);
      mensagem.textContent = '✅ Usuário cadastrado com sucesso!';
    }
    mensagem.classList.add('sucesso');
    resetarForm();
    await carregarLista();
  } catch (erro) {
    mensagem.textContent = `❌ ${erro.message}`;
    mensagem.classList.add('erro');
  }
});

// Cancelar
btnCancelar.addEventListener('click', resetarForm);

// Carregar lista
async function carregarLista() {
  try {
    const usuarios = await listarUsuarios();
    document.getElementById('contagem').textContent = `(${usuarios.length})`;

    if (usuarios.length === 0) {
      lista.innerHTML = '<tr><td colspan="5" class="vazio">Nenhum usuário cadastrado</td></tr>';
      return;
    }

    lista.innerHTML = usuarios.map(u => `
      <tr>
        <td><strong>${u.nome}</strong></td>
        <td>${u.email}</td>
        <td><span class="tag">${u.nivel}</span></td>
        <td>
          <span class="status ${u.ativo ? 'ativo' : 'inativo'}">
            ${u.ativo ? 'Ativo' : 'Inativo'}
          </span>
        </td>
        <td class="acoes">
          <button class="editar" data-id="${u.id}" title="Editar">✏️</button>
          <button class="excluir" data-id="${u.id}" title="Excluir">🗑️</button>
        </td>
      </tr>
    `).join('');

    // Vincular eventos
    document.querySelectorAll('.editar').forEach(btn => {
      btn.addEventListener('click', () => carregarParaEdicao(btn.dataset.id));
    });
    document.querySelectorAll('.excluir').forEach(btn => {
      btn.addEventListener('click', () => confirmarExclusao(btn.dataset.id));
    });
  } catch {
    alert('Sessão expirada — faça login novamente');
    localStorage.clear();
    window.location.href = 'index.html';
  }
}

// Carregar para edição
async function carregarParaEdicao(id) {
  try {
    const u = await buscarUsuarioPorId(id);
    
    document.getElementById('usuarioId').value = u.id;
    document.getElementById('usu_nome').value = u.nome;
    document.getElementById('usu_email').value = u.email;
    document.getElementById('usu_senha').value = '';
    document.getElementById('usu_ativo').value = u.ativo;
    
    // Seleciona o nível correto
    renderizarNiveis(u.nivelId);

    tituloForm.textContent = '✏️ Editar Usuário';
    mensagem.textContent = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (erro) {
    alert(erro.message);
  }
}

// Confirmar exclusão
async function confirmarExclusao(id) {
  if (!confirm('Tem certeza que deseja excluir este usuário?\nEsta ação não pode ser desfeita.')) return;

  try {
    await excluirUsuario(id);
    mensagem.textContent = '✅ Usuário excluído com sucesso!';
    mensagem.classList.add('sucesso');
    await carregarLista();
  } catch (erro) {
    mensagem.textContent = `❌ ${erro.message}`;
    mensagem.classList.add('erro');
  }
}

// Resetar formulário
function resetarForm() {
  form.reset();
  document.getElementById('usuarioId').value = '';
  tituloForm.textContent = '➕ Novo Usuário';
  mensagem.textContent = '';
  mensagem.className = 'mensagem';
  renderizarNiveis();
}
