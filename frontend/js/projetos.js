// ==================================================
// VERIFICAÇÃO DE SESSÃO
// ==================================================
const token = localStorage.getItem('token');
if (!token) { window.location.href = 'index.html'; }

let usuario;
try {
  usuario = JSON.parse(localStorage.getItem('usuario'));
} catch (e) {
  localStorage.clear();
  window.location.href = 'index.html';
}

document.getElementById('nomeUsuario').textContent = usuario.nome || usuario.email || 'Usuário';
const nivelTexto = (usuario.nivel_nome || usuario.nivel || 'consulta').toLowerCase().trim();
const tagNivel = document.getElementById('nivelUsuaif (p.orcamentos && Array.isArray(p.orcamentos)) {rio');
if (tagNivel) {
  tagNivel.textContent = nivelTexto;
  tagNivel.className = `tag-nivel ${nivelTexto}`;
}

document.getElementById('btnSair').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'index.html';
});

// ==================================================
// VARIÁVEIS GLOBAIS
// ==================================================
let orcamentosSelecionados = [];
let todosOrcamentos = [];

// ==================================================
// FUNÇÕES DE FORMATAÇÃO — COMPLETAS E CORRIGIDAS
// ==================================================

// Formatar valor monetário
function formatarValor(valor) {
  if (!valor && valor !== 0) return '0,00';
  const num = Number(valor);
  if (isNaN(num)) return String(valor).replace('.', ',');
  return num.toFixed(2).replace('.', ',');
}

// Formatar data para exibição (dd/mm/aaaa)
function formatarData(dataStr) {
  if (!dataStr) return '-';
  
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataStr)) return dataStr;
  
  if (dataStr.includes('T')) {
    const data = new Date(dataStr);
    if (!isNaN(data.getTime())) {
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      return `${dia}/${mes}/${ano}`;
    }
  }
  
  if (/^\d{4}-\d{2}-\d{2}/.test(dataStr)) {
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
  }
  
  const data = new Date(dataStr);
  if (!isNaN(data.getTime())) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }
  
  return dataStr;
}

// ✅ NOVA FUNÇÃO: Extrair data para input HTML (aaaa-mm-dd)
function extrairDataParaInput(dataStr) {
  if (!dataStr) return '';
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) return dataStr;
  
  if (dataStr.includes('T')) {
    return dataStr.split('T')[0];
  }
  
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataStr)) {
    const [dia, mes, ano] = dataStr.split('/');
    return `${ano}-${mes}-${dia}`;
  }
  
  const data = new Date(dataStr);
  if (!isNaN(data.getTime())) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }
  
  return '';
}

function traduzirTipo(tipo) {
  if (!tipo) return '-';
  const map = {
    rede_eletrica: 'Rede Elétrica',
    cabeamento_estruturado: 'Cabeamento Estruturado',
    iot: 'IoT',
    manutencao: 'Manutenção',
    ampliacao: 'Ampliação',
    nova_instalacao: 'Nova Instalação'
  };
  return map[tipo] || tipo;
}
// ==================================================
// INICIALIZAÇÃO
// ==================================================
document.addEventListener('DOMContentLoaded', async () => {
  await carregarClientes();
  await carregarTiposProjeto();
  await carregarStatusProjetos();
  await carregarTodosOrcamentos();
  await carregarListaProjetos();

  document.getElementById('cliente_id').addEventListener('change', filtrarOrcamentosPorCliente);
  document.getElementById('formProjeto').addEventListener('submit', salvarProjeto);
  document.getElementById('btnCancelar').addEventListener('click', limparFormulario);
});

// ==================================================
// CARREGAR CLIENTES
// ==================================================
async function carregarClientes() {
  const sel = document.getElementById('cliente_id');
  sel.innerHTML = '<option value="">Selecione um cliente...</option>';
  
  try {
    let lista;
    if (typeof listarClientes === 'function') {
      lista = await listarClientes();
    } else {
      const res = await fetch('/api/clientes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Erro na requisição');
      lista = await res.json();
    }

    if (!Array.isArray(lista)) {
      sel.innerHTML = '<option value="">Formato inválido</option>';
      return;
    }

    lista.forEach(c => {
      const nomeCliente = 
        c.nome || c.razao_social || c.razaosocial || c.nome_razao_social || c.empresa || 
        Object.values(c).find(v => typeof v === 'string' && v.length > 2) || `ID ${c.id}`;
      
      sel.innerHTML += `<option value="${c.id}">${nomeCliente}</option>`;
    });
  } catch (erro) {
    console.error('❌ Erro ao carregar clientes:', erro);
    sel.innerHTML = '<option value="">Erro ao carregar</option>';
  }
}

