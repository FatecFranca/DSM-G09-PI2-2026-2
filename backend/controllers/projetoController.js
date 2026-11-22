const db = require('../config/db');

// Listar todos os projetos ativos
exports.listar = async (req, res) => {
  try {
    const [projetos] = await db.query(`
      SELECT p.*,
             c.cli_nome_razao AS cliente_nome,
             s.nome AS status_nome,
             (SELECT COUNT(*) FROM projeto_orcamentos po WHERE po.projeto_id = p.id) AS qtd_orcamentos,
             COALESCE(
               (SELECT JSON_ARRAYAGG(po.orcamento_id)
                FROM projeto_orcamentos po
                WHERE po.projeto_id = p.id),
               JSON_ARRAY()
             ) AS orcamentos_ids
      FROM projetos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      LEFT JOIN status_projetos s ON p.status_id = s.id
      WHERE p.deleted_at IS NULL
      ORDER BY p.created_at DESC
    `);
    
    console.log('🔥 CONTROLLER ATUALIZADA!', projetos[0]);
    return res.json(projetos);
  } catch (erro) {
    console.error('Erro ao listar projetos:', erro);
    return res.status(500).json({ erro: 'Erro interno ao listar projetos' });
  }
};

// Obter um projeto por ID
exports.obter = async (req, res) => {
  try {
    const { id } = req.params;

    const [projetos] = await db.query(`
      SELECT p.*,
             c.cli_nome_razao AS cliente_nome,
             s.nome AS status_nome
      FROM projetos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      LEFT JOIN status_projetos s ON p.status_id = s.id
      WHERE p.id = ? AND p.deleted_at IS NULL
    `, [id]);

    if (!projetos.length) {
      return res.status(404).json({ erro: 'Projeto não encontrado' });
    }

    // Carregar orçamentos vinculados
    const [orcamentos] = await db.query(`
      SELECT po.orcamento_id, o.valor_total, o.tipo, o.data
      FROM projeto_orcamentos po
      INNER JOIN orcamentos o ON po.orcamento_id = o.id
      WHERE po.projeto_id = ?
    `, [id]);

    return res.json({ ...projetos[0], orcamentos });
  } catch (erro) {
    console.error('Erro ao obter projeto:', erro);
    return res.status(500).json({ erro: 'Erro interno' });
  }
};

// Criar novo projeto
exports.criar = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { nome, tipo, data_inicio, data_fim, cliente_id, status_id, orcamentos = [] } = req.body;

    if (!nome || !tipo || !data_inicio || !cliente_id || !status_id) {
      return res.status(400).json({
        erro: 'Preencha os campos obrigatórios: nome, tipo, data de início, cliente e status'
      });
    }

    await conn.beginTransaction();

    // Cria o projeto
    const [resultProj] = await conn.query(
      `INSERT INTO projetos
        (nome, tipo, data_inicio, data_fim, cliente_id, status_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nome, tipo, data_inicio, data_fim || null, cliente_id, status_id]
    );

    const projeto_id = resultProj.insertId;

    // Vincula orçamentos
    if (Array.isArray(orcamentos) && orcamentos.length > 0) {
      for (const orc_id of orcamentos) {
        if (!orc_id) continue;

        const [existeOrc] = await conn.query(
          'SELECT id FROM orcamentos WHERE id = ? AND deleted_at IS NULL',
          [orc_id]
        );
        if (!existeOrc.length) {
          await conn.rollback();
          return res.status(404).json({ erro: `Orçamento ID ${orc_id} não encontrado` });
        }

        await conn.query(
          `INSERT IGNORE INTO projeto_orcamentos (projeto_id, orcamento_id)
           VALUES (?, ?)`,
          [projeto_id, orc_id]
        );
      }
    }

    await conn.commit();

    return res.status(201).json({
      id: projeto_id,
      mensagem: 'Projeto criado com sucesso'
    });
  } catch (erro) {
    await conn.rollback();
    console.error('Erro ao criar projeto:', erro);
    return res.status(500).json({ erro: 'Erro ao cadastrar projeto' });
  } finally {
    conn.release();
  }
};

// Atualizar projeto
exports.atualizar = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { id } = req.params;
    const { nome, tipo, data_inicio, data_fim, cliente_id, status_id, orcamentos = [] } = req.body;

    if (!nome || !tipo || !data_inicio || !cliente_id || !status_id) {
      return res.status(400).json({
        erro: 'Preencha os campos obrigatórios: nome, tipo, data de início, cliente e status'
      });
    }

    await conn.beginTransaction();

    // Verifica existência
    const [existe] = await conn.query(
      'SELECT id FROM projetos WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    if (!existe.length) {
      await conn.rollback();
      return res.status(404).json({ erro: 'Projeto não encontrado' });
    }

    // Atualiza dados principais
    await conn.query(
      `UPDATE projetos
       SET nome = ?, tipo = ?, data_inicio = ?, data_fim = ?, cliente_id = ?, status_id = ?
       WHERE id = ?`,
      [nome, tipo, data_inicio, data_fim || null, cliente_id, status_id, id]
    );

    // Remove vínculos antigos e recria
    await conn.query('DELETE FROM projeto_orcamentos WHERE projeto_id = ?', [id]);

    if (Array.isArray(orcamentos) && orcamentos.length > 0) {
      for (const orc_id of orcamentos) {
        if (!orc_id) continue;

        const [existeOrc] = await conn.query(
          'SELECT id FROM orcamentos WHERE id = ? AND deleted_at IS NULL',
          [orc_id]
        );
        if (!existeOrc.length) {
          await conn.rollback();
          return res.status(404).json({ erro: `Orçamento ID ${orc_id} não encontrado` });
        }

        await conn.query(
          'INSERT INTO projeto_orcamentos (projeto_id, orcamento_id) VALUES (?, ?)',
          [id, orc_id]
        );
      }
    }

    await conn.commit();

    return res.json({ mensagem: 'Projeto atualizado com sucesso' });
  } catch (erro) {
    await conn.rollback();
    console.error('Erro ao atualizar projeto:', erro);
    return res.status(500).json({ erro: 'Erro ao atualizar projeto' });
  } finally {
    conn.release();
  }
};

// Exclusão lógica
exports.excluir = async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await db.query(
      'UPDATE projetos SET deleted_at = NOW() WHERE id = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Projeto não encontrado' });
    }

    return res.json({ mensagem: 'Projeto excluído com sucesso' });
  } catch (erro) {
    console.error('Erro ao excluir projeto:', erro);
    return res.status(500).json({ erro: 'Erro ao excluir projeto' });
  }
};

// Listar status dos projetos
exports.listarStatus = async (req, res) => {
  try {
    const [status] = await db.query(
      'SELECT * FROM status_projetos ORDER BY id'
    );
    return res.json(status);
  } catch (erro) {
    console.error('Erro ao buscar status de projetos:', erro);
    return res.status(500).json({ erro: 'Erro ao buscar status' });
  }
};
