// =====================================================
// ORÇAMENTOS — Sistema de Gestão
// Correção definitiva da formatação de data
// =====================================================

// ========== 1. VERIFICAÇÃO DE SESSÃO ==========
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'index.html';
}

let usuario;
try {
  usuario = JSON.parse(localStorage.getItem('usuario'));
} catch (e) {
  localStorage.clear();
  window.location.href = 'index.html';
}

document.getElementById('nomeUsuario').textContent = usuario.nome || usuario.email || 'Usuário';
const nivelEl = document.getElementById('nivelUsuario');
if (nivelEl) {
  nivelEl.textContent = usuario.nivel_nome || usuario.nivel || 'consulta';
}

document.getElementById('btnSair').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'index.html';
});

// ✅ EXTRAIR DATA NO FORMATO CERTO PARA INPUT (aaaa-mm-dd)
function extrairDataParaInput(dataStr) {
  if (!dataStr) return '';
  
  // Já está no formato correto
  if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) return dataStr;
  
  // Tem "T" → pegar só a parte antes do T
  if (String(dataStr).includes('T')) {
    return String(dataStr).split('T')[0];
  }
  
  // Formato brasileiro → converter
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataStr)) {
    const [dia, mes, ano] = dataStr.split('/');
    return `${ano}-${mes}-${dia}`;
  }
  
  // Tentativa genérica
  const data = new Date(dataStr);
  if (!isNaN(data.getTime())) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }
  
  return '';
}

// ========== 2. ELEMENTOS DA TELA ==========
const form = document.getElementById('formOrcamento');
const tituloForm = document.getElementById('tituloForm');
const mensagem = document.getElementById('mensagem');
const lista = document.getElementById('listaOrcamentos');
const btnCancelar = document.getElementById('btnCancelar');
const areaItens = document.getElementById('areaItens');
const btnAdicionarItem = document.getElementById('btnAdicionarItem');
const valorTotalEl = document.getElementById('valorTotal');

let clientesCache = [];
let statusCache = [];
let materiaisCache = [];

// ========== 3. FUNÇÃO DE FORMATAÇÃO DE DATA — CORRIGIDA ==========
function formatarDataParaExibicao(valorData) {
  if (!valorData) return '—';
  
  // Remove qualquer coisa que não seja número e hífen para limpar
  const limpo = String(valorData).replace(/[^\dT\-]/g, '');
  
  // Padrão banco MySQL: AAAA-MM-DD
  const matchIso = limpo.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (matchIso) {
    const [, ano, mes, dia] = matchIso;
    return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
  }
  
  // Tenta criar objeto Date como último recurso
  const dataObj = new Date(valorData + 'T00:00:00');
  if (!isNaN(dataObj.getTime())) {
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = dataObj.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }
  
  return '—';
}

// ========== 4. CARREGAR DADOS AUXILIARES ==========
async function carregarDadosAuxiliares() {
  try {
    const resClientes = await fetch('/api/clientes', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (resClientes.ok) {
      clientesCache = await resClientes.json();
      preencherSelectClientes();
    }

    const resStatus = await fetch('/api/orcamentos/status', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (resStatus.ok) {
      statusCache = await resStatus.json();
      preencherSelectStatus();
    }

    const resMateriais = await fetch('/api/materiais', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (resMateriais.ok) {
      materiaisCache = await resMateriais.json();
    }
  } catch (erro) {
    console.error('Erro ao carregar dados auxiliares:', erro);
  }
}

function preencherSelectClientes() {
  const select = document.getElementById('cliente_id');
  if (!select) return;
  select.innerHTML = '<option value="">Selecione um cliente...</option>';
  clientesCache.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.cli_nome_razao;
    select.appendChild(opt);
  });
}

function preencherSelectStatus() {
  const select = document.getElementById('status_id');
  if (!select) return;
  select.innerHTML = '<option value="">Selecione...</option>';
  statusCache.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.nome;
    select.appendChild(opt);
  });
}

// ========== 5. GERENCIAMENTO DE ITENS ==========
function criarLinhaItem(dados = {}) {
  const linha = document.createElement('div');
  linha.style = 'display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; padding: 0.75rem; background: #fff; border-radius: 6px; border: 1px solid #e5e5e5;';

  const optMateriais = materiaisCache.map(m => `
    <option value="${m.id}" data-preco="${m.preco_unitario}"
      ${dados.material_id == m.id ? 'selected' : ''}>
      ${m.nome} — R$ ${Number(m.preco_unitario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
    </option>
  `).join('');

  linha.innerHTML = `
    <select name="material_id" class="sel-material" required style="flex: 2; padding: 0.5rem;">
      <option value="">Selecione um material</option>
      ${optMateriais}
    </select>
    <input type="number" name="quantidade" step="0.01" min="0.01" 
           value="${dados.quantidade || ''}" class="inp-quantidade" placeholder="Qtd"
           style="width: 100px; padding: 0.5rem;">
    <span class="subtotal-item" style="min-width: 120px; text-align: right; font-weight: 500;">
      R$ ${dados.subtotal ? Number(dados.subtotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
    </span>
    <button type="button" class="btn-remover-item btn secundario" style="padding: 0.5rem 0.75rem;">🗑️</button>
  `;

  areaItens.appendChild(linha);

  linha.querySelector('.sel-material').addEventListener('change', calcularSubtotalLinha);
  linha.querySelector('.inp-quantidade').addEventListener('input', calcularSubtotalLinha);
  linha.querySelector('.btn-remover-item').addEventListener('click', () => {
    linha.remove();
    recalcularValorTotal();
  });
}

