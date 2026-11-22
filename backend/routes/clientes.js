const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const conexao = require('../config/db'); // ← importa conexão

router.use(verificarToken);

// ===== LISTAR TODOS =====
router.get('/', async (req, res) => {
  try {
    const [clientes] = await conexao.query(`
      SELECT * FROM clientes ORDER BY cli_nome_razao ASC
    `);
    res.json(clientes);
  } catch (erro) {
    console.error('Erro ao listar clientes:', erro);
    res.status(500).json({ erro: 'Erro ao buscar clientes' });
  }
});

// ===== CADASTRAR =====
router.post('/', async (req, res) => {
  try {
    const dados = req.body;
    const [resultado] = await conexao.query(
      `INSERT INTO clientes (
        cli_tipo, cli_nome_razao, cli_nome_fantasia, cli_cpf, cli_cnpj,
        cli_rg, cli_ie, cli_im, cli_email, cli_telefone, cli_celular,
        cli_contato, cli_endereco, cli_numero, cli_complemento, cli_bairro,
        cli_cidade, cli_estado, cli_cep, cli_limite_credito, cli_observacoes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dados.cli_tipo, dados.cli_nome_razao, dados.cli_nome_fantasia,
        dados.cli_cpf, dados.cli_cnpj, dados.cli_rg, dados.cli_ie, dados.cli_im,
        dados.cli_email, dados.cli_telefone, dados.cli_celular, dados.cli_contato,
        dados.cli_endereco, dados.cli_numero, dados.cli_complemento, dados.cli_bairro,
        dados.cli_cidade, dados.cli_estado, dados.cli_cep, dados.cli_limite_credito,
        dados.cli_observacoes
      ]
    );
    res.status(201).json({ id: resultado.insertId, mensagem: 'Cliente cadastrado com sucesso!' });
  } catch (erro) {
    console.error('Erro ao cadastrar cliente:', erro);
    res.status(500).json({ erro: erro.message || 'Erro ao cadastrar' });
  }
});

// ===== BUSCAR POR ID =====
router.get('/:id', async (req, res) => {
  try {
    const [clientes] = await conexao.query('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
    if (clientes.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }
    res.json(clientes[0]);
  } catch (erro) {
    console.error('Erro ao buscar cliente:', erro);
    res.status(500).json({ erro: 'Erro na busca' });
  }
});

// ===== ATUALIZAR =====
router.put('/:id', async (req, res) => {
  try {
    const dados = req.body;
    await conexao.query(
      `UPDATE clientes SET
        cli_tipo=?, cli_nome_razao=?, cli_nome_fantasia=?, cli_cpf=?, cli_cnpj=?,
        cli_rg=?, cli_ie=?, cli_im=?, cli_email=?, cli_telefone=?, cli_celular=?,
        cli_contato=?, cli_endereco=?, cli_numero=?, cli_complemento=?, cli_bairro=?,
        cli_cidade=?, cli_estado=?, cli_cep=?, cli_limite_credito=?, cli_observacoes=?
       WHERE id=?`,
      [
        dados.cli_tipo, dados.cli_nome_razao, dados.cli_nome_fantasia,
        dados.cli_cpf, dados.cli_cnpj, dados.cli_rg, dados.cli_ie, dados.cli_im,
        dados.cli_email, dados.cli_telefone, dados.cli_celular, dados.cli_contato,
        dados.cli_endereco, dados.cli_numero, dados.cli_complemento, dados.cli_bairro,
        dados.cli_cidade, dados.cli_estado, dados.cli_cep, dados.cli_limite_credito,
        dados.cli_observacoes, req.params.id
      ]
    );
    res.json({ mensagem: 'Cliente atualizado com sucesso!' });
  } catch (erro) {
    console.error('Erro ao atualizar cliente:', erro);
    res.status(500).json({ erro: erro.message || 'Erro ao atualizar' });
  }
});

// ===== EXCLUIR =====
router.delete('/:id', async (req, res) => {
  try {
    const [resultado] = await conexao.query('DELETE FROM clientes WHERE id = ?', [req.params.id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }
    res.json({ mensagem: 'Cliente excluído com sucesso!' });
  } catch (erro) {
    console.error('Erro ao excluir cliente:', erro);
    res.status(500).json({ erro: 'Erro ao excluir' });
  }
});

module.exports = router;
