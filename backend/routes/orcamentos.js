const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const conexao = require('../config/db');

router.use(verificarToken);

// =====================================================
// ROTAS DE STATUS
// =====================================================

// Listar todos os status de orçamento
router.get('/status', async (req, res) => {
  try {
    const [status] = await conexao.query(
      'SELECT * FROM status_orcamentos ORDER BY id'
    );
    res.json(status);
  } catch (erro) {
    console.error('Erro ao buscar status:', erro);
    res.status(500).json({ erro: 'Erro ao buscar status' });
  }
});

// =====================================================
// ROTAS PRINCIPAIS DE ORÇAMENTOS
// =====================================================

// Listar todos os orçamentos com dados de cliente e status
router.get('/', async (req, res) => {
  try {
    const [orcamentos] = await conexao.query(`
      SELECT o.*,
             c.cli_nome_razao AS cliente_nome,
             s.nome AS status_nome
      FROM orcamentos o
      LEFT JOIN clientes c ON o.cliente_id = c.id
      LEFT JOIN status_orcamentos s ON o.status_id = s.id
      WHERE o.deleted_at IS NULL
      ORDER BY o.created_at DESC
    `);
    res.json(orcamentos);
  } catch (erro) {
    console.error('Erro ao listar orçamentos:', erro);
    res.status(500).json({ erro: 'Erro ao buscar orçamentos' });
  }
});

// Cadastrar novo orçamento com itens
router.post('/', async (req, res) => {
  const conn = await conexao.getConnection();
  try {
    const { descricao, tipo, data, cliente_id, status_id, itens } = req.body;

    // Validações obrigatórias
    if (!tipo || !data || !cliente_id || !status_id) {
      return res.status(400).json({ 
        erro: 'Preencha todos os campos obrigatórios: tipo, data, cliente e status' 
      });
    }

    await conn.beginTransaction();

    // Inserir orçamento
    const [resultado] = await conn.query(
      `INSERT INTO orcamentos
        (descricao, tipo, data, cliente_id, status_id, valor_total)
       VALUES (?, ?, ?, ?, ?, 0.00)`,
      [descricao || null, tipo, data, cliente_id, status_id]
    );

    const orcamento_id = resultado.insertId;
    let valor_total = 0;

    // Processar itens
    if (Array.isArray(itens) && itens.length > 0) {
      for (const item of itens) {
        const { material_id, quantidade } = item;
        const qtd = parseFloat(quantidade);

        if (!material_id || isNaN(qtd) || qtd <= 0) {
          await conn.rollback();
          return res.status(400).json({ 
            erro: 'Material e quantidade válidos são obrigatórios para cada item' 
          });
        }

        // Buscar preço do material
        const [materiais] = await conn.query(
          'SELECT preco_unitario FROM materiais WHERE id = ? AND deleted_at IS NULL',
          [material_id]
        );

        if (!materiais.length) {
          await conn.rollback();
          return res.status(404).json({ 
            erro: `Material ID ${material_id} não encontrado ou inativo` 
          });
        }

        const preco_unitario = parseFloat(materiais[0].preco_unitario);
        const subtotal = qtd * preco_unitario;
        valor_total += subtotal;

        // Inserir item
        await conn.query(
          `INSERT INTO orcamento_itens
            (orcamento_id, material_id, quantidade, subtotal)
           VALUES (?, ?, ?, ?)`,
          [orcamento_id, material_id, qtd, subtotal]
        );
      }
    }

    // Atualizar valor total final
    await conn.query(
      'UPDATE orcamentos SET valor_total = ? WHERE id = ?',
      [valor_total, orcamento_id]
    );

    await conn.commit();
    res.status(201).json({
      id: orcamento_id,
      mensagem: 'Orçamento cadastrado com sucesso!',
      valor_total
    });

  } catch (erro) {
    await conn.rollback();
    console.error('Erro ao cadastrar orçamento:', erro);
    res.status(500).json({ erro: erro.message || 'Erro interno ao cadastrar' });
  } finally {
    conn.release();
  }
});

