import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import api from '../../services/api';

export default function ClientesListar() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await api.get('/clientes');
        setClientes(res.data);
      } catch (err) {
        setErro(err.response?.data?.erro || 'Erro ao carregar clientes');
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, []);
  const filtrados = clientes.filter(c =>
    c.cli_nome_razao?.toLowerCase().includes(busca.toLowerCase()) ||
    c.cli_email?.toLowerCase().includes(busca.toLowerCase())
  );

  if (carregando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Lista de Clientes</Typography>
        <Button variant="contained" onClick={() => navigate('/clientes/cadastrar')}>
          Novo Cliente
        </Button>
      </Box>

      {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}

      <TextField
        fullWidth
        placeholder="Buscar por nome ou e-mail..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          )
        }}
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Nome / Razão</strong></TableCell>
                <TableCell><strong>Documento</strong></TableCell>
                <TableCell><strong>E-mail</strong></TableCell>
                <TableCell><strong>Celular</strong></TableCell>
                <TableCell align="right"><strong>Ações</strong></TableCell>
              </TableRow>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  Nenhum cliente cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              filtrados.map((cli) => (
                <TableRow key={cli.id}>
                  <TableCell>{cli.cli_nome_razao}</TableCell>
                  <TableCell>
                    {cli.cli_cpf || cli.cli_cnpj || '-'}
                  </TableCell>
                  <TableCell>{cli.cli_email}</TableCell>
                  <TableCell>{cli.cli_celular}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => navigate(`/clientes/${cli.id}`)}>
                      Ver/Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