function calcularSubtotalLinha(e) {
  const linha = e.target.closest('div');
  const select = linha.querySelector('.sel-material');
  const qtdEl = linha.querySelector('.inp-quantidade');
  const subtotalEl = linha.querySelector('.subtotal-item');

  const opcao = select.selectedOptions[0];
  const preco = opcao ? parseFloat(opcao.dataset.preco) : 0;
  const qtd = parseFloat(qtdEl.value) || 0;
  const subtotal = preco * qtd;

  subtotalEl.textContent = `R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  recalcularValorTotal();
}

function recalcularValorTotal() {
  let total = 0;
  document.querySelectorAll('.subtotal-item').forEach(el => {
    const valor = parseFloat(el.textContent.replace(/[^\d,]/g, '').replace(',', '.'));
    if (!isNaN(valor)) total += valor;
  });
  valorTotalEl.textContent = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

btnAdicionarItem.addEventListener('click', () => {
  if (materiaisCache.length === 0) {
    mensagem.textContent = '⚠️ Carregando materiais, aguarde...';
    mensagem.className = 'mensagem aviso';
    return;
  }
  criarLinhaItem();
});

// ========== 6. FUNÇÕES DA API ==========
const BASE = '/api/orcamentos';
const headersPadrao = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

async function listarOrcamentos() {
  const res = await fetch(BASE, { headers: headersPadrao() });
  const dados = await res.json();
  if (!res.ok) throw new Error(dados.erro || 'Erro ao listar');
  return dados;
}

async function cadastrarOrcamento(dados) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: headersPadrao(),
    body: JSON.stringify(dados)
  });
  const ret = await res.json();
  if (!res.ok) throw new Error(ret.erro || 'Erro ao cadastrar');
  return ret;
}

async function buscarOrcamentoPorId(id) {
  const res = await fetch(`${BASE}/${id}`, { headers: headersPadrao() });
  const dados = await res.json();
  if (!res.ok) throw new Error(dados.erro || 'Erro ao buscar');
  return dados;
}

async function atualizarOrcamento(id, dados) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: headersPadrao(),
    body: JSON.stringify(dados)
  });
  const ret = await res.json();
  if (!res.ok) throw new Error(ret.erro || 'Erro ao atualizar');
  return ret;
}

async function excluirOrcamento(id) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    headers: headersPadrao()
  });
  const ret = await res.json();
  if (!res.ok) throw new Error(ret.erro || 'Erro ao excluir');
  return ret;
}

// ========== 7. CARREGAR LISTA — DATA CORRIGIDA ==========
async function carregarLista() {
  try {
    const orcamentos = await listarOrcamentos();
    document.getElementById('contagem').textContent = `(${orcamentos.length})`;

    lista.innerHTML = orcamentos.map(o => {
      const tipoMap = {
        rede_eletrica: 'Rede Elétrica',
        cabeamento_estruturado: 'Cabeamento Estruturado',
        iot: 'IoT'
      };
      const tipoFormatado = tipoMap[o.tipo] || o.tipo;
      const valorFmt = Number(o.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const dataFmt = formatarDataParaExibicao(o.data);
      const nomeCliente = o.cliente_nome || '—';
      const nomeStatus = o.status_nome || '—';

      return `
        <tr>
          <td>${o.id}</td>
          <td>${nomeCliente}</td>
          <td>${tipoFormatado}</td>
          <td>${o.descricao || '—'}</td>
          <td>${valorFmt}</td>
          <td>${dataFmt}</td>
          <td>${nomeStatus}</td>
          <td class="acoes">
              <button class="btn-icone btn-editar" data-id="${o.id}" title="Editar">✏️</button>
              <button class="btn-icone btn-excluir" data-id="${o.id}" title="Excluir">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');

    document.querySelectorAll('.btn-editar').forEach(btn => {
      btn.addEventListener('click', () => carregarParaEdicao(btn.dataset.id));
    });
    document.querySelectorAll('.btn-excluir').forEach(btn => {
      btn.addEventListener('click', () => confirmarExclusao(btn.dataset.id));
    });
  } catch (erro) {
    console.error('Erro ao carregar lista:', erro);
    lista.innerHTML = `<tr><td colspan="8" style="color:red; text-align:center;">Erro ao carregar orçamentos</td></tr>`;
  }
}

