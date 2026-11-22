import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  TextField, Button, Typography, Box, Grid, Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Divider
} from '@mui/material';
import api from '../../services/api';

const limpaNumeros = (v) => v.replace(/\D/g, '');
const aplicarMascaraCPF = (v) => {
  v = limpaNumeros(v);
  if (v.length > 11) v = v.slice(0, 11);
  return v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};
const aplicarMascaraCNPJ = (v) => {
  v = limpaNumeros(v);
  if (v.length > 14) v = v.slice(0, 14);
  return v.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};
const aplicarMascaraCEP = (v) => {
  v = limpaNumeros(v);
  if (v.length > 8) v = v.slice(0, 8);
  return v.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
};

export default function ClientesEditar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await api.get(`/clientes/${id}`);
        const dados = res.data;
        // Aplica máscaras ao carregar
        if (dados.cli_cpf) dados.cli_cpf = aplicarMascaraCPF(dados.cli_cpf);
        if (dados.cli_cnpj) dados.cli_cnpj = aplicarMascaraCNPJ(dados.cli_cnpj);
        if (dados.cli_cep) dados.cli_cep = aplicarMascaraCEP(dados.cli_cep);
        setForm(dados);
      } catch (err) {
        setErro(err.response?.data?.erro || 'Erro ao carregar dados');
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [id]);
  const atualizarCampo = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
  };

  const buscarCep = async (cep) => {
    const numeroCep = limpaNumeros(cep);
    if (numeroCep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${numeroCep}/json/`);
      const dados = await res.json();
      if (!dados.erro) {
        setForm(prev => ({
          ...prev,
          cli_endereco: dados.logradouro || '',
          cli_bairro: dados.bairro || '',
          cli_cidade: dados.localidade || '',
          cli_estado: dados.uf || ''
        }));
      }
    } catch (e) { console.error('Erro CEP:', e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso(false);
    setSalvando(true);

    const dados = {
      ...form,
      cli_cpf: form.cli_tipo === 'F' ? limpaNumeros(form.cli_cpf) : null,
      cli_cnpj: form.cli_tipo === 'J' ? limpaNumeros(form.cli_cnpj) : null,
      cli_cep: limpaNumeros(form.cli_cep),
      cli_limite_credito: form.cli_limite_credito ? parseFloat(form.cli_limite_credito) : null
    };

    try {
      await api.put(`/clientes/${id}`, dados);
      setSucesso(true);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao salvar');
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async () => {
    if (!window.confirm('Confirma exclusão?')) return;
    try {
      await api.delete(`/clientes/${id}`);
      navigate('/clientes');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao excluir');
    }
  };

  if (carregando) return <Box sx={{display:'flex', justifyContent:'center', p:4}}><CircularProgress /></Box>;
  const ehPF = form.cli_tipo === 'F';
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb:3 }}>
        <Typography variant="h5">Editar Cliente</Typography>
        <Box>
          <Button color="error" onClick={excluir} sx={{ mr: 2 }}>Excluir</Button>
          <Button variant="outlined" onClick={() => navigate('/clientes')}>Voltar</Button>
        </Box>
      </Box>

      {erro && <Alert severity="error" sx={{mb:2}}>{erro}</Alert>}
      {sucesso && <Alert severity="success" sx={{mb:2}}>Salvo com sucesso!</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth required>
              <InputLabel>Tipo de Pessoa</InputLabel>
              <Select value={form.cli_tipo} label="Tipo de Pessoa"
                onChange={(e) => atualizarCampo('cli_tipo', e.target.value)}>
                <MenuItem value="F">Pessoa Física</MenuItem>
                <MenuItem value="J">Pessoa Jurídica</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <TextField fullWidth label={ehPF ? "Nome Completo" : "Razão Social"}
              value={form.cli_nome_razao}
              onChange={(e) => atualizarCampo('cli_nome_razao', e.target.value)} required />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Nome Fantasia"
              value={form.cli_nome_fantasia}
              onChange={(e) => atualizarCampo('cli_nome_fantasia', e.target.value)} />
          </Grid>

          {ehPF ? (
            <>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="CPF" value={form.cli_cpf}
                  onChange={(e) => atualizarCampo('cli_cpf', aplicarMascaraCPF(e.target.value))}
                  inputProps={{maxLength:14}} required />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="RG" value={form.cli_rg}
                  onChange={(e) => atualizarCampo('cli_rg', e.target.value)} />
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="CNPJ" value={form.cli_cnpj}
                  onChange={(e) => atualizarCampo('cli_cnpj', aplicarMascaraCNPJ(e.target.value))}
                  inputProps={{maxLength:18}} required />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="IE" value={form.cli_ie}
                  onChange={(e) => atualizarCampo('cli_ie', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="IM" value={form.cli_im}
                  onChange={(e) => atualizarCampo('cli_im', e.target.value)} />
              </Grid>
            </>
          )}

          <Divider sx={{width:'100%', my:1}} />

          <Grid item xs={12} md={6}>
            <TextField fullWidth type="email" label="E-mail" value={form.cli_email}
              onChange={(e) => atualizarCampo('cli_email', e.target.value)} required />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Celular" value={form.cli_celular}
              onChange={(e) => atualizarCampo('cli_celular', e.target.value)} required />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Telefone" value={form.cli_telefone}
              onChange={(e) => atualizarCampo('cli_telefone', e.target.value)} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Contato" value={form.cli_contato}
              onChange={(e) => atualizarCampo('cli_contato', e.target.value)} />
          </Grid>

          <Divider sx={{width:'100%', my:1}} />

          <Grid item xs={12} md={3}>
            <TextField fullWidth label="CEP" value={form.cli_cep}
              onChange={(e) => {
                const v = aplicarMascaraCEP(e.target.value);
                atualizarCampo('cli_cep', v);
                buscarCep(v);
              }} inputProps={{maxLength:10}} required />
          </Grid>
          <Grid item xs={12} md={7}>
            <TextField fullWidth label="Logradouro" value={form.cli_endereco}
              onChange={(e) => atualizarCampo('cli_endereco', e.target.value)} required />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth label="Número" value={form.cli_numero}
              onChange={(e) => atualizarCampo('cli_numero', e.target.value)} required />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Complemento" value={form.cli_complemento}
              onChange={(e) => atualizarCampo('cli_complemento', e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Bairro" value={form.cli_bairro}
              onChange={(e) => atualizarCampo('cli_bairro', e.target.value)} required />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Cidade" value={form.cli_cidade}
              onChange={(e) => atualizarCampo('cli_cidade', e.target.value)} required />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth label="UF" value={form.cli_estado}
              onChange={(e) => atualizarCampo('cli_estado', e.target.value.toUpperCase())}
              required
              inputProps={{ maxLength: 2 }}
            />
          </Grid>

          <Divider sx={{ width: '100%', my: 1 }} />

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Limite de Crédito (R$)"
              value={form.cli_limite_credito || ''}
              onChange={(e) => atualizarCampo('cli_limite_credito', e.target.value)}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Observações"
              value={form.cli_observacoes || ''}
              onChange={(e) => atualizarCampo('cli_observacoes', e.target.value)}
            />
          </Grid>

          {/* Botões de Ação */}
          <Grid item xs={12} sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={salvando}
            >
              {salvando ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                'Salvar Alterações'
              )}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/clientes')}
              disabled={salvando}
            >
              Cancelar
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
