import { useNavigate } from 'react-router-dom';
import { Grid, Card, CardContent, Typography, Button, Box } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

export default function Home() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Bem-vindo(a), {usuario?.nome}!
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <PeopleIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>Clientes</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Gerencie o cadastro de clientes
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button variant="outlined" onClick={() => navigate('/clientes')}>
                  Listar
                </Button>
                <Button variant="contained" onClick={() => navigate('/clientes/cadastrar')}>
                  Novo Cliente
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <LocalShippingIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>Fornecedores</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Gerencie o cadastro de fornecedores
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button variant="outlined" onClick={() => navigate('/fornecedores')}>
                  Listar
                </Button>
                <Button variant="contained" color="success" onClick={() => navigate('/fornecedores/cadastrar')}>
                  Novo Fornecedor
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
