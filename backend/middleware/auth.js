const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  const { email, senha } = req.body;

  // Ajuste conforme seu banco/dados
  if (email === 'admin@sistema.com' && senha === '123456') {
    return res.json({
      token: 'sistema-token-2026-seguro',
      usuario: {
        nome: 'Administrador',
        nivel: 'Admin'
      }
    });
  }

  res.status(401).json({ erro: 'E-mail ou senha inválidos' });
});

function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Acesso não autorizado' });
  }

  const token = authHeader.split(' ')[1];

  // Aceita o token fixo do login simples
  const tokenValido = 'sistema-token-2026-seguro';

  if (token !== tokenValido) {
    console.log('⚠️ Token recebido:', token);
    console.log('⚠️ Esperado:', tokenValido);
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }

  next();
}

module.exports = { verificarToken };

