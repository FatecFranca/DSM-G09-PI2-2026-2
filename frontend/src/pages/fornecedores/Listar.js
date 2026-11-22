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

export default function FornecedoresListar() {
  const navigate = useNavigate();
  const [fornecedores, setFornecedores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await api.get('/fornecedores');
        setFornecedores(res.data);
      } catch (err) {
        setErro(err.response?.data?.erro || 'Erro ao carregar fornecedores');
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, []);
  const filtrados = fornecedores.filter(f =>
    f.for_nome_razao?.toLowerCase().includes(busca.toLowerCase()) ||
    f.for_email?.toLowerCase().includes(busca.toLowerCase()) ||
    f.for_categoria?.toLowerCase().includes(busca.toLowerCase())
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
        <Typography variant="h5">Lista de Fornecedores</Typography>
        <Button variant="contained" color="success" onClick={() => navigate('/fornecedores/cadastrar')}>
          Novo Fornecedor
        </Button>
      </Box>

      {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}

      <TextField
        fullWidth
        placeholder="Buscar por nome, e-mail ou categoria..."
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
                <TableCell><strong>Categoria</strong></TableCell>
                <TableCell><strong>E-mail</strong></TableCell>
                <TableCell align="right"><strong>Ações</strong></TableCell>
              </TableRow>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  Nenhum fornecedor cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              filtrados.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{f.for_nome_razao}</TableCell>
                  <TableCell>{f.for_cpf || f.for_cnpj || '-'}</TableCell>
                  <TableCell>{f.for_categoria || '-'}</TableCell>
                  <TableCell>{f.for_email}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => navigate(`/fornecedores/${f.id}`)}>
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
