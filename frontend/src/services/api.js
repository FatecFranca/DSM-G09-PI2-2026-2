import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api', // URL do backend
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para incluir token nas requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (erro) => Promise.reject(erro)
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    if (erro.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(erro);
  }
);

export default api;
