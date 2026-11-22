const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const conexao = require('../config/db');

router.use(verificarToken);

// =====================================================
// ROTAS DE STATUS
// =====================================================

// Listar todos os status de projeto
router.get('/status', async (req, res) => {
  try {
    const [status] = await conexao.query(
      'SELECT * FROM status_projetos ORDER BY id'
    );
    res.json(status);
  } catch (erro) {
    console.error('Erro ao buscar status:', erro);
    res.status(500).json({ erro: 'Erro ao buscar status' });
  }
});

// =====================================================
// ROTAS PRINCIPAIS DE PROJETOS
// =====================================================

// Listar todos os projetos com dados de cliente e status
router.get('/', async (req, res) => {
  try {
    const [projetos] = await conexao.query(`
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
    
    console.log('🔥 ROTA ATUALIZADA! Projeto 7:', projetos.find(p => p.id === 7));
    res.json(projetos);
  } catch (erro) {
    console.error('Erro ao listar projetos:', erro);
    res.status(500).json({ erro: 'Erro ao buscar projetos' });
  }
});

// Cadastrar novo projeto com vínculo de orçamentos
router.post('/', async (req, res) => {
  const conn = await conexao.getConnection();
  try {
    const { nome, tipo, data_inicio, data_fim, cliente_id, status_id, orcamentos = [] } = req.body;

    // Validações obrigatórias
    if (!nome || !tipo || !data_inicio || !cliente_id || !status_id) {
      return res.status(400).json({ 
        erro: 'Preencha todos os campos obrigatórios: nome, tipo, data de início, cliente e status' 
      });
    }

    await conn.beginTransaction();

    // Inserir projeto
    const [resultado] = await conn.query(
      `INSERT INTO projetos
        (nome, tipo, data_inicio, data_fim, cliente_id, status_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nome, tipo, data_inicio, data_fim || null, cliente_id, status_id]
    );

    const projeto_id = resultado.insertId;

    // Vincular orçamentos
    if (Array.isArray(orcamentos) && orcamentos.length > 0) {
      for (const orc_id of orcamentos) {
        if (!orc_id) continue;

        const [existeOrc] = await conn.query(
          'SELECT id FROM orcamentos WHERE id = ? AND deleted_at IS NULL',
          [orc_id]
        );

        if (!existeOrc.length) {
          await conn.rollback();
          return res.status(404).json({ 
            erro: `Orçamento ID ${orc_id} não encontrado ou inativo` 
          });
        }

        await conn.query(
          `INSERT IGNORE INTO projeto_orcamentos (projeto_id, orcamento_id)
           VALUES (?, ?)`,
          [projeto_id, orc_id]
        );
      }
    }

    await conn.commit();
    res.status(201).json({
      id: projeto_id,
      mensagem: 'Projeto cadastrado com sucesso!'
    });

  } catch (erro) {
    await conn.rollback();
    console.error('Erro ao cadastrar projeto:', erro);
    res.status(500).json({ erro: erro.message || 'Erro interno ao cadastrar' });
  } finally {
    conn.release();
  }
});

// Buscar projeto completo por ID (dados + orçamentos vinculados)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [projetos] = await conexao.query(`
      SELECT p.*,
             c.cli_nome_razao AS cliente_nome,
             s.nome AS status_nome
      FROM projetos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      LEFT JOIN status_projetos s ON p.status_id = s.id
      WHERE p.id = ? AND p.deleted_at IS NULL
    `, [id]);

    if (projetos.length === 0) {
      return res.status(404).json({ erro: 'Projeto não encontrado' });
    }

    // Buscar orçamentos vinculados
    const [orcamentos] = await conexao.query(`
      SELECT po.orcamento_id, o.valor_total, o.tipo, o.data
      FROM projeto_orcamentos po
      INNER JOIN orcamentos o ON po.orcamento_id = o.id
      WHERE po.projeto_id = ?
      ORDER BY po.id
    `, [id]);

    res.json({ ...projetos[0], orcamentos });

  } catch (erro) {
    console.error('Erro ao buscar projeto:', erro);
    res.status(500).json({ erro: 'Erro na busca do projeto' });
  }
});

// Atualizar projeto completo
router.put('/:id', async (req, res) => {
  const conn = await conexao.getConnection();
  try {
    const { id } = req.params;
    const { nome, tipo, data_inicio, data_fim, cliente_id, status_id, orcamentos = [] } = req.body;

    if (!nome || !tipo || !data_inicio || !cliente_id || !status_id) {
      return res.status(400).json({ 
        erro: 'Preencha nome, tipo, data de início, cliente e status' 
      });
    }

    await conn.beginTransaction();

    // Verificar existência
    const [existe] = await conn.query(
      'SELECT id FROM projetos WHERE id = ? AND deleted_at IS NULL',
      [id]
    );

    if (!existe.length) {
      await conn.rollback();
      return res.status(404).json({ erro: 'Projeto não encontrado' });
    }

    // Atualizar dados principais
    await conn.query(
      `UPDATE projetos SET
        nome = ?, tipo = ?, data_inicio = ?, data_fim = ?, cliente_id = ?, status_id = ?
       WHERE id = ?`,
      [nome, tipo, data_inicio, data_fim || null, cliente_id, status_id, id]
    );

    // Recriar vínculos de orçamentos
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
          return res.status(404).json({ 
            erro: `Orçamento ID ${orc_id} não encontrado` 
          });
        }

        await conn.query(
          'INSERT INTO projeto_orcamentos (projeto_id, orcamento_id) VALUES (?, ?)',
          [id, orc_id]
        );
      }
    }

    await conn.commit();
    res.json({
      mensagem: 'Projeto atualizado com sucesso!'
    });

  } catch (erro) {
    await conn.rollback();
    console.error('Erro ao atualizar projeto:', erro);
    res.status(500).json({ erro: erro.message || 'Erro ao atualizar' });
  } finally {
    conn.release();
  }
});

// Excluir projeto (exclusão lógica)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [resultado] = await conexao.query(
      'UPDATE projetos SET deleted_at = NOW() WHERE id = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Projeto não encontrado' });
    }

    res.json({ mensagem: 'Projeto excluído com sucesso!' });

  } catch (erro) {
    console.error('Erro ao excluir projeto:', erro);
    res.status(500).json({ erro: 'Erro ao excluir projeto' });
  }
});

module.exports = router;
