// =====================================================
// CLIENTES — Sistema de Gestão
// Sem módulos: compatível com arquivo local (file://)
// =====================================================

// ===== VERIFICAÇÃO DE SESSÃO =====
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

// ===== ELEMENTOS =====
const form = document.getElementById('formCliente');
const tituloForm = document.getElementById('tituloForm');
const mensagem = document.getElementById('mensagem');
const lista = document.getElementById('listaClientes');
const btnCancelar = document.getElementById('btnCancelar');
const selectTipo = document.getElementById('cli_tipo');

// ===== CONTROLE DE CAMPOS POR TIPO =====
function atualizarCamposPorTipo() {
  const tipo = selectTipo?.value;

  if (!tipo) {
    document.querySelectorAll('.campo-fisica').forEach(el => el.classList.remove('oculto'));
    document.querySelectorAll('.campo-juridica').forEach(el => el.classList.remove('oculto'));
    return;
  }

  const camposFisica = document.querySelectorAll('.campo-fisica');
  const camposJuridica = document.querySelectorAll('.campo-juridica');

  if (tipo === 'F') {
    camposFisica.forEach(el => el.classList.remove('oculto'));
    camposJuridica.forEach(el => el.classList.add('oculto'));
    document.getElementById('cli_cnpj').value = '';
    document.getElementById('cli_ie').value = '';
    document.getElementById('cli_im').value = '';
  } else if (tipo === 'J') {
    camposJuridica.forEach(el => el.classList.remove('oculto'));
    camposFisica.forEach(el => el.classList.add('oculto'));
    document.getElementById('cli_cpf').value = '';
    document.getElementById('cli_rg').value = '';
  }
}

selectTipo.addEventListener('change', atualizarCamposPorTipo);
atualizarCamposPorTipo();

// ===== CARREGAR LISTA AO INICIAR =====
carregarLista();

// ===== SUBMISSÃO DO FORMULÁRIO =====
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  mensagem.textContent = '';
  mensagem.className = 'mensagem';

  const tipo = document.getElementById('cli_tipo').value;

  // Validações específicas por tipo
  if (tipo === 'F') {
    const cpf = document.getElementById('cli_cpf').value;
    if (!cpf) {
      mensagem.textContent = '❌ CPF é obrigatório para Pessoa Física';
      mensagem.classList.add('erro');
      return;
    }
    if (!validarCPF(cpf)) {
      mensagem.textContent = '❌ CPF inválido';
      mensagem.classList.add('erro');
      return;
    }
  } else if (tipo === 'J') {
    const cnpj = document.getElementById('cli_cnpj').value;
    if (!cnpj) {
      mensagem.textContent = '❌ CNPJ é obrigatório para Pessoa Jurídica';
      mensagem.classList.add('erro');
      return;
    }
    if (!validarCNPJ(cnpj)) {
      mensagem.textContent = '❌ CNPJ inválido';
      mensagem.classList.add('erro');
      return;
    }
  }

  // Validação de celular
  if (!validarTelefone(document.getElementById('cli_celular').value)) {
    mensagem.textContent = '❌ Celular inválido — deve conter DDD + número';
    mensagem.classList.add('erro');
    return;
  }

  // Validação de telefone fixo (se preenchido)
  const telefone = document.getElementById('cli_telefone').value;
  if (telefone && !validarTelefone(telefone)) {
    mensagem.textContent = '❌ Telefone inválido';
    mensagem.classList.add('erro');
    return;
  }

  // Validação de CEP
  if (!validarCEP(document.getElementById('cli_cep').value)) {
    mensagem.textContent = '❌ CEP inválido — digite 8 dígitos';
    mensagem.classList.add('erro');
    return;
  }

  const id = document.getElementById('clienteId').value;
  const dados = {
    cli_tipo: tipo,
    cli_nome_razao: document.getElementById('cli_nome_razao').value.trim(),
    cli_nome_fantasia: document.getElementById('cli_nome_fantasia').value.trim() || null,
    cli_cpf: tipo === 'F' ? limparMascara(document.getElementById('cli_cpf').value) : null,
    cli_cnpj: tipo === 'J' ? limparMascara(document.getElementById('cli_cnpj').value) : null,
    cli_rg: document.getElementById('cli_rg').value.trim() || null,
    cli_ie: document.getElementById('cli_ie').value.trim() || null,
    cli_im: document.getElementById('cli_im').value.trim() || null,
    cli_email: document.getElementById('cli_email').value.trim(),
    cli_telefone: limparMascara(telefone),
    cli_celular: limparMascara(document.getElementById('cli_celular').value),
    cli_contato: document.getElementById('cli_contato').value.trim() || null,
    cli_endereco: document.getElementById('cli_endereco').value.trim(),
    cli_numero: document.getElementById('cli_numero').value.trim(),
    cli_complemento: document.getElementById('cli_complemento').value.trim() || null,
    cli_bairro: document.getElementById('cli_bairro').value.trim(),
    cli_cidade: document.getElementById('cli_cidade').value.trim(),
    cli_estado: document.getElementById('cli_estado').value.trim().toUpperCase(),
    cli_cep: limparMascara(document.getElementById('cli_cep').value),
    cli_limite_credito: document.getElementById('cli_limite_credito').value || null,
    cli_observacoes: document.getElementById('cli_observacoes').value.trim() || null
  };

  try {
    if (id) {
      await atualizarCliente(id, dados);
      mensagem.textContent = '✅ Cliente atualizado com sucesso!';
    } else {
      await cadastrarCliente(dados);
      mensagem.textContent = '✅ Cliente cadastrado com sucesso!';
    }
    mensagem.classList.add('sucesso');
    resetarForm();
    await carregarLista();
  } catch (erro) {
    mensagem.textContent = `❌ ${erro.message}`;
    mensagem.classList.add('erro');
  }
});

