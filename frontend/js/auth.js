// Verifica se já está logado
if (localStorage.getItem('token')) {
  window.location.href = 'dashboard.html';
}

// Submissão do formulário
const formLogin = document.getElementById('formLogin');
const msgErro = document.getElementById('mensagemErro');

formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  msgErro.textContent = '';

  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;

  try {
    const resposta = await login(email, senha);

    if (resposta.erro) {
      msgErro.textContent = resposta.erro;
      return;
    }

    // Salva sessão
    localStorage.setItem('token', resposta.token);
    localStorage.setItem('usuario', JSON.stringify(resposta.usuario));

    // Redireciona
    window.location.href = 'dashboard.html';
  } catch (err) {
    msgErro.textContent = 'Falha na conexão — verifique o servidor';
    console.error(err);
  }
});
