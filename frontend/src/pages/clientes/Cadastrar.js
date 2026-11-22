import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import api from '../../services/api';

// Funções utilitárias
const limpaNumeros = (v) => v.replace(/\D/g, '');
const aplicarMascaraCPF = (v) => {
  v = limpaNumeros(v);
  if (v.length > 11) v = v.slice(0, 11);
  return v.replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};
const aplicarMascaraCNPJ = (v) => {
  v = limpaNumeros(v);
  if (v.length > 14) v = v.slice(0, 14);
  return v.replace(/(\d{2})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1/$2')
          .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};
const aplicarMascaraCEP = (v) => {
  v = limpaNumeros(v);
  if (v.length > 8) v = v.slice(0, 8);
  return v.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
};

export default function ClientesCadastrar() {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  
  const [form, setForm] = useState({
    cli_tipo: '',
    cli_nome_razao: '',
    cli_nome_fantasia: '',
    cli_cpf: '',
    cli_rg: '',
    cli_cnpj: '',
    cli_ie: '',
    cli_im: '',
    cli_email: '',
    cli_telefone: '',
    cli_celular: '',
    cli_contato: '',
    cli_endereco: '',
    cli_numero: '',
    cli_complemento: '',
    cli_bairro: '',
    cli_cidade: '',
    cli_estado: '',
    cli_cep: '',
    cli_limite_credito: '',
    cli_observacoes: ''
  });

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
    } catch (e) {
      console.error('Erro ao buscar CEP:', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso(false);
    setCarregando(true);

    const dados = {
      ...form,
      cli_cpf: form.cli_tipo === 'F' ? limpaNumeros(form.cli_cpf) : null,
      cli_cnpj: form.cli_tipo === 'J' ? limpaNumeros(form.cli_cnpj) : null,
      cli_cep: limpaNumeros(form.cli_cep),
      cli_limite_credito: form.cli_limite_credito ? parseFloat(form.cli_limite_credito) : null
    };

    try {
      await api.post('/clientes', dados);
      setSucesso(true);
      setForm({
        cli_tipo: '',
        cli_nome_razao: '',
        cli_nome_fantasia: '',
        cli_cpf: '',
        cli_rg: '',
        cli_cnpj: '',
        cli_ie: '',
        cli_im: '',
        cli_email: '',
        cli_telefone: '',
        cli_celular: '',
        cli_contato: '',
        cli_endereco: '',
        cli_numero: '',
        cli_complemento: '',
        cli_bairro: '',
        cli_cidade: '',
        cli_estado: '',
        cli_cep: '',
        cli_limite_credito: '',
        cli_observacoes: ''
      });
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao cadastrar cliente');
    } finally {
      setCarregando(false);
    }
  };

  const ehPF = form.cli_tipo === 'F';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Cadastrar Cliente</Typography>
        <Button variant="outlined" onClick={() => navigate('/clientes')}>
          Voltar
        </Button>
      </Box>

      {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}
      {sucesso && <Alert severity="success" sx={{ mb: 2 }}>Cliente cadastrado com sucesso!</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Tipo de Pessoa */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth required>
              <InputLabel>Tipo de Pessoa</InputLabel>
              <Select
                value={form.cli_tipo}
                label="Tipo de Pessoa"
                onChange={(e) => atualizarCampo('cli_tipo', e.target.value)}
                required
              >
                <MenuItem value="F">Pessoa Física</MenuItem>
                <MenuItem value="J">Pessoa Jurídica</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Nome / Razão Social */}
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label={ehPF ? "Nome Completo" : "Razão Social"}
              value={form.cli_nome_razao}
              onChange={(e) => atualizarCampo('cli_nome_razao', e.target.value)}
              required
            />
          </Grid>

          {/* Nome Fantasia */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nome Fantasia"
              value={form.cli_nome_fantasia}
              onChange={(e) => atualizarCampo('cli_nome_fantasia', e.target.value)}
            />
          </Grid>

          {/* CPF + RG (PF) ou CNPJ + IE/IM (PJ) */}
          {ehPF ? (
            <>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="CPF"
                  value={form.cli_cpf}
                  onChange={(e) => atualizarCampo('cli_cpf', aplicarMascaraCPF(e.target.value))}
                  required
                  inputProps={{ maxLength: 14 }}
                  placeholder="000.000.000-00"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="RG"
                  value={form.cli_rg}
                  onChange={(e) => atualizarCampo('cli_rg', e.target.value)}
                  placeholder="Apenas para Pessoa Física"
                />
              </Grid>
              <Grid item xs={12} md={4}></Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="CNPJ"
                  value={form.cli_cnpj}
                  onChange={(e) => atualizarCampo('cli_cnpj', aplicarMascaraCNPJ(e.target.value))}
                  required
                  inputProps={{ maxLength: 18 }}
                  placeholder="00.000.000/0000-00"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Inscrição Estadual"
                  value={form.cli_ie}
                  onChange={(e) => atualizarCampo('cli_ie', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Inscrição Municipal"
                  value={form.cli_im}
                  onChange={(e) => atualizarCampo('cli_im', e.target.value)}
                />
              </Grid>
            </>
          )}

          <Divider sx={{ width: '100%', my: 1 }} />

          {/* Contato */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="email"
              label="E-mail"
              value={form.cli_email}
              onChange={(e) => atualizarCampo('cli_email', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Celular"
              value={form.cli_celular}
              onChange={(e) => atualizarCampo('cli_celular', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Telefone Fixo"
              value={form.cli_telefone}
              onChange={(e) => atualizarCampo('cli_telefone', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Pessoa de Contato"
              value={form.cli_contato}
              onChange={(e) => atualizarCampo('cli_contato', e.target.value)}
              placeholder="Responsável"
            />
          </Grid>

          <Divider sx={{ width: '100%', my: 1 }} />

          {/* Endereço — ViaCEP */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="CEP"
              value={form.cli_cep}
              onChange={(e) => {
                const valor = aplicarMascaraCEP(e.target.value);
                atualizarCampo('cli_cep', valor);
                buscarCep(valor);
              }}
              required
              inputProps={{ maxLength: 10 }}
              placeholder="00000-000"
            />
          </Grid>
          <Grid item xs={12} md={7}>
            <TextField
              fullWidth
              label="Logradouro"
              value={form.cli_endereco}
              onChange={(e) => atualizarCampo('cli_endereco', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Número"
              value={form.cli_numero}
              onChange={(e) => atualizarCampo('cli_numero', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Complemento"
              value={form.cli_complemento}
              onChange={(e) => atualizarCampo('cli_complemento', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Bairro"
              value={form.cli_bairro}
              onChange={(e) => atualizarCampo('cli_bairro', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Cidade"
              value={form.cli_cidade}
              onChange={(e) => atualizarCampo('cli_cidade', e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="UF"
              value={form.cli_estado}
              onChange={(e) => atualizarCampo('cli_estado', e.target.value.toUpperCase())}
              required
              inputProps={{ maxLength: 2 }}
            />
          </Grid>

          <Divider sx={{ width: '100%', my: 1 }} />

          {/* Dados Exclusivos de Cliente */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              step="0.01"
              label="Limite de Crédito (R$)"
              value={form.cli_limite_credito}
              onChange={(e) => atualizarCampo('cli_limite_credito', e.target.value)}
              placeholder="0,00"
            />
          </Grid>
          <Grid item xs={12}></Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Observações"
              value={form.cli_observacoes}
              onChange={(e) => atualizarCampo('cli_observacoes', e.target.value)}
              placeholder="Informações adicionais..."
            />
          </Grid>

          {/* Botões */}
          <Grid item xs={12} sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={carregando}
            >
              {carregando ? <CircularProgress size={22} color="inherit" /> : 'Salvar Cliente'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/clientes')}
              disabled={carregando}
            >
              Cancelar
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
