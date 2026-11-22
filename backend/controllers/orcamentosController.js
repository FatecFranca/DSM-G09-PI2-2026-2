const db = require('../config/db');

// Listar todos os orçamentos ativos
exports.listar = async (req, res) => {
  try {
    const [orcamentos] = await db.query(`
      SELECT o.*, 
             c.nome AS cliente_nome,
             s.nome AS status_nome
      FROM orcamentos o
      LEFT JOIN clientes c ON o.cliente_id = c.id
      LEFT JOIN status_orcamentos s ON o.status_id = s.id
      WHERE o.deleted_at IS NULL
      ORDER BY o.created_at DESC
    `);
    return res.json(orcamentos);
  } catch (erro) {
    console.error('Erro ao listar orçamentos:', erro);
    return res.status(500).json({ erro: 'Erro interno ao listar orçamentos' });
  }
};

// Obter um orçamento por ID
exports.obter = async (req, res) => {
  try {
    const { id } = req.params;

    const [orcamentos] = await db.query(`
      SELECT o.*, 
             c.nome AS cliente_nome,
             s.nome AS status_nome
      FROM orcamentos o
      LEFT JOIN clientes c ON o.cliente_id = c.id
      LEFT JOIN status_orcamentos s ON o.status_id = s.id
      WHERE o.id = ? AND o.deleted_at IS NULL
    `, [id]);

    if (!orcamentos.length) {
      return res.status(404).json({ erro: 'Orçamento não encontrado' });
    }

    // Carregar itens do orçamento
    const [itens] = await db.query(`
      SELECT oi.*, m.nome AS material_nome, m.preco_unitario
      FROM orcamento_itens oi
      INNER JOIN materiais m ON oi.material_id = m.id
      WHERE oi.orcamento_id = ?
    `, [id]);

    return res.json({ ...orcamentos[0], itens });
  } catch (erro) {
    console.error('Erro ao obter orçamento:', erro);
    return res.status(500).json({ erro: 'Erro interno' });
  }
};

// Criar novo orçamento
exports.criar = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { descricao, tipo, data, cliente_id, status_id, itens } = req.body;

    if (!tipo || !data || !cliente_id || !status_id) {
      return res.status(400).json({
        erro: 'Preencha os campos obrigatórios: tipo, data, cliente e status'
      });
    }

    await conn.beginTransaction();

    // Cria o orçamento com valor inicial zero
    const [resultOrc] = await conn.query(
      `INSERT INTO orcamentos 
        (descricao, tipo, data, cliente_id, status_id, valor_total) 
       VALUES (?, ?, ?, ?, ?, 0.00)`,
      [descricao || null, tipo, data, cliente_id, status_id]
    );

    const orcamento_id = resultOrc.insertId;
    let valor_total = 0;

    // Processa os itens
    if (itens && Array.isArray(itens) && itens.length > 0) {
      for (const item of itens) {
        const { material_id, quantidade } = item;
        const qtd = parseFloat(quantidade);

        if (!material_id || isNaN(qtd) || qtd <= 0) {
          await conn.rollback();
          return res.status(400).json({ erro: 'Item inválido: material e quantidade são obrigatórios' });
        }

        const [materiais] = await conn.query(
          'SELECT preco_unitario FROM materiais WHERE id = ? AND deleted_at IS NULL',
          [material_id]
        );

        if (!materiais.length) {
          await conn.rollback();
          return res.status(404).json({ erro: `Material ID ${material_id} não encontrado` });
        }

        const subtotal = qtd * parseFloat(materiais[0].preco_unitario);
        valor_total += subtotal;

        await conn.query(
          `INSERT INTO orcamento_itens 
            (orcamento_id, material_id, quantidade, subtotal) 
           VALUES (?, ?, ?, ?)`,
          [orcamento_id, material_id, qtd, subtotal]
        );
      }
    }

    // Atualiza o valor total
    await conn.query(
      'UPDATE orcamentos SET valor_total = ? WHERE id = ?',
      [valor_total, orcamento_id]
    );

    await conn.commit();

    return res.status(201).json({
      id: orcamento_id,
      mensagem: 'Orçamento criado com sucesso',
      valor_total
    });
  } catch (erro) {
    await conn.rollback();
    console.error('Erro ao criar orçamento:', erro);
    return res.status(500).json({ erro: 'Erro ao cadastrar orçamento' });
  } finally {
    conn.release();
  }
};