// ==================================================
// CARREGAR TIPOS DE PROJETO
// ==================================================
async function carregarTiposProjeto() {
  const sel = document.getElementById('tipo');
  sel.innerHTML = '<option value="">Selecione...</option>';
  sel.innerHTML += `
    <option value="rede_eletrica">Rede Elétrica</option>
    <option value="cabeamento_estruturado">Cabeamento Estruturado</option>
    <option value="iot">IoT</option>
    <option value="manutencao">Manutenção</option>
    <option value="ampliacao">Ampliação</option>
    <option value="nova_instalacao">Nova Instalação</option>
  `;
}

// ==================================================
// CARREGAR STATUS
// ==================================================
async function carregarStatusProjetos() {
  const sel = document.getElementById('status_id');
  sel.innerHTML = '<option value="">Selecione...</option>';
  try {
    let lista;
    if (typeof listarStatusProjetos === 'function') {
      lista = await listarStatusProjetos();
    } else {
      const res = await fetch('/api/projetos/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) lista = await res.json();
    }
    if (Array.isArray(lista)) {
      lista.forEach(s => {
        const nomeStatus = s.nome || s.descricao || s.status || Object.values(s).find(v => typeof v === 'string') || '';
        sel.innerHTML += `<option value="${s.id}">${nomeStatus}</option>`;
      });
    }
  } catch {
    sel.innerHTML = '<option value="">Erro ao carregar</option>';
  }
}

// ==================================================
// CARREGAR ORÇAMENTOS
// ==================================================
async function carregarTodosOrcamentos() {
  try {
    if (typeof listarOrcamentos === 'function') {
      todosOrcamentos = await listarOrcamentos();
    } else {
      const res = await fetch('/api/orcamentos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) todosOrcamentos = await res.json();
      else todosOrcamentos = [];
    }
  } catch {
    todosOrcamentos = [];
  }
}

// ==================================================
// FILTRAR ORÇAMENTOS
// ==================================================
function filtrarOrcamentosPorCliente() {
  const clienteId = document.getElementById('cliente_id').value;
  const areaOrcamentos = document.getElementById('areaOrcamentos');
  const listaEl = document.getElementById('listaOrcamentosDisponiveis');

  if (!clienteId) {
    areaOrcamentos.style.display = 'none';
    listaEl.innerHTML = '<em>Selecione um Cliente para carregar os orçamentos...</em>';
    return;
  }

  const filtrados = todosOrcamentos.filter(o => {
    const oClienteId = String(o.cliente_id || o.id_cliente || '');
    return oClienteId === String(clienteId);
  });

  areaOrcamentos.style.display = 'block';

  if (filtrados.length === 0) {
    listaEl.innerHTML = '<em>Nenhum orçamento encontrado para este Cliente.</em>';
    return;
  }

  listaEl.innerHTML = filtrados.map(o => {
    const selecionado = orcamentosSelecionados.includes(o.id);
    const tipoOrc = traduzirTipo(o.tipo || o.tipo_projeto || '');
    const valor = formatarValor(o.valor_total || o.valor);
    const data = o.data || o.data_orcamento || '';
    return `
      <label style="display:block; padding:0.4rem 0; cursor:pointer; border-bottom: 1px solid #eee;">
        <input type="checkbox" class="chk-orcamento" value="${o.id}" ${selecionado ? 'checked' : ''}>
        <strong>#${o.id}</strong> — ${tipoOrc}<br>
        <span style="font-size: 0.9em; color:#666;">R$ ${valor} — ${formatarData(data)}</span>
      </label>
    `;
  }).join('');

  listaEl.querySelectorAll('.chk-orcamento').forEach(chk => {
    chk.addEventListener('change', () => {
      const id = parseInt(chk.value);
      if (chk.checked) {
        if (!orcamentosSelecionados.includes(id)) orcamentosSelecionados.push(id);
      } else {
        orcamentosSelecionados = orcamentosSelecionados.filter(sid => sid !== id);
      }
      console.log('✅ Orçamentos vinculados:', orcamentosSelecionados);
    });
  });
}

// ==================================================
// SALVAR PROJETO
// ==================================================
async function salvarProjeto(e) {
  e.preventDefault();
  const msgEl = document.getElementById('mensagem');
  msgEl.textContent = '';
  msgEl.className = 'mensagem';

  const tipoSelecionado = document.getElementById('tipo').value;
  const tiposValidosBanco = [
    'rede_eletrica', 'cabeamento_estruturado', 'iot',
    'manutencao', 'ampliacao', 'nova_instalacao'
  ];

  if (!tipoSelecionado || !tiposValidosBanco.includes(tipoSelecionado)) {
    msgEl.textContent = `❌ Tipo inválido: "${tipoSelecionado}". Selecione um tipo da lista.`;
    msgEl.classList.add('erro');
    return;
  }

  const dados = {
    nome: document.getElementById('nome').value.trim(),
    cliente_id: parseInt(document.getElementById('cliente_id').value),
    tipo: tipoSelecionado,
    status_id: parseInt(document.getElementById('status_id').value),
    data_inicio: extrairDataParaInput(document.getElementById('data_inicio').value),
    data_fim: extrairDataParaInput(document.getElementById('data_fim').value) || null,
    orcamentos: [...orcamentosSelecionados]
  };

  console.log('📤 DADOS ENVIADOS:', JSON.stringify(dados, null, 2));

  try {
    const projetoId = document.getElementById('projetoId').value;

    if (projetoId) {
      if (typeof atualizarProjeto === 'function') {
        await atualizarProjeto(projetoId, dados);
      } else {
        const res = await fetch(`/api/projetos/${projetoId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dados)
        });
        if (!res.ok) {
          const erroServidor = await res.json();
          throw new Error(erroServidor.message || 'Falha ao atualizar');
        }
      }
      msgEl.textContent = '✅ Projeto atualizado com sucesso!';
    } else {
      if (typeof cadastrarProjeto === 'function') {
        await cadastrarProjeto(dados);
      } else {
        const res = await fetch('/api/projetos', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dados)
        });
        if (!res.ok) {
          const erroServidor = await res.json();
          throw new Error(erroServidor.message || 'Falha ao cadastrar');
        }
      }
      msgEl.textContent = '✅ Projeto cadastrado com sucesso!';
    }

    msgEl.classList.add('sucesso');
    limparFormulario();
    await carregarListaProjetos();
  } catch (erro) {
    msgEl.textContent = `❌ ${erro.message}`;
    msgEl.classList.add('erro');
  }
}
// ==================================================
// LISTAR TODOS OS PROJETOS NA TABELA
// ==================================================
async function carregarListaProjetos() {
  const corpo = document.getElementById('listaProjetos');
  const contagem = document.getElementById('contagem');
  corpo.innerHTML = '<tr><td colspan="9" style="text-align:center;">Carregando...</td></tr>';

  try {
    let lista;
    if (typeof listarProjetos === 'function') {
      lista = await listarProjetos();
    } else {
      const res = await fetch('/api/projetos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Erro');
      lista = await res.json();
    }

    console.log('📋 Projetos recebidos:', lista);
    contagem.textContent = `(${lista.length})`;

    if (!lista.length) {
      corpo.innerHTML = '<tr><td colspan="9" style="text-align:center;">Nenhum projeto cadastrado.</td></tr>';
      return;
    }

    corpo.innerHTML = lista.map(p => {
      const nomeCliente = p.cliente_nome || p.nome_cliente || '-';
      const nomeStatus = p.status_nome || p.nome_status || p.status || '-';
      
      // ✅ CONTAGEM DE ORÇAMENTOS — DEFINITIVA (usa qtd_orcamentos que a controller já envia!)
let qtdOrc = 0;

console.log(`Projeto ${p.id} → dados recebidos:`, p);

// 🔹 PRIORIDADE 1: qtd_orcamentos (JÁ VEM PRONTO da sua controller!)
if (typeof p.qtd_orcamentos === 'number' && p.qtd_orcamentos > 0) {
  qtdOrc = p.qtd_orcamentos;
  console.log(`✅ Projeto ${p.id} → contagem por qtd_orcamentos: ${qtdOrc}`);
}
// 🔹 PRIORIDADE 2: orcamentos_ids
else if (Array.isArray(p.orcamentos_ids)) {
  qtdOrc = p.orcamentos_ids.filter(id => id !== null && id !== undefined).length;
  console.log(`✅ Projeto ${p.id} → contagem por orcamentos_ids: ${qtdOrc}`);
}
// 🔹 PRIORIDADE 3: array de orçamentos
else if (p.orcamentos && Array.isArray(p.orcamentos)) {
  qtdOrc = p.orcamentos.length;
  console.log(`✅ Projeto ${p.id} → contagem por array orcamentos: ${qtdOrc}`);
}
// 🔹 PRIORIDADE 4: orcamento_id único
else if (p.orcamento_id) {
  qtdOrc = 1;
  console.log(`✅ Projeto ${p.id} → orcamento_id único: 1`);
}

console.log(`🔢 Projeto ${p.id} → CONTAGEM FINAL: ${qtdOrc}`);


      return `
        <tr>
          <td>${p.id}</td>
          <td>${p.nome || '-'}</td>
          <td>${nomeCliente}</td>
          <td><strong>${traduzirTipo(p.tipo)}</strong></td>
          <td>${formatarData(p.data_inicio)}</td>
          <td>${formatarData(p.data_fim)}</td>
          <td><span class="tag-nivel">${nomeStatus}</span></td>
          <td>${qtdOrc} vinculado(s)</td>
          <td>
            <button class="btn-sec acao editar" data-id="${p.id}" title="Editar">✏️</button>
            <button class="btn-sec acao excluir" data-id="${p.id}" title="Excluir">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');

    corpo.querySelectorAll('.editar').forEach(b => {
      b.addEventListener('click', () => carregarParaEdicao(parseInt(b.dataset.id)));
    });
    corpo.querySelectorAll('.excluir').forEach(b => {
      b.addEventListener('click', () => confirmarExclusao(parseInt(b.dataset.id)));
    });
  } catch (erro) {
    console.error('❌ Erro ao listar projetos:', erro);
    corpo.innerHTML = '<tr><td colspan="9" style="color:red;text-align:center;">Erro ao listar</td></tr>';
  }
}

// ==================================================
// CARREGAR PARA EDIÇÃO — CORRIGIDO COM extrairDataParaInput
// ==================================================
async function carregarParaEdicao(id) {
  try {
    let p;
    if (typeof buscarProjetoPorId === 'function') {
      p = await buscarProjetoPorId(id);
    } else {
      const res = await fetch(`/api/projetos/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Não encontrado');
      p = await res.json();
    }

    console.log('📝 Projeto para edição:', p);

    document.getElementById('projetoId').value = p.id;
    document.getElementById('nome').value = p.nome || '';
    document.getElementById('cliente_id').value = p.cliente_id || '';
    document.getElementById('tipo').value = p.tipo || '';
    document.getElementById('status_id').value = p.status_id || '';
    
    // ✅ CORRIGIDO: usa a função para extrair só a data no formato certo
    document.getElementById('data_inicio').value = extrairDataParaInput(p.data_inicio);
    document.getElementById('data_fim').value = extrairDataParaInput(p.data_fim);

    // Restaurar orçamentos selecionados
    orcamentosSelecionados = [];
    if (p.orcamentos && Array.isArray(p.orcamentos)) {
      orcamentosSelecionados = p.orcamentos.map(o => o.id || o.orcamento_id).filter(id => id);
    } else if (p.orcamento_id) {
      orcamentosSelecionados = [p.orcamento_id];
    } else if (Array.isArray(p.orcamentos_ids)) {
      orcamentosSelecionados = p.orcamentos_ids;
    }

    console.log('✅ Orçamentos restaurados:', orcamentosSelecionados);
    
    document.getElementById('tituloForm').textContent = '✏️ Editar Projeto';
    filtrarOrcamentosPorCliente();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (erro) {
    console.error('❌ Erro ao carregar edição:', erro);
    alert(`Não foi possível carregar: ${erro.message}`);
  }
}

// ==================================================
// EXCLUIR PROJETO
// ==================================================
async function confirmarExclusao(id) {
  if (!confirm('Tem certeza que deseja excluir este projeto?')) return;
  
  try {
    if (typeof excluirProjeto === 'function') {
      await excluirProjeto(id);
    } else {
      const res = await fetch(`/api/projetos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Falha ao excluir');
    }
    await carregarListaProjetos();
  } catch (erro) {
    alert(`Erro: ${erro.message}`);
  }
}

// ==================================================
// LIMPAR FORMULÁRIO
// ==================================================
function limparFormulario() {
  document.getElementById('formProjeto').reset();
  document.getElementById('projetoId').value = '';
  orcamentosSelecionados = [];
  document.getElementById('tituloForm').textContent = '➕ Novo Projeto';
  document.getElementById('areaOrcamentos').style.display = 'none';
  document.getElementById('mensagem').textContent = '';
}
