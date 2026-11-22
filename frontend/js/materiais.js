if (!localStorage.getItem('token')) {
  window.location.href = 'index.html';
}
const usuario = JSON.parse(localStorage.getItem('usuario'));
document.getElementById('nomeUsuario').textContent = usuario.nome;

document.getElementById('btnSair').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'index.html';
});

const form = document.getElementById('formMaterial');
const tituloForm = document.getElementById('tituloForm');
const mensagem = document.getElementById('mensagem');
const lista = document.getElementById('listaMateriais');
const btnCancelar = document.getElementById('btnCancelar');

carregarLista();

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  mensagem.textContent = '';
  mensagem.className = 'mensagem';

  const id = document.getElementById('materialId').value;
  const precoTexto = document.getElementById('mat_preco_unitario').value;
  const preco = parseFloat(precoTexto.replace(',', '.'));

  if (!precoTexto || isNaN(preco) || preco <= 0) {
    mensagem.textContent = '❌ Preço Unitário é obrigatório';
    mensagem.classList.add('erro');
    return;
  }

  const dados = {
    nome: document.getElementById('mat_nome').value.trim(),
    unidade: document.getElementById('mat_unidade').value.trim(),
    preco_unitario: preco
  };

  try {
    if (id) {
      await atualizarMaterial(id, dados);
      mensagem.textContent = '✅ Material atualizado com sucesso!';
    } else {
      await cadastrarMaterial(dados);
      mensagem.textContent = '✅ Material cadastrado com sucesso!';
    }
    mensagem.classList.add('sucesso');
    resetarForm();
    await carregarLista();
  } catch (erro) {
    mensagem.textContent = '❌ ' + erro.message;
    mensagem.classList.add('erro');
  }
});

btnCancelar.addEventListener('click', resetarForm);

async function carregarLista() {
  try {
    const materiais = await listarMateriais();
    document.getElementById('contagem').textContent = `(${materiais.length})`;
    lista.innerHTML = '';

    materiais.forEach(m => {
      const precoFmt = m.preco_unitario
        ? Number(m.preco_unitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        : '—';
      lista.innerHTML += `
        <tr>
          <td>${m.nome || ''}</td>
          <td>${m.unidade || ''}</td>
          <td>${precoFmt}</td>
          <td class="acoes">
            <button class="btn-icone btn-editar" data-id="${m.id}" title="Editar">✏️</button>
            <button class="btn-icone btn-excluir" data-id="${m.id}" title="Excluir">🗑️</button>
          </td>
        </tr>
      `;
    });

    document.querySelectorAll('.btn-editar').forEach(btn => {
      btn.addEventListener('click', () => carregarEdicao(btn.dataset.id));
    });
    document.querySelectorAll('.btn-excluir').forEach(btn => {
      btn.addEventListener('click', () => excluir(btn.dataset.id));
    });
  } catch (erro) {
    console.error('Erro lista:', erro);
    mensagem.textContent = '❌ Erro ao carregar lista';
    mensagem.classList.add('erro');
  }
}

async function carregarEdicao(id) {
  try {
    const m = await buscarMaterialPorId(id);

    document.getElementById('materialId').value = m.id || '';
    document.getElementById('mat_nome').value = m.nome || '';
    document.getElementById('mat_unidade').value = m.unidade || '';
    
    if (m.preco_unitario) {
      document.getElementById('mat_preco_unitario').value = String(m.preco_unitario).replace('.', ',');
    } else {
      document.getElementById('mat_preco_unitario').value = '';
    }

    tituloForm.textContent = 'Editar Material';
    mensagem.textContent = '';
  } catch (erro) {
    alert('Erro: ' + erro.message);
  }
}

async function excluir(id) {
  if (!confirm('Tem certeza que deseja excluir este material?')) return;
  try {
    await excluirMaterial(id);
    mensagem.textContent = '✅ Material excluído com sucesso!';
    mensagem.classList.add('sucesso');
    await carregarLista();
  } catch (erro) {
    mensagem.textContent = '❌ ' + erro.message;
    mensagem.classList.add('erro');
  }
}

function resetarForm() {
  form.reset();
  document.getElementById('materialId').value = '';
  tituloForm.textContent = 'Novo Material';
  mensagem.textContent = '';
  mensagem.className = 'mensagem';
}