// Atualizar orçamento
exports.atualizar = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { id } = req.params;
    const { descricao, tipo, data, cliente_id, status_id, itens } = req.body;

    if (!tipo || !data || !cliente_id || !status_id) {
      return res.status(400).json({
        erro: 'Preencha os campos obrigatórios: tipo, data, cliente e status'
      });
    }

    await conn.beginTransaction();

    // Verifica existência
    const [existe] = await conn.query(
      'SELECT id FROM orcamentos WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    if (!existe.length) {
      await conn.rollback();
      return res.status(404).json({ erro: 'Orçamento não encontrado' });
    }

    // Atualiza dados principais
    await conn.query(
      `UPDATE orcamentos 
       SET descricao = ?, tipo = ?, data = ?, cliente_id = ?, status_id = ?
       WHERE id = ?`,
      [descricao || null, tipo, data, cliente_id, status_id, id]
    );

    // Remove itens antigos e recria
    await conn.query('DELETE FROM orcamento_itens WHERE orcamento_id = ?', [id]);
    let valor_total = 0;

    if (itens && Array.isArray(itens) && itens.length > 0) {
      for (const item of itens) {
        const { material_id, quantidade } = item;
        const qtd = parseFloat(quantidade);

        if (!material_id || isNaN(qtd) || qtd <= 0) {
          await conn.rollback();
          return res.status(400).json({ erro: 'Item inválido' });
        }

        const [materiais] = await conn.query(
          'SELECT preco_unitario FROM materiais WHERE id = ? AND deleted_at IS NULL',
          [material_id]
        );

        if (!materiais.length) {
          await conn.rollback();
          return res.status(404).json({ erro: `Material ID ${material_id} não encontrado` });
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

    await conn.query(
      'UPDATE orcamentos SET valor_total = ? WHERE id = ?',
      [valor_total, id]
    );

    await conn.commit();

    return res.json({ mensagem: 'Orçamento atualizado com sucesso', valor_total });
  } catch (erro) {
    await conn.rollback();
    console.error('Erro ao atualizar orçamento:', erro);
    return res.status(500).json({ erro: 'Erro ao atualizar orçamento' });
  } finally {
    conn.release();
  }
};

// Exclusão lógica
exports.excluir = async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await db.query(
      'UPDATE orcamentos SET deleted_at = NOW() WHERE id = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Orçamento não encontrado' });
    }

    return res.json({ mensagem: 'Orçamento excluído com sucesso' });
  } catch (erro) {
    console.error('Erro ao excluir orçamento:', erro);
    return res.status(500).json({ erro: 'Erro ao excluir orçamento' });
  }
};

// --- Endpoints auxiliares de itens ---

// Adicionar/atualizar item individual
exports.adicionarItem = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { orcamento_id } = req.params;
    const { material_id, quantidade } = req.body;
    const qtd = parseFloat(quantidade);

    if (!material_id || isNaN(qtd) || qtd <= 0) {
      return res.status(400).json({ erro: 'Material e quantidade válidos são obrigatórios' });
    }

    const [orcamento] = await db.query(
      'SELECT id FROM orcamentos WHERE id = ? AND deleted_at IS NULL',
      [orcamento_id]
    );
    if (!orcamento.length) {
      return res.status(404).json({ erro: 'Orçamento não encontrado' });
    }

    const [materiais] = await db.query(
      'SELECT preco_unitario FROM materiais WHERE id = ? AND deleted_at IS NULL',
      [material_id]
    );
    if (!materiais.length) {
      return res.status(404).json({ erro: 'Material não encontrado' });
    }

    const subtotal = qtd * parseFloat(materiais[0].preco_unitario);

    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO orcamento_itens (orcamento_id, material_id, quantidade, subtotal)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE quantidade = ?, subtotal = ?`,
      [orcamento_id, material_id, qtd, subtotal, qtd, subtotal]
    );

    await atualizarValorTotal(conn, orcamento_id);
    await conn.commit();

    return res.json({ mensagem: 'Item adicionado', subtotal });
  } catch (erro) {
    await conn.rollback();
    console.error('Erro ao adicionar item:', erro);
    return res.status(500).json({ erro: 'Erro ao adicionar item' });
  } finally {
    conn.release();
  }
};

// Remover item individual
exports.removerItem = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { id } = req.params;

    const [itens] = await db.query(
      'SELECT orcamento_id FROM orcamento_itens WHERE id = ?',
      [id]
    );
    if (!itens.length) {
      return res.status(404).json({ erro: 'Item não encontrado' });
    }

    await conn.beginTransaction();
    await conn.query('DELETE FROM orcamento_itens WHERE id = ?', [id]);
    await atualizarValorTotal(conn, itens[0].orcamento_id);
    await conn.commit();

    return res.json({ mensagem: 'Item removido' });
  } catch (erro) {
    await conn.rollback();
    console.error('Erro ao remover item:', erro);
    return res.status(500).json({ erro: 'Erro ao remover item' });
  } finally {
    conn.release();
  }
};

// Função auxiliar — recalcula e atualiza o valor_total
async function atualizarValorTotal(conn, orcamento_id) {
  const [soma] = await conn.query(`
    SELECT COALESCE(SUM(subtotal), 0) AS total 
    FROM orcamento_itens 
    WHERE orcamento_id = ?
  `, [orcamento_id]);

  await conn.query(
    'UPDATE orcamentos SET valor_total = ? WHERE id = ?',
    [soma[0].total, orcamento_id]
  );
}
