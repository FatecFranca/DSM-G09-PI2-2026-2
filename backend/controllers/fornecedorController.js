const pool = require('../config/db');
const { limpaNumeros, validaCPF, validaCNPJ } = require('../utils/validadores');

const camposComuns = [
  'for_tipo', 'for_nome_razao', 'for_nome_fantasia', 'for_cpf', 'for_cnpj',
  'for_ie', 'for_im', 'for_email', 'for_telefone', 'for_celular', 'for_contato',
  'for_endereco', 'for_numero', 'for_complemento', 'for_bairro', 'for_cidade',
  'for_estado', 'for_cep', 'for_categoria', 'for_condicao_pgto', 'for_prazo_entrega_dias',
  'for_banco', 'for_agencia', 'for_conta', 'for_chave_pix', 'for_observacoes', 'for_ativo'
];

module.exports = {
  async listar(req, res) {
    try {
      const [fornecedores] = await pool.query(
        'SELECT * FROM fornecedores ORDER BY for_nome_razao'
      );
      res.json(fornecedores);
    } catch (e) {
      res.status(500).json({ erro: e.message });
    }
  },

  async cadastrar(req, res) {
    const dados = req.body;
    
    // Validação — SEM RG
    if (dados.for_tipo === 'F' && !validaCPF(dados.for_cpf)) {
      return res.status(400).json({ erro: 'CPF inválido' });
    }
    if (dados.for_tipo === 'J' && !validaCNPJ(dados.for_cnpj)) {
      return res.status(400).json({ erro: 'CNPJ inválido' });
    }

    try {
      const valores = camposComuns.map(c => {
        if (['for_cpf','for_cnpj','for_cep'].includes(c)) {
          return dados[c] ? limpaNumeros(dados[c]) : null;
        }
        return dados[c] || null;
      });
      valores.push(req.usuario.usu_codigo);

      const [result] = await pool.query(
        `INSERT INTO fornecedores (${camposComuns.join(',')}, usu_cadastro) VALUES (${',?'.repeat(camposComuns.length).slice(1)}, ?)`,
        valores
      );
      res.status(201).json({ id: result.insertId, mensagem: 'Fornecedor cadastrado' });
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ erro: 'E-mail, CPF ou CNPJ já cadastrado' });
      }
      res.status(500).json({ erro: e.message });
    }
  }
};
