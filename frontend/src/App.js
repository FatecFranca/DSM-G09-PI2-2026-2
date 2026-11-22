import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Layout from './components/Layout';
import ClientesCadastrar from './pages/clientes/Cadastrar';
import ClientesListar from './pages/clientes/Listar';
import FornecedoresCadastrar from './pages/fornecedores/Cadastrar';
import FornecedoresListar from './pages/fornecedores/Listar';

// Componente de rota protegida
const RotaPrivada = ({ children, nivelMinimo }) => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  const ordem = { Consulta: 4, Operador: 3, Gerente: 2, Administrador: 1 };
  if (ordem[usuario.nivel] > ordem[nivelMinimo]) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Rota pública */}
        <Route path="/login" element={<Login />} />

        {/* Rotas protegidas */}
        <Route element={
          <RotaPrivada nivelMinimo="Consulta">
            <Layout />
          </RotaPrivada>
        }>
          <Route path="/" element={<Home />} />
          
          {/* Clientes */}
          <Route path="clientes">
            <Route index element={<ClientesListar />} />
            <Route path="cadastrar" element={
              <RotaPrivada nivelMinimo="Operador">
                <ClientesCadastrar />
              </RotaPrivada>
            } />
          </Route>

          {/* Fornecedores */}
          <Route path="fornecedores">
            <Route index element={<FornecedoresListar />} />
            <Route path="cadastrar" element={
              <RotaPrivada nivelMinimo="Operador">
                <FornecedoresCadastrar />
              </RotaPrivada>
            } />
          </Route>
        </Route>

        {/* Rota padrão */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
