const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

const PORTA = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivos do frontend
const pastaFrontend = path.join(__dirname, '..', 'frontend');
app.use(express.static(pastaFrontend));

// ===== ROTAS DA API — PRIMEIRO, SEMPRE ANTES DAS PÁGINAS =====
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Rota /api/auth carregada');
} catch (e) {
  console.log('⚠️ Rota auth:', e.message);
}

try {
  const usuarioRoutes = require('./routes/usuarios');
  app.use('/api/usuarios', usuarioRoutes);
  console.log('✅ Rota /api/usuarios carregada');
} catch (e) {
  console.log('⚠️ Rota usuarios:', e.message);
}

try {
  const clienteRoutes = require('./routes/clientes');
  app.use('/api/clientes', clienteRoutes);
  console.log('✅ Rota /api/clientes carregada');
} catch (e) {
  console.log('⚠️ Rota clientes:', e.message);
}

try {
  const fornecedorRoutes = require('./routes/fornecedores');
  app.use('/api/fornecedores', fornecedorRoutes);
  console.log('✅ Rota /api/fornecedores carregada');
} catch (e) {
  console.log('⚠️ Rota fornecedores:', e.message);
}

try {
  const materiaisRoutes = require('./routes/materiais');
  app.use('/api/materiais', materiaisRoutes);
  console.log('✅ Rota /api/materiais carregada');
} catch (e) {
  console.log('⚠️ Rota materiais:', e.message);
}

// === NOVA ROTA — ORÇAMENTOS ===
try {
  const orcamentosRoutes = require('./routes/orcamentos');
  app.use('/api/orcamentos', orcamentosRoutes);
  console.log('✅ Rota /api/orcamentos carregada');
} catch (e) {
  console.log('⚠️ Rota orcamentos:', e.message);
}

// === NOVA ROTA — PROJETOS ===
try {
  const projetosRoutes = require('./routes/projetos');
  app.use('/api/projetos', projetosRoutes);
  console.log('✅ Rota /api/projetos carregada');
} catch (e) {
  console.log('⚠️ Rota projetos:', e.message);
}

// ===== FALLBACK — PÁGINAS DO FRONTEND (SÓ DEPOIS DAS ROTAS) =====
app.get('/', (req, res) => {
  res.sendFile(path.join(pastaFrontend, 'index.html'));
});

app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(pastaFrontend, 'dashboard.html'));
});

app.get('/clientes.html', (req, res) => {
  res.sendFile(path.join(pastaFrontend, 'clientes.html'));
});

app.get('/fornecedores.html', (req, res) => {
  res.sendFile(path.join(pastaFrontend, 'fornecedores.html'));
});

app.get('/usuarios.html', (req, res) => {
  res.sendFile(path.join(pastaFrontend, 'usuarios.html'));
});

app.get('/materiais.html', (req, res) => {
  res.sendFile(path.join(pastaFrontend, 'materiais.html'));
});

app.get('/orcamentos.html', (req, res) => {
  res.sendFile(path.join(pastaFrontend, 'orcamentos.html'));
});

app.get('/projetos.html', (req, res) => {
  res.sendFile(path.join(pastaFrontend, 'projetos.html'));
});

// Iniciar servidor
app.listen(PORTA, () => {
  console.log(`\n🚀 Servidor rodando — http://localhost:${PORTA}`);
  console.log(`📁 Frontend: ${pastaFrontend}\n`);
});