// ===== CANCELAR / LIMPAR FORMULÁRIO =====
btnCancelar.addEventListener('click', resetarForm);

// ===== CARREGAR LISTA =====
async function carregarLista() {
  try {
    const clientes = await listarClientes();
    document.getElementById('contagem').textContent = `(${clientes.length})`;

    lista.innerHTML = clientes.map(c => `
      <tr>
        <td><strong>${c.cli_nome_razao}</strong>${c.cli_nome_fantasia ? `<br><small>${c.cli_nome_fantasia}</small>` : ''}</td>
        <td>${c.cli_tipo === 'F' ? 'Física' : 'Jurídica'}</td>
        <td>${c.cli_email}</td>
        <td>${c.cli_celular}</td>
        <td>${c.cli_cidade}/${c.cli_estado}</td>
        <td class="acoes">
          <button class="editar" data-id="${c.id}" title="Editar">✏️</button>
          <button class="excluir" data-id="${c.id}" title="Excluir">🗑️</button>
        </td>
      </tr>
    `).join('');

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

// ===== CARREGAR PARA EDIÇÃO =====
async function carregarParaEdicao(id) {
  try {
    const c = await buscarClientePorId(id);

    document.getElementById('clienteId').value = c.id;
    document.getElementById('cli_tipo').value = c.cli_tipo;
    atualizarCamposPorTipo();

    document.getElementById('cli_nome_razao').value = c.cli_nome_razao;
    document.getElementById('cli_nome_fantasia').value = c.cli_nome_fantasia || '';
    document.getElementById('cli_cpf').value = c.cli_cpf || '';
    document.getElementById('cli_rg').value = c.cli_rg || '';
    document.getElementById('cli_cnpj').value = c.cli_cnpj || '';
    document.getElementById('cli_ie').value = c.cli_ie || '';
    document.getElementById('cli_im').value = c.cli_im || '';
    document.getElementById('cli_email').value = c.cli_email;
    document.getElementById('cli_telefone').value = c.cli_telefone || '';
    document.getElementById('cli_celular').value = c.cli_celular;
    document.getElementById('cli_contato').value = c.cli_contato || '';
    document.getElementById('cli_endereco').value = c.cli_endereco;
    document.getElementById('cli_numero').value = c.cli_numero;
    document.getElementById('cli_complemento').value = c.cli_complemento || '';
    document.getElementById('cli_bairro').value = c.cli_bairro;
    document.getElementById('cli_cidade').value = c.cli_cidade;
    document.getElementById('cli_estado').value = c.cli_estado;
    document.getElementById('cli_cep').value = c.cli_cep;
    document.getElementById('cli_limite_credito').value = c.cli_limite_credito || '';
    document.getElementById('cli_observacoes').value = c.cli_observacoes || '';

    tituloForm.textContent = '✏️ Editar Cliente';
    mensagem.textContent = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (erro) {
    alert(erro.message);
  }
}

// ===== CONFIRMAR EXCLUSÃO =====
async function confirmarExclusao(id) {
  if (!confirm('Tem certeza que deseja excluir este cliente?\nEsta ação não pode ser desfeita.')) return;

  try {
    await excluirCliente(id);
    mensagem.textContent = '✅ Cliente excluído com sucesso!';
    mensagem.classList.add('sucesso');
    await carregarLista();
  } catch (erro) {
    mensagem.textContent = `❌ ${erro.message}`;
    mensagem.classList.add('erro');
  }
}

// ===== RESETAR FORMULÁRIO =====
function resetarForm() {
  form.reset();
  document.getElementById('clienteId').value = '';
  tituloForm.textContent = '➕ Novo Cliente';
  mensagem.textContent = '';
  mensagem.className = 'mensagem';
  atualizarCamposPorTipo();
}

// Feedback ao buscar CEP
document.getElementById('cli_cep').addEventListener('blur', async function() {
  const resultado = await buscarCEP(this.value, 'cli_');
  if (resultado && resultado.erro) {
    mensagem.textContent = `⚠️ ${resultado.erro}`;
    mensagem.classList.add('erro');
    setTimeout(() => {
      mensagem.textContent = '';
      mensagem.className = 'mensagem';
    }, 3000);
  }
});

