const pool = require('../config/db');

const camposComuns = [
  'nome',
  'unidade',
  'preco_unitario'
];

module.exports = {
  async listar(req, res) {
    try {
      const [materiais] = await pool.query(
        'SELECT * FROM materiais ORDER BY nome'
      );
      res.json(materiais);
    } catch (e) {
      res.status(500).json({ erro: e.message });
    }
  },

  async cadastrar(req, res) {
    const dados = req.body;

    try {
      const valores = camposComuns.map(c => {
        return dados[c] !== undefined ? dados[c] : null;
      });
      valores.push(req.usuario.usu_codigo);

      const [result] = await pool.query(
        `INSERT INTO materiais (${camposComuns.join(',')}, usu_cadastro) VALUES (${',?'.repeat(camposComuns.length).slice(1)}, ?)`,
        valores
      );
      res.status(201).json({ id: result.insertId, mensagem: 'Material cadastrado' });
    } catch (e) {
      res.status(500).json({ erro: e.message });
    }
  },

  async buscarPorId(req, res) {
    try {
      const [materiais] = await pool.query(
        'SELECT * FROM materiais WHERE id = ?',
        [req.params.id]
      );
      if (materiais.length === 0) {
        return res.status(404).json({ erro: 'Material não encontrado' });
      }
      res.json(materiais[0]);
    } catch (e) {
      res.status(500).json({ erro: e.message });
    }
  },

  async atualizar(req, res) {
    const dados = req.body;

    try {
      const valores = camposComuns.map(c => {
        return dados[c] !== undefined ? dados[c] : null;
      });
      valores.push(req.params.id);

      await pool.query(
        `UPDATE materiais SET ${camposComuns.map(c => `${c} = ?`).join(', ')} WHERE id = ?`,
        valores
      );
      res.json({ mensagem: 'Material atualizado' });
    } catch (e) {
      res.status(500).json({ erro: e.message });
    }
  },

  async excluir(req, res) {
    try {
      await pool.query(
        'DELETE FROM materiais WHERE id = ?',
        [req.params.id]
      );
      res.json({ mensagem: 'Material excluído' });
    } catch (e) {
      res.status(500).json({ erro: e.message });
    }
  }
};
