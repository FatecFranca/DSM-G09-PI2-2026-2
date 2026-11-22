import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  Paper,
  Container
} from '@mui/material';
import api from '../services/api';

export default function Login() {
  const [form, setForm] = useState({ login: '', senha: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const res = await api.post('/auth/login', form);
      
      // Salva token e dados do usuário no localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
      
      // Redireciona para a página inicial
      navigate('/');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Login ou senha inválidos');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 3 }}>
          <Typography component="h1" variant="h5" align="center" sx={{ mb: 3 }}>
            Sistema de Cadastro
          </Typography>
          
          {erro && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {erro}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="login"
              label="Usuário"
              name="login"
              autoComplete="username"
              autoFocus
              value={form.login}
              onChange={(e) => setForm({ ...form, login: e.target.value })}
              disabled={carregando}
            />
            
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="senha"
              label="Senha"
              type="password"
              id="senha"
              autoComplete="current-password"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              disabled={carregando}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={carregando}
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}