// ========== 8. SALVAR FORMULÁRIO ==========
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  mensagem.textContent = '';
  mensagem.className = 'mensagem';

  const id = document.getElementById('orcamentoId').value;
  const cliente_id = document.getElementById('cliente_id').value;
  const tipo = document.getElementById('tipo').value;
  const data = document.getElementById('data').value;
  const status_id = document.getElementById('status_id').value;

  if (!cliente_id || !tipo || !data || !status_id) {
    mensagem.textContent = '❌ Preencha todos os campos obrigatórios';
    mensagem.classList.add('erro');
    return;
  }

  const itens = [];
  document.querySelectorAll('#areaItens > div').forEach(linha => {
    const material_id = linha.querySelector('.sel-material')?.value;
    const quantidade = linha.querySelector('.inp-quantidade')?.value;
    if (material_id && quantidade && parseFloat(quantidade) > 0) {
      itens.push({ material_id, quantidade });
    }
  });

  if (itens.length === 0) {
    mensagem.textContent = '❌ Adicione pelo menos um material ao orçamento';
    mensagem.classList.add('erro');
    return;
  }

  const dados = {
    descricao: document.getElementById('descricao').value.trim() || null,
    tipo,
    data,
    cliente_id,
    status_id,
    itens
  };

  try {
    if (id) {
      await atualizarOrcamento(id, dados);
      mensagem.textContent = '✅ Orçamento atualizado com sucesso!';
    } else {
      await cadastrarOrcamento(dados);
      mensagem.textContent = '✅ Orçamento cadastrado com sucesso!';
    }
    mensagem.classList.add('sucesso');
    resetarForm();
    await carregarLista();
  } catch (erro) {
    mensagem.textContent = `❌ ${erro.message}`;
    mensagem.classList.add('erro');
  }
});

// ========== 9. CARREGAR PARA EDIÇÃO ==========
async function carregarParaEdicao(id) {
  try {
    const orc = await buscarOrcamentoPorId(id);
    
    document.getElementById('orcamentoId').value = orc.id;
    document.getElementById('cliente_id').value = orc.cliente_id;
    document.getElementById('tipo').value = orc.tipo;
    
    // Garante formato correto para o input type="date"
    let dataInput = orc.data;
    if (dataInput && !/^\d{4}-\d{1,2}-\d{1,2}$/.test(dataInput)) {
      const dataObj = new Date(dataInput + 'T00:00:00');
      if (!isNaN(dataObj.getTime())) {
        const ano = dataObj.getFullYear();
        const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
        const dia = String(dataObj.getDate()).padStart(2, '0');
        dataInput = `${ano}-${mes}-${dia}`;
      }
    }
document.getElementById('data').value = extrairDataParaInput(dataInput);
    
    document.getElementById('status_id').value = orc.status_id;
    document.getElementById('descricao').value = orc.descricao || '';
    
    tituloForm.textContent = '✏️ Editar Orçamento';
    mensagem.textContent = '';
    mensagem.className = 'mensagem';

    areaItens.innerHTML = '';
    if (Array.isArray(orc.itens)) {
      orc.itens.forEach(item => criarLinhaItem({
        material_id: item.material_id,
        quantidade: item.quantidade,
        subtotal: item.subtotal
      }));
    }
    recalcularValorTotal();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (erro) {
    mensagem.textContent = `❌ ${erro.message}`;
    mensagem.classList.add('erro');
  }
}

// ========== 10. EXCLUSÃO ==========
async function confirmarExclusao(id) {
  if (!confirm('Tem certeza que deseja excluir este orçamento?')) return;
  try {
    await excluirOrcamento(id);
    mensagem.textContent = '✅ Orçamento excluído com sucesso!';
    mensagem.classList.add('sucesso');
    await carregarLista();
  } catch (erro) {
    mensagem.textContent = `❌ ${erro.message}`;
    mensagem.classList.add('erro');
  }
}

// ========== 11. RESETAR FORMULÁRIO ==========
function resetarForm() {
  form.reset();
  document.getElementById('orcamentoId').value = '';
  tituloForm.textContent = '➕ Novo Orçamento';
  areaItens.innerHTML = '';
  valorTotalEl.textContent = 'R$ 0,00';
  mensagem.textContent = '';
  mensagem.className = 'mensagem';
  
  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('data').value = hoje;
}

btnCancelar.addEventListener('click', resetarForm);

// ========== 12. INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', async () => {
  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('data').value = hoje;

  await carregarDadosAuxiliares();
  await carregarLista();
});
