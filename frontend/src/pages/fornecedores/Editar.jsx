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

export default function FornecedoresEditar() {
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
        const res = await api.get(`/fornecedores/${id}`);
        const dados = res.data;
        if (dados.for_cpf) dados.for_cpf = aplicarMascaraCPF(dados.for_cpf);
        if (dados.for_cnpj) dados.for_cnpj = aplicarMascaraCNPJ(dados.for_cnpj);
        if (dados.for_cep) dados.for_cep = aplicarMascaraCEP(dados.for_cep);
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
          for_endereco: dados.logradouro || '',
          for_bairro: dados.bairro || '',
          for_cidade: dados.localidade || '',
          for_estado: dados.uf || ''
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
      for_cpf: form.for_tipo === 'F' ? limpaNumeros(form.for_cpf) : null,
      for_cnpj: form.for_tipo === 'J' ? limpaNumeros(form.for_cnpj) : null,
      for_cep: limpaNumeros(form.for_cep),
      for_prazo_entrega_dias: form.for_prazo_entrega_dias ? parseInt(form.for_prazo_entrega_dias) : null
    };

    try {
      await api.put(`/fornecedores/${id}`, dados);
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
      await api.delete(`/fornecedores/${id}`);
      navigate('/fornecedores');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao excluir');
    }
  };

  if (carregando) return <Box sx={{display:'flex', justifyContent:'center', p:4}}><CircularProgress /></Box>;
  const ehPF = form.for_tipo === 'F';
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb:3 }}>
        <Typography variant="h5">Editar Fornecedor</Typography>
        <Box>
          <Button color="error" onClick={excluir} sx={{ mr: 2 }}>Excluir</Button>
          <Button variant="outlined" onClick={() => navigate('/fornecedores')}>Voltar</Button>
        </Box>
      </Box>

      {erro && <Alert severity="error" sx={{mb:2}}>{erro}</Alert>}
      {sucesso && <Alert severity="success" sx={{mb:2}}>Salvo com sucesso!</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth required>
              <InputLabel>Tipo de Pessoa</InputLabel>
              <Select value={form.for_tipo} label="Tipo de Pessoa"
                onChange={(e) => atualizarCampo('for_tipo', e.target.value)}>
                <MenuItem value="F">Pessoa Física</MenuItem>
                <MenuItem value="J">Pessoa Jurídica</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <TextField fullWidth label={ehPF ? "Nome Completo" : "Razão Social"}
              value={form.for_nome_razao}
              onChange={(e) => atualizarCampo('for_nome_razao', e.target.value)} required />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Nome Fantasia"
              value={form.for_nome_fantasia}
              onChange={(e) => atualizarCampo('for_nome_fantasia', e.target.value)} />
          </Grid>

          {ehPF ? (
            <>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="CPF" value={form.for_cpf}
                  onChange={(e) => atualizarCampo('for_cpf', aplicarMascaraCPF(e.target.value))}
                  inputProps={{maxLength:14}} required />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Inscrição Estadual" value={form.for_ie}
                  onChange={(e) => atualizarCampo('for_ie', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Inscrição Municipal" value={form.for_im}
                  onChange={(e) => atualizarCampo('for_im', e.target.value)} />
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="CNPJ" value={form.for_cnpj}
                  onChange={(e) => atualizarCampo('for_cnpj', aplicarMascaraCNPJ(e.target.value))}
                  inputProps={{maxLength:18}} required />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Inscrição Estadual" value={form.for_ie}
                  onChange={(e) => atualizarCampo('for_ie', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Inscrição Municipal" value={form.for_im}
                  onChange={(e) => atualizarCampo('for_im', e.target.value)} />
              </Grid>
            </>
          )}

          <Divider sx={{width:'100%', my:1}} />

          <Grid item xs={12} md={6}>
            <TextField fullWidth type="email" label="E-mail" value={form.for_email}
              onChange={(e) => atualizarCampo('for_email', e.target.value)} required />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Celular" value={form.for_celular}
              onChange={(e) => atualizarCampo('for_celular', e.target.value)} required />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Telefone Fixo" value={form.for_telefone}
              onChange={(e) => atualizarCampo('for_telefone', e.target.value)} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Pessoa de Contato" value={form.for_contato}
              onChange={(e) => atualizarCampo('for_contato', e.target.value)} />
          </Grid>

          <Divider sx={{width:'100%', my:1}} />

          <Grid item xs={12} md={3}>
            <TextField fullWidth label="CEP" value={form.for_cep}
              onChange={(e) => {
                const v = aplicarMascaraCEP(e.target.value);
                atualizarCampo('for_cep', v);
                buscarCep(v);
              }} inputProps={{maxLength:10}} required />
          </Grid>
          <Grid item xs={12} md={7}>
            <TextField fullWidth label="Logradouro" value={form.for_endereco}
              onChange={(e) => atualizarCampo('for_endereco', e.target.value)} required />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth label="Número" value={form.for_numero}
              onChange={(e) => atualizarCampo('for_numero', e.target.value)} required />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Complemento" value={form.for_complemento}
              onChange={(e) => atualizarCampo('for_complemento', e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Bairro" value={form.for_bairro}
              onChange={(e) => atualizarCampo('for_bairro', e.target.value)} required />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Cidade" value={form.for_cidade}
              onChange={(e) => atualizarCampo('for_cidade', e.target.value)} required />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth label="UF" value={form.for_estado}
              onChange={(e) => atualizarCampo('for_estado', e.target.value.toUpperCase())}
              required inputProps={{maxLength:2}} />
          </Grid>

          <Divider sx={{width:'100%', my:1}} />

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select value={form.for_categoria} label="Categoria"
                onChange={(e) => atualizarCampo('for_categoria', e.target.value)}>
                <MenuItem value="">Selecione</MenuItem>
                <MenuItem value="Matéria-prima">Matéria-prima</MenuItem>
                <MenuItem value="Serviços">Serviços</MenuItem>
                <MenuItem value="Equipamentos">Equipamentos</MenuItem>
                <MenuItem value="Transporte">Transporte</MenuItem>
                <MenuItem value="Alimentos">Alimentos</MenuItem>
                <MenuItem value="Outros">Outros</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Condição de Pagamento" value={form.for_condicao_pgto}
              onChange={(e) => atualizarCampo('for_condicao_pgto', e.target.value)}
              placeholder="Ex: 30/60/90 dias" />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth type="number" label="Prazo de Entrega (dias)"
              value={form.for_prazo_entrega_dias || ''}
              onChange={(e) => atualizarCampo('for_prazo_entrega_dias', e.target.value)}
              inputProps={{min:1}} />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{mt:1, mb:1, fontWeight:600}}>
              Dados Bancários / PIX
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Banco" value={form.for_banco}
              onChange={(e) => atualizarCampo('for_banco', e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Agência" value={form.for_agencia}
              onChange={(e) => atualizarCampo('for_agencia', e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Conta" value={form.for_conta}
              onChange={(e) => atualizarCampo('for_conta', e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Chave PIX" value={form.for_chave_pix}
              onChange={(e) => atualizarCampo('for_chave_pix', e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline rows={4} label="Observações"
              value={form.for_observacoes || ''}
              onChange={(e) => atualizarCampo('for_observacoes', e.target.value)} />
          </Grid>

          <Grid item xs={12} sx={{mt:3, display:'flex', gap:2}}>
            <Button type="submit" variant="contained" color="primary" size="large" disabled={salvando}>
              {salvando ? <CircularProgress size={22} color="inherit" /> : 'Salvar'}
            </Button>
            <Button variant="outlined" size="large" onClick={() => navigate('/fornecedores')} disabled={salvando}>
              Cancelar
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
