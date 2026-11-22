const db = require('../config/db'); // ajuste o caminho conforme sua conexão

// Listar todos os materiais ativos
exports.listar = async (req, res) => {
  try {
    const [linhas] = await db.query(
      'SELECT * FROM materiais WHERE deleted_at IS NULL ORDER BY nome ASC'
    );
    return res.json(linhas);
  } catch (erro) {
    console.error('Erro ao listar materiais:', erro);
    return res.status(500).json({ erro: 'Erro interno ao listar' });
  }
};

// Obter um material por ID
exports.obter = async (req, res) => {
  try {
    const { id } = req.params;
    const [linhas] = await db.query(
      'SELECT * FROM materiais WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    if (!linhas.length) {
      return res.status(404).json({ erro: 'Material não encontrado' });
    }
    return res.json(linhas[0]);
  } catch (erro) {
    console.error('Erro ao obter material:', erro);
    return res.status(500).json({ erro: 'Erro interno' });
  }
};

// Criar novo material
exports.criar = async (req, res) => {
  try {
    const { nome, unidade, preco_unitario } = req.body;
    
    if (!nome || !unidade || preco_unitario === undefined) {
      return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios' });
    }

    const [resultado] = await db.query(
      'INSERT INTO materiais (nome, unidade, preco_unitario) VALUES (?, ?, ?)',
      [nome.trim(), unidade.trim(), preco_unitario]
    );

    return res.status(201).json({
      id: resultado.insertId,
      nome,
      unidade,
      preco_unitario,
      mensagem: 'Material cadastrado com sucesso'
    });
  } catch (erro) {
    console.error('Erro ao criar material:', erro);
    return res.status(500).json({ erro: 'Erro ao cadastrar' });
  }
};

// Atualizar material
exports.atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, unidade, preco_unitario } = req.body;

    if (!nome || !unidade || preco_unitario === undefined) {
      return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios' });
    }

    const [resultado] = await db.query(
      'UPDATE materiais SET nome = ?, unidade = ?, preco_unitario = ? WHERE id = ?',
      [nome.trim(), unidade.trim(), preco_unitario, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Material não encontrado' });
    }

    return res.json({ mensagem: 'Material atualizado com sucesso' });
  } catch (erro) {
    console.error('Erro ao atualizar material:', erro);
    return res.status(500).json({ erro: 'Erro ao atualizar' });
  }
};

// Exclusão lógica
exports.excluir = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [resultado] = await db.query(
      'UPDATE materiais SET deleted_at = NOW() WHERE id = ?',
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Material não encontrado' });
    }

    return res.json({ mensagem: 'Material excluído com sucesso' });
  } catch (erro) {
    console.error('Erro ao excluir material:', erro);
    return res.status(500).json({ erro: 'Erro ao excluir' });
  }
};
