const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const conexao = require('../config/db'); // ← importa conexão

router.use(verificarToken);

// ===== LISTAR TODOS =====
router.get('/', async (req, res) => {
  try {
    const [fornecedores] = await conexao.query(`
      SELECT * FROM fornecedores ORDER BY for_nome_razao ASC
    `);
    res.json(fornecedores);
  } catch (erro) {
    console.error('Erro ao listar fornecedores:', erro);
    res.status(500).json({ erro: 'Erro ao buscar fornecedores' });
  }
});

// ===== CADASTRAR =====
router.post('/', async (req, res) => {
  try {
    const dados = req.body;
    const [resultado] = await conexao.query(
      `INSERT INTO fornecedores (
        for_tipo, for_nome_razao, for_nome_fantasia, for_cpf, for_cnpj,
        for_rg, for_ie, for_im, for_email, for_telefone, for_celular,
        for_contato, for_endereco, for_numero, for_complemento, for_bairro,
        for_cidade, for_estado, for_cep, for_categoria, for_condicao_pgto,
        for_prazo_entrega_dias, for_banco, for_agencia, for_conta, for_chave_pix,
        for_observacoes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dados.for_tipo, dados.for_nome_razao, dados.for_nome_fantasia,
        dados.for_cpf, dados.for_cnpj, dados.for_rg, dados.for_ie, dados.for_im,
        dados.for_email, dados.for_telefone, dados.for_celular, dados.for_contato,
        dados.for_endereco, dados.for_numero, dados.for_complemento, dados.for_bairro,
        dados.for_cidade, dados.for_estado, dados.for_cep, dados.for_categoria,
        dados.for_condicao_pgto, dados.for_prazo_entrega_dias, dados.for_banco,
        dados.for_agencia, dados.for_conta, dados.for_chave_pix, dados.for_observacoes
      ]
    );
    res.status(201).json({ id: resultado.insertId, mensagem: 'Fornecedor cadastrado com sucesso!' });
  } catch (erro) {
    console.error('Erro ao cadastrar fornecedor:', erro);
    res.status(500).json({ erro: erro.message || 'Erro ao cadastrar' });
  }
});

// ===== BUSCAR POR ID =====
router.get('/:id', async (req, res) => {
  try {
    const [fornecedores] = await conexao.query('SELECT * FROM fornecedores WHERE id = ?', [req.params.id]);
    if (fornecedores.length === 0) {
      return res.status(404).json({ erro: 'Fornecedor não encontrado' });
    }
    res.json(fornecedores[0]);
  } catch (erro) {
    console.error('Erro ao buscar fornecedor:', erro);
    res.status(500).json({ erro: 'Erro na busca' });
  }
});

// ===== ATUALIZAR =====
router.put('/:id', async (req, res) => {
  try {
    const dados = req.body;
    await conexao.query(
      `UPDATE fornecedores SET
        for_tipo=?, for_nome_razao=?, for_nome_fantasia=?, for_cpf=?, for_cnpj=?,
        for_rg=?, for_ie=?, for_im=?, for_email=?, for_telefone=?, for_celular=?,
        for_contato=?, for_endereco=?, for_numero=?, for_complemento=?, for_bairro=?,
        for_cidade=?, for_estado=?, for_cep=?, for_categoria=?, for_condicao_pgto=?,
        for_prazo_entrega_dias=?, for_banco=?, for_agencia=?, for_conta=?, for_chave_pix=?,
        for_observacoes=?
       WHERE id=?`,
      [
        dados.for_tipo, dados.for_nome_razao, dados.for_nome_fantasia,
        dados.for_cpf, dados.for_cnpj, dados.for_rg, dados.for_ie, dados.for_im,
        dados.for_email, dados.for_telefone, dados.for_celular, dados.for_contato,
        dados.for_endereco, dados.for_numero, dados.for_complemento, dados.for_bairro,
        dados.for_cidade, dados.for_estado, dados.for_cep, dados.for_categoria,
        dados.for_condicao_pgto, dados.for_prazo_entrega_dias, dados.for_banco,
        dados.for_agencia, dados.for_conta, dados.for_chave_pix, dados.for_observacoes,
        req.params.id
      ]
    );
    res.json({ mensagem: 'Fornecedor atualizado com sucesso!' });
  } catch (erro) {
    console.error('Erro ao atualizar fornecedor:', erro);
    res.status(500).json({ erro: erro.message || 'Erro ao atualizar' });
  }
});

// ===== EXCLUIR =====
router.delete('/:id', async (req, res) => {
  try {
    const [resultado] = await conexao.query('DELETE FROM fornecedores WHERE id = ?', [req.params.id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Fornecedor não encontrado' });
    }
    res.json({ mensagem: 'Fornecedor excluído com sucesso!' });
  } catch (erro) {
    console.error('Erro ao excluir fornecedor:', erro);
    res.status(500).json({ erro: 'Erro ao excluir' });
  }
});

module.exports = router;
