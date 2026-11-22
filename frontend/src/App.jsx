import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Páginas
import Login from './pages/Login';
import ClientesListar from './pages/clientes/Listar';
import ClientesCadastrar from './pages/clientes/Cadastrar';
import ClientesEditar from './pages/clientes/Editar';
import FornecedoresListar from './pages/fornecedores/Listar';
import FornecedoresCadastrar from './pages/fornecedores/Cadastrar';
import FornecedoresEditar from './pages/fornecedores/Editar';
import PrivateRoute from './components/PrivateRoute';

const tema = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#388e3c' }
  }
});

export default function App() {
  return (
    <ThemeProvider theme={tema}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Pública */}
          <Route path="/login" element={<Login />} />
          
          {/* Privadas — Clientes */}
          <Route element={<PrivateRoute />}>
            <Route path="/clientes" element={<ClientesListar />} />
            <Route path="/clientes/cadastrar" element={<ClientesCadastrar />} />
            <Route path="/clientes/:id" element={<ClientesEditar />} />
            
            {/* Privadas — Fornecedores */}
            <Route path="/fornecedores" element={<FornecedoresListar />} />
            <Route path="/fornecedores/cadastrar" element={<FornecedoresCadastrar />} />
            <Route path="/fornecedores/:id" element={<FornecedoresEditar />} />
            
            {/* Redireciona */}
            <Route path="/" element={<ClientesListar />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