// Buscar orçamento completo por ID (dados + itens)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [orcamentos] = await conexao.query(`
      SELECT o.*,
             c.cli_nome_razao AS cliente_nome,
             s.nome AS status_nome
      FROM orcamentos o
      LEFT JOIN clientes c ON o.cliente_id = c.id
      LEFT JOIN status_orcamentos s ON o.status_id = s.id
      WHERE o.id = ? AND o.deleted_at IS NULL
    `, [id]);

    if (orcamentos.length === 0) {
      return res.status(404).json({ erro: 'Orçamento não encontrado' });
    }

    // Buscar itens do orçamento
    const [itens] = await conexao.query(`
      SELECT oi.*, m.nome AS material_nome, m.preco_unitario
      FROM orcamento_itens oi
      INNER JOIN materiais m ON oi.material_id = m.id
      WHERE oi.orcamento_id = ?
      ORDER BY oi.id
    `, [id]);

    res.json({ ...orcamentos[0], itens });

  } catch (erro) {
    console.error('Erro ao buscar orçamento:', erro);
    res.status(500).json({ erro: 'Erro na busca do orçamento' });
  }
});

// Atualizar orçamento completo
router.put('/:id', async (req, res) => {
  const conn = await conexao.getConnection();
  try {
    const { id } = req.params;
    const { descricao, tipo, data, cliente_id, status_id, itens } = req.body;

    if (!tipo || !data || !cliente_id || !status_id) {
      return res.status(400).json({ 
        erro: 'Preencha tipo, data, cliente e status' 
      });
    }

    await conn.beginTransaction();

    // Verificar existência
    const [existe] = await conn.query(
      'SELECT id FROM orcamentos WHERE id = ? AND deleted_at IS NULL',
      [id]
    );

    if (!existe.length) {
      await conn.rollback();
      return res.status(404).json({ erro: 'Orçamento não encontrado' });
    }

    // Atualizar dados principais
    await conn.query(
      `UPDATE orcamentos SET
        descricao = ?, tipo = ?, data = ?, cliente_id = ?, status_id = ?
       WHERE id = ?`,
      [descricao || null, tipo, data, cliente_id, status_id, id]
    );

    // Recriar lista de itens
    await conn.query('DELETE FROM orcamento_itens WHERE orcamento_id = ?', [id]);
    let valor_total = 0;

    if (Array.isArray(itens) && itens.length > 0) {
      for (const item of itens) {
        const { material_id, quantidade } = item;
        const qtd = parseFloat(quantidade);

        if (!material_id || isNaN(qtd) || qtd <= 0) {
          await conn.rollback();
          return res.status(400).json({ 
            erro: 'Material e quantidade válidos são obrigatórios' 
          });
        }

        const [materiais] = await conn.query(
          'SELECT preco_unitario FROM materiais WHERE id = ? AND deleted_at IS NULL',
          [material_id]
        );

        if (!materiais.length) {
          await conn.rollback();
          return res.status(404).json({ 
            erro: `Material ID ${material_id} não encontrado` 
          });
        }

        const subtotal = qtd * parseFloat(materiais[0].preco_unitario);
        valor_total += subtotal;

        await conn.query(
          `INSERT INTO orcamento_itens
            (orcamento_id, material_id, quantidade, subtotal)
           VALUES (?, ?, ?, ?)`,
          [id, material_id, qtd, subtotal]
        );
      }
    }

    // Atualizar valor total
    await conn.query(
      'UPDATE orcamentos SET valor_total = ? WHERE id = ?',
      [valor_total, id]
    );

    await conn.commit();
    res.json({
      mensagem: 'Orçamento atualizado com sucesso!',
      valor_total
    });

  } catch (erro) {
    await conn.rollback();
    console.error('Erro ao atualizar orçamento:', erro);
    res.status(500).json({ erro: erro.message || 'Erro ao atualizar' });
  } finally {
    conn.release();
  }
});

// Excluir orçamento (exclusão lógica)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [resultado] = await conexao.query(
      'UPDATE orcamentos SET deleted_at = NOW() WHERE id = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Orçamento não encontrado' });
    }

    res.json({ mensagem: 'Orçamento excluído com sucesso!' });

  } catch (erro) {
    console.error('Erro ao excluir orçamento:', erro);
    res.status(500).json({ erro: 'Erro ao excluir orçamento' });
  }
});

// =====================================================
// ROTAS DE ITENS INDIVIDUAIS
// =====================================================

// Adicionar/atualizar item em orçamento específico
router.post('/:orcamento_id/itens', async (req, res) => {
  const conn = await conexao.getConnection();
  try {
    const { orcamento_id } = req.params;
    const { material_id, quantidade } = req.body;
    const qtd = parseFloat(quantidade);

    if (!material_id || isNaN(qtd) || qtd <= 0) {
      return res.status(400).json({ 
        erro: 'Material e quantidade válidos são obrigatórios' 
      });
    }

    // Verificar orçamento
    const [orcamento] = await conn.query(
      'SELECT id FROM orcamentos WHERE id = ? AND deleted_at IS NULL',
      [orcamento_id]
    );

    if (!orcamento.length) {
      return res.status(404).json({ erro: 'Orçamento não encontrado' });
    }

    // Verificar material
    const [materiais] = await conn.query(
      'SELECT preco_unitario FROM materiais WHERE id = ? AND deleted_at IS NULL',
      [material_id]
    );

    if (!materiais.length) {
      return res.status(404).json({ erro: 'Material não encontrado' });
    }

    const preco_unitario = parseFloat(materiais[0].preco_unitario);
    const subtotal = qtd * preco_unitario;

    await conn.beginTransaction();

    // Inserir ou atualizar item
    await conn.query(
      `INSERT INTO orcamento_itens (orcamento_id, material_id, quantidade, subtotal)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE quantidade = VALUES(quantidade), subtotal = VALUES(subtotal)`,
      [orcamento_id, material_id, qtd, subtotal]
    );

    // Recalcular valor total
    const [soma] = await conn.query(`
      SELECT COALESCE(SUM(subtotal), 0) AS total
      FROM orcamento_itens
      WHERE orcamento_id = ?
    `, [orcamento_id]);

    await conn.query(
      'UPDATE orcamentos SET valor_total = ? WHERE id = ?',
      [soma[0].total, orcamento_id]
    );

    await conn.commit();
    res.json({
      mensagem: 'Item adicionado/atualizado com sucesso',
      subtotal,
      valor_total: soma[0].total
    });

  } catch (erro) {
    await conn.rollback();
    console.error('Erro ao processar item:', erro);
    res.status(500).json({ erro: 'Erro ao adicionar item' });
  } finally {
    conn.release();
  }
});

// Remover item específico de um orçamento
router.delete('/:orcamento_id/itens/:item_id', async (req, res) => {
  const conn = await conexao.getConnection();
  try {
    const { orcamento_id, item_id } = req.params;

    // Verificar se o item pertence ao orçamento
    const [itens] = await conn.query(
      'SELECT id FROM orcamento_itens WHERE id = ? AND orcamento_id = ?',
      [item_id, orcamento_id]
    );

    if (!itens.length) {
      return res.status(404).json({ erro: 'Item não encontrado neste orçamento' });
    }

    await conn.beginTransaction();

    // Remover item
    await conn.query(
      'DELETE FROM orcamento_itens WHERE id = ? AND orcamento_id = ?',
      [item_id, orcamento_id]
    );

    // Recalcular valor total
    const [soma] = await conn.query(`
      SELECT COALESCE(SUM(subtotal), 0) AS total
      FROM orcamento_itens
      WHERE orcamento_id = ?
    `, [orcamento_id]);

    await conn.query(
      'UPDATE orcamentos SET valor_total = ? WHERE id = ?',
      [soma[0].total, orcamento_id]
    );

    await conn.commit();
    res.json({
      mensagem: 'Item removido com sucesso',
      valor_total: soma[0].total
    });

  } catch (erro) {
    await conn.rollback();
    console.error('Erro ao remover item:', erro);
    res.status(500).json({ erro: 'Erro ao remover item' });
  } finally {
    conn.release();
  }
});

module.exports = router;
