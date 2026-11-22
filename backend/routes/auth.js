const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const conexao = require('../config/db');

const TOKEN_VALIDO = 'sistema-token-2026-seguro';

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    console.log('🔐 Tentativa de login:', email);

    if (!email || !senha) {
      return res.status(400).json({ erro: 'E-mail e senha são obrigatórios' });
    }

    const [usuarios] = await conexao.query(
      `SELECT u.id, u.nome, u.email, u.senha, u.nivel_id, u.usu_ativo, n.nivel_nome
       FROM usuarios u LEFT JOIN niveis_acesso n ON u.nivel_id = n.nivel_id
       WHERE u.email = ?`,
      [email]
    );

    if (usuarios.length === 0) {
      console.log('❌ Usuário não encontrado');
      return res.status(401).json({ erro: 'E-mail ou senha inválidos' });
    }

    const usuario = usuarios[0];

    if (usuario.usu_ativo !== 'S') {
      console.log('❌ Usuário inativo');
      return res.status(401).json({ erro: 'Usuário inativo' });
    }

    // Compara senha com hash
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      console.log('❌ Senha incorreta');
      return res.status(401).json({ erro: 'E-mail ou senha inválidos' });
    }

    // Atualiza último acesso
    await conexao.query(
      'UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = ?',
      [usuario.id]
    );

    console.log('✅ Login autorizado:', usuario.nome);
    res.json({
      token: TOKEN_VALIDO,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        nivel: usuario.nivel_nome || 'Usuário'
      }
    });

  } catch (erro) {
    console.error('❌ Erro no login:', erro.message);
    res.status(500).json({ erro: 'Erro no servidor' });
  }
});

module.exports = router;
