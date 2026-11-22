// =====================================================
// FORNECEDORES — Sistema de Gestão
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
const form = document.getElementById('formFornecedor');
const tituloForm = document.getElementById('tituloForm');
const mensagem = document.getElementById('mensagem');
const lista = document.getElementById('listaFornecedores');
const btnCancelar = document.getElementById('btnCancelar');
const selectTipo = document.getElementById('for_tipo');

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
    document.getElementById('for_cnpj').value = '';
    document.getElementById('for_ie').value = '';
    document.getElementById('for_im').value = '';
  } else if (tipo === 'J') {
    camposJuridica.forEach(el => el.classList.remove('oculto'));
    camposFisica.forEach(el => el.classList.add('oculto'));
    document.getElementById('for_cpf').value = '';
    document.getElementById('for_rg').value = '';
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

  const tipo = document.getElementById('for_tipo').value;

  // Validações específicas por tipo
  if (tipo === 'F') {
    const cpf = document.getElementById('for_cpf').value;
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
    const cnpj = document.getElementById('for_cnpj').value;
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
  if (!validarTelefone(document.getElementById('for_celular').value)) {
    mensagem.textContent = '❌ Celular inválido — deve conter DDD + número';
    mensagem.classList.add('erro');
    return;
  }

  // Validação de telefone fixo (se preenchido)
  const telefone = document.getElementById('for_telefone').value;
  if (telefone && !validarTelefone(telefone)) {
    mensagem.textContent = '❌ Telefone inválido';
    mensagem.classList.add('erro');
    return;
  }

  // Validação de CEP
  if (!validarCEP(document.getElementById('for_cep').value)) {
    mensagem.textContent = '❌ CEP inválido — digite 8 dígitos';
    mensagem.classList.add('erro');
    return;
  }

  const id = document.getElementById('fornecedorId').value;
  const dados = {
    for_tipo: tipo,
    for_nome_razao: document.getElementById('for_nome_razao').value.trim(),
    for_nome_fantasia: document.getElementById('for_nome_fantasia').value.trim() || null,
    for_cpf: tipo === 'F' ? limparMascara(document.getElementById('for_cpf').value) : null,
    for_rg: document.getElementById('for_rg').value.trim() || null,
    for_cnpj: tipo === 'J' ? limparMascara(document.getElementById('for_cnpj').value) : null,
    for_ie: document.getElementById('for_ie').value.trim() || null,
    for_im: document.getElementById('for_im').value.trim() || null,
    for_email: document.getElementById('for_email').value.trim(),
    for_telefone: limparMascara(telefone),
    for_celular: limparMascara(document.getElementById('for_celular').value),
    for_contato: document.getElementById('for_contato').value.trim() || null,
    for_endereco: document.getElementById('for_endereco').value.trim(),
    for_numero: document.getElementById('for_numero').value.trim(),
    for_complemento: document.getElementById('for_complemento').value.trim() || null,
    for_bairro: document.getElementById('for_bairro').value.trim(),
    for_cidade: document.getElementById('for_cidade').value.trim(),
    for_estado: document.getElementById('for_estado').value.trim().toUpperCase(),
    for_cep: limparMascara(document.getElementById('for_cep').value),
    for_categoria: document.getElementById('for_categoria').value.trim() || null,
    for_condicao_pgto: document.getElementById('for_condicao_pgto').value.trim() || null,
    for_prazo_entrega_dias: document.getElementById('for_prazo_entrega_dias').value || null,
    for_banco: document.getElementById('for_banco').value.trim() || null,
    for_agencia: document.getElementById('for_agencia').value.trim() || null,
    for_conta: document.getElementById('for_conta').value.trim() || null,
    for_chave_pix: document.getElementById('for_chave_pix').value.trim() || null,
    for_observacoes: document.getElementById('for_observacoes').value.trim() || null
  };

  try {
    if (id) {
      await atualizarFornecedor(id, dados);
      mensagem.textContent = '✅ Fornecedor atualizado com sucesso!';
    } else {
      await cadastrarFornecedor(dados);
      mensagem.textContent = '✅ Fornecedor cadastrado com sucesso!';
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
    const fornecedores = await listarFornecedores();
    document.getElementById('contagem').textContent = `(${fornecedores.length})`;

    lista.innerHTML = fornecedores.map(f => `
      <tr>
        <td><strong>${f.for_nome_razao}</strong>${f.for_nome_fantasia ? `<br><small>${f.for_nome_fantasia}</small>` : ''}</td>
        <td>${f.for_tipo === 'F' ? 'Física' : 'Jurídica'}</td>
        <td>${f.for_email}</td>
        <td>${f.for_celular}</td>
        <td>${f.for_cidade}/${f.for_estado}</td>
        <td>${f.for_categoria || '—'}</td>
        <td class="acoes">
          <button class="editar" data-id="${f.id}" title="Editar">✏️</button>
          <button class="excluir" data-id="${f.id}" title="Excluir">🗑️</button>
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
    const f = await buscarFornecedorPorId(id);

    document.getElementById('fornecedorId').value = f.id;
    document.getElementById('for_tipo').value = f.for_tipo;
    atualizarCamposPorTipo();

    document.getElementById('for_nome_razao').value = f.for_nome_razao;
    document.getElementById('for_nome_fantasia').value = f.for_nome_fantasia || '';
    document.getElementById('for_cpf').value = f.for_cpf || '';
    document.getElementById('for_rg').value = f.for_rg || '';
    document.getElementById('for_cnpj').value = f.for_cnpj || '';
    document.getElementById('for_ie').value = f.for_ie || '';
    document.getElementById('for_im').value = f.for_im || '';
    document.getElementById('for_email').value = f.for_email;
    document.getElementById('for_telefone').value = f.for_telefone || '';
    document.getElementById('for_celular').value = f.for_celular;
    document.getElementById('for_contato').value = f.for_contato || '';
    document.getElementById('for_endereco').value = f.for_endereco;
    document.getElementById('for_numero').value = f.for_numero;
    document.getElementById('for_complemento').value = f.for_complemento || '';
    document.getElementById('for_bairro').value = f.for_bairro;
    document.getElementById('for_cidade').value = f.for_cidade;
    document.getElementById('for_estado').value = f.for_estado;
    document.getElementById('for_cep').value = f.for_cep;
    document.getElementById('for_categoria').value = f.for_categoria || '';
    document.getElementById('for_condicao_pgto').value = f.for_condicao_pgto || '';
    document.getElementById('for_prazo_entrega_dias').value = f.for_prazo_entrega_dias || '';
    document.getElementById('for_banco').value = f.for_banco || '';
    document.getElementById('for_agencia').value = f.for_agencia || '';
    document.getElementById('for_conta').value = f.for_conta || '';
    document.getElementById('for_chave_pix').value = f.for_chave_pix || '';
    document.getElementById('for_observacoes').value = f.for_observacoes || '';

    tituloForm.textContent = '✏️ Editar Fornecedor';
    mensagem.textContent = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (erro) {
    alert(erro.message);
  }
}

// ===== CONFIRMAR EXCLUSÃO =====
async function confirmarExclusao(id) {
  if (!confirm('Tem certeza que deseja excluir este fornecedor?\nEsta ação não pode ser desfeita.')) return;

  try {
    await excluirFornecedor(id);
    mensagem.textContent = '✅ Fornecedor excluído com sucesso!';
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
  document.getElementById('fornecedorId').value = '';
  tituloForm.textContent = '➕ Novo Fornecedor';
  mensagem.textContent = '';
  mensagem.className = 'mensagem';
  atualizarCamposPorTipo();
}

// Feedback ao buscar CEP
document.getElementById('for_cep').addEventListener('blur', async function() {
  const resultado = await buscarCEP(this.value, 'for_');
  if (resultado && resultado.erro) {
    mensagem.textContent = `⚠️ ${resultado.erro}`;
    mensagem.classList.add('erro');
    setTimeout(() => {
      mensagem.textContent = '';
      mensagem.className = 'mensagem';
    }, 3000);
  }
});

