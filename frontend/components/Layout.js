import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container,
  Paper
} from '@mui/material';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const sair = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Sistema de Cadastro
          </Typography>
          
          <Button 
            color="inherit" 
            onClick={() => navigate('/')}
            sx={{ opacity: location.pathname === '/' ? 1 : 0.7 }}
          >
            Início
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/clientes')}
            sx={{ opacity: location.pathname.startsWith('/clientes') ? 1 : 0.7 }}
          >
            Clientes
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/fornecedores')}
            sx={{ opacity: location.pathname.startsWith('/fornecedores') ? 1 : 0.7 }}
          >
            Fornecedores
          </Button>
          
          <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              Olá, <strong>{usuario?.nome}</strong> ({usuario?.nivel})
            </Typography>
            <Button color="inherit" onClick={sair}>Sair</Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ mt: 4, mb: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
