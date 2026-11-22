const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const conexao = require('../config/db');

router.use(verificarToken);

// ===== LISTAR TODOS =====
router.get('/', async (req, res) => {
  try {
    const [materiais] = await conexao.query(`
      SELECT * FROM materiais ORDER BY nome ASC
    `);
    res.json(materiais);
  } catch (erro) {
    console.error('Erro ao listar materiais:', erro);
    res.status(500).json({ erro: 'Erro ao buscar materiais' });
  }
});

// ===== CADASTRAR =====
router.post('/', async (req, res) => {
  try {
    const dados = req.body;
    const [resultado] = await conexao.query(
      `INSERT INTO materiais (
        nome, unidade, preco_unitario
      ) VALUES (?, ?, ?)`,
      [
        dados.nome,
        dados.unidade,
        dados.preco_unitario
      ]
    );
    res.status(201).json({ id: resultado.insertId, mensagem: 'Material cadastrado com sucesso!' });
  } catch (erro) {
    console.error('Erro ao cadastrar material:', erro);
    res.status(500).json({ erro: erro.message || 'Erro ao cadastrar' });
  }
});

// ===== BUSCAR POR ID =====
router.get('/:id', async (req, res) => {
  try {
    const [materiais] = await conexao.query('SELECT * FROM materiais WHERE id = ?', [req.params.id]);
    if (materiais.length === 0) {
      return res.status(404).json({ erro: 'Material não encontrado' });
    }
    res.json(materiais[0]);
  } catch (erro) {
    console.error('Erro ao buscar material:', erro);
    res.status(500).json({ erro: 'Erro na busca' });
  }
});

// ===== ATUALIZAR =====
router.put('/:id', async (req, res) => {
  try {
    const dados = req.body;
    await conexao.query(
      `UPDATE materiais SET
        nome=?, unidade=?, preco_unitario=?
       WHERE id=?`,
      [
        dados.nome,
        dados.unidade,
        dados.preco_unitario,
        req.params.id
      ]
    );
    res.json({ mensagem: 'Material atualizado com sucesso!' });
  } catch (erro) {
    console.error('Erro ao atualizar material:', erro);
    res.status(500).json({ erro: erro.message || 'Erro ao atualizar' });
  }
});

// ===== EXCLUIR =====
router.delete('/:id', async (req, res) => {
  try {
    const [resultado] = await conexao.query('DELETE FROM materiais WHERE id = ?', [req.params.id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Material não encontrado' });
    }
    res.json({ mensagem: 'Material excluído com sucesso!' });
  } catch (erro) {
    console.error('Erro ao excluir material:', erro);
    res.status(500).json({ erro: 'Erro ao excluir' });
  }
});

module.exports = router;
