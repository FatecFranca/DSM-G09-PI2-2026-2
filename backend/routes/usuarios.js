const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { verificarToken } = require('../middleware/auth');
const conexao = require('../config/db');

const SALT_ROUNDS = 10;

router.use(verificarToken);

// ===== CARREGAR NÍVEIS =====
router.get('/niveis', async (req, res) => {
  try {
    const [niveis] = await conexao.query(
      'SELECT nivel_id, nivel_nome FROM niveis_acesso ORDER BY ordem ASC'
    );
    res.json(niveis);
  } catch (erro) {
    console.error('❌ Erro níveis:', erro.message);
    res.status(500).json({ erro: erro.message });
  }
});

// ===== LISTAR =====
router.get('/', async (req, res) => {
  try {
    const [usuarios] = await conexao.query(`
      SELECT u.id, u.nome, u.email, u.nivel_id, u.usu_ativo, n.nivel_nome
      FROM usuarios u LEFT JOIN niveis_acesso n ON u.nivel_id = n.nivel_id
      ORDER BY u.nome ASC
    `);
    res.json(usuarios.map(u => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      nivelId: u.nivel_id,
      nivel: u.nivel_nome || 'Não definido',
      ativo: u.usu_ativo === 'S' ? 1 : 0
    })));
  } catch (erro) {
    console.error('❌ Erro listar:', erro.message);
    res.status(500).json({ erro: erro.message });
  }
});

// ===== CADASTRAR =====
router.post('/', async (req, res) => {
  try {
    const { nome, email, senha, nivelId } = req.body;

    if (!nome || !email || !senha || !nivelId) {
      return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
    }

    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

    const [resultado] = await conexao.query(
      `INSERT INTO usuarios (nome, email, senha, nivel_id, usu_ativo) VALUES (?, ?, ?, ?, ?)`,
      [nome, email, senhaHash, nivelId, 'S']
    );

    res.status(201).json({ id: resultado.insertId, mensagem: '✅ Usuário cadastrado!' });
  } catch (erro) {
    console.error('❌ Erro cadastrar:', erro.message);
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ erro: 'E-mail já cadastrado' });
    }
    res.status(500).json({ erro: erro.message });
  }
});

// ===== BUSCAR POR ID =====
router.get('/:id', async (req, res) => {
  try {
    const [usuarios] = await conexao.query(
      'SELECT id, nome, email, nivel_id, usu_ativo FROM usuarios WHERE id = ?',
      [req.params.id]
    );
    if (usuarios.length === 0) return res.status(404).json({ erro: 'Não encontrado' });
    const u = usuarios[0];
    res.json({
      id: u.id,
      nome: u.nome,
      email: u.email,
      nivelId: u.nivel_id,
      ativo: u.usu_ativo === 'S' ? 1 : 0
    });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

// ===== ATUALIZAR =====
router.put('/:id', async (req, res) => {
  try {
    const { nome, email, senha, nivelId, ativo } = req.body;
    
    if (!nome || !email || !nivelId) {
      return res.status(400).json({ erro: 'Nome, e-mail e nível são obrigatórios' });
    }

    const status = ativo ? 'S' : 'N';
    let query, params;

    if (senha && senha.trim() !== '') {
      // ✅ Gerar hash NOVA senha
      const senhaHash = await bcrypt.hash(senha.trim(), 10);
      console.log('🔐 Nova senha com hash:', senhaHash); // Log para confirmar
      
      query = `UPDATE usuarios 
               SET nome=?, email=?, senha=?, nivel_id=?, usu_ativo=? 
               WHERE id=?`;
      params = [nome, email, senhaHash, nivelId, status, req.params.id];
    } else {
      // Sem alterar senha
      query = `UPDATE usuarios 
               SET nome=?, email=?, nivel_id=?, usu_ativo=? 
               WHERE id=?`;
      params = [nome, email, nivelId, status, req.params.id];
    }

    await conexao.query(query, params);
    res.json({ mensagem: '✅ Usuário atualizado com sucesso!' });
    
  } catch (erro) {
    console.error('❌ Erro ao atualizar:', erro.message);
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ erro: '❌ Este e-mail já está em uso' });
    }
    res.status(500).json({ erro: erro.message });
  }
});


// ===== EXCLUIR =====
router.delete('/:id', async (req, res) => {
  try {
    const [resultado] = await conexao.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
    if (resultado.affectedRows === 0) return res.status(404).json({ erro: 'Não encontrado' });
    res.json({ mensagem: '✅ Excluído!' });
  } catch (erro) {
    res.status(500).json({ erro: erro.message });
  }
});

module.exports = router;
