-- ==================================================
-- SISTEMA DE GESTÃO — BANCO DE DADOS COMPLETO
-- Versão: 2.0 | Atualizado: 05/11/2026
-- ==================================================

-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS sis_pi 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

USE sis_pi;

-- ==================================================
-- TABELA: NÍVEIS DE ACESSO
-- ==================================================
CREATE TABLE IF NOT EXISTS niveis_acesso (
  nivel_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Chave única do nível',
  nivel_nome VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nome do nível de acesso',
  nivel_descricao VARCHAR(255) NULL COMMENT 'Descrição das permissões',
  ordem TINYINT NOT NULL COMMENT 'Hierarquia: menor = mais permissões'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'Níveis de permissão do sistema';

-- Níveis padrão
INSERT INTO niveis_acesso (nivel_nome, nivel_descricao, ordem) VALUES
('Administrador', 'Acesso total ao sistema', 1),
('Gerente', 'Gestão operacional e relatórios', 2),
('Operador', 'Cadastro e consulta de dados', 3),
('Consulta', 'Apenas visualização', 4);

-- ==================================================
-- TABELA: USUÁRIOS
-- ==================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Chave única do usuário',
  nome VARCHAR(100) NOT NULL COMMENT 'Nome completo',
  email VARCHAR(255) NOT NULL UNIQUE COMMENT 'E-mail utilizado para login',
  senha VARCHAR(255) NOT NULL COMMENT 'Senha criptografada (bcrypt)',
  nivel_id INT NULL COMMENT 'Vínculo com o nível de acesso',
  usu_ativo CHAR(1) DEFAULT 'S' COMMENT 'S=Ativo / N=Inativo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de cadastro',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última alteração',
  ultimo_acesso DATETIME NULL COMMENT 'Data e hora do último login',
  cadastrado_por INT NULL COMMENT 'Usuário que criou este registro',
  alterado_por INT NULL COMMENT 'Último usuário que alterou',
  
  FOREIGN KEY (nivel_id) REFERENCES niveis_acesso(nivel_id) ON DELETE SET NULL,
  FOREIGN KEY (cadastrado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (alterado_por) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'Cadastro de usuários do sistema';

-- Índices para performance
CREATE INDEX idx_usu_email ON usuarios(email);
CREATE INDEX idx_usu_ativo ON usuarios(usu_ativo);
CREATE INDEX idx_usu_nivel ON usuarios(nivel_id);

-- ==================================================
-- TABELA: CLIENTES
-- ==================================================
CREATE TABLE IF NOT EXISTS clientes (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Chave única do cliente',
  cli_tipo ENUM('F','J') NOT NULL COMMENT 'F=Física / J=Jurídica',
  cli_nome_razao VARCHAR(255) NOT NULL COMMENT 'Nome ou Razão Social',
  cli_nome_fantasia VARCHAR(255) NULL COMMENT 'Nome Fantasia',
  cli_cpf VARCHAR(14) NULL COMMENT 'CPF',
  cli_cnpj VARCHAR(18) NULL COMMENT 'CNPJ',
  cli_rg VARCHAR(20) NULL COMMENT 'RG',
  cli_ie VARCHAR(50) NULL COMMENT 'Inscrição Estadual',
  cli_im VARCHAR(50) NULL COMMENT 'Inscrição Municipal',
  cli_email VARCHAR(255) NOT NULL COMMENT 'E-mail',
  cli_telefone VARCHAR(20) NULL COMMENT 'Telefone fixo',
  cli_celular VARCHAR(20) NOT NULL COMMENT 'Celular',
  cli_contato VARCHAR(100) NULL COMMENT 'Pessoa de contato',
  cli_endereco VARCHAR(255) NOT NULL COMMENT 'Logradouro',
  cli_numero VARCHAR(20) NOT NULL COMMENT 'Número',
  cli_complemento VARCHAR(100) NULL COMMENT 'Complemento',
  cli_bairro VARCHAR(100) NOT NULL COMMENT 'Bairro',
  cli_cidade VARCHAR(100) NOT NULL COMMENT 'Cidade',
  cli_estado CHAR(2) NOT NULL COMMENT 'UF',
  cli_cep VARCHAR(10) NOT NULL COMMENT 'CEP',
  cli_limite_credito DECIMAL(12,2) NULL COMMENT 'Limite de crédito',
  cli_observacoes TEXT NULL COMMENT 'Observações gerais',
  
  -- Campos de auditoria
  cadastrado_por INT NULL COMMENT 'Usuário que cadastrou',
  alterado_por INT NULL COMMENT 'Último que alterou',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de cadastro',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última alteração',
  
  FOREIGN KEY (cadastrado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (alterado_por) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'Cadastro de clientes';

-- Índices
CREATE INDEX idx_clientes_nome ON clientes(cli_nome_razao);
CREATE INDEX idx_clientes_email ON clientes(cli_email);
CREATE INDEX idx_clientes_cidade ON clientes(cli_cidade);

-- ==================================================
-- TABELA: FORNECEDORES
-- ==================================================
CREATE TABLE IF NOT EXISTS fornecedores (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Chave única do fornecedor',
  for_tipo ENUM('F','J') NOT NULL COMMENT 'F=Física / J=Jurídica',
  for_nome_razao VARCHAR(255) NOT NULL COMMENT 'Nome ou Razão Social',
  for_nome_fantasia VARCHAR(255) NULL COMMENT 'Nome Fantasia',
  for_cpf VARCHAR(14) NULL COMMENT 'CPF',
  for_cnpj VARCHAR(18) NULL COMMENT 'CNPJ',
  for_ie VARCHAR(50) NULL COMMENT 'Inscrição Estadual',
  for_im VARCHAR(50) NULL COMMENT 'Inscrição Municipal',
  for_email VARCHAR(255) NOT NULL COMMENT 'E-mail',
  for_telefone VARCHAR(20) NULL COMMENT 'Telefone fixo',
  for_celular VARCHAR(20) NOT NULL COMMENT 'Celular',
  for_contato VARCHAR(100) NULL COMMENT 'Pessoa de contato',
  for_endereco VARCHAR(255) NOT NULL COMMENT 'Logradouro',
  for_numero VARCHAR(20) NOT NULL COMMENT 'Número',
  for_complemento VARCHAR(100) NULL COMMENT 'Complemento',
  for_bairro VARCHAR(100) NOT NULL COMMENT 'Bairro',
  for_cidade VARCHAR(100) NOT NULL COMMENT 'Cidade',
  for_estado CHAR(2) NOT NULL COMMENT 'UF',
  for_cep VARCHAR(10) NOT NULL COMMENT 'CEP',
  for_categoria VARCHAR(50) NULL COMMENT 'Categoria do fornecedor',
  for_condicao_pgto VARCHAR(100) NULL COMMENT 'Condição de pagamento',
  for_prazo_entrega_dias INT NULL COMMENT 'Prazo de entrega em dias',
  for_banco VARCHAR(100) NULL COMMENT 'Banco',
  for_agencia VARCHAR(20) NULL COMMENT 'Agência',
  for_conta VARCHAR(30) NULL COMMENT 'Conta corrente',
  for_chave_pix VARCHAR(255) NULL COMMENT 'Chave PIX',
  for_observacoes TEXT NULL COMMENT 'Observações gerais',
  
  -- Campos de auditoria
  cadastrado_por INT NULL COMMENT 'Usuário que cadastrou',
  alterado_por INT NULL COMMENT 'Último que alterou',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de cadastro',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última alteração',
  
  FOREIGN KEY (cadastrado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (alterado_por) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'Cadastro de fornecedores';

-- Índices
CREATE INDEX idx_fornecedores_nome ON fornecedores(for_nome_razao);
CREATE INDEX idx_fornecedores_email ON fornecedores(for_email);
CREATE INDEX idx_fornecedores_cidade ON fornecedores(for_cidade);

-- ==================================================
-- USUÁRIO PADRÃO DE ACESSO
-- ==================================================
-- Senha padrão: 123456 (gerar hash com bcrypt antes de inserir)
-- Comando para gerar: node -e "console.log(require('bcryptjs').hashSync('123456', 10))"
INSERT INTO usuarios (nome, email, senha, nivel_id, usu_ativo) VALUES
(
  'Administrador',
  'admin@sistema.com',
  '$2a$10$EixZaYb4xU58Gpq1R0yWbeb00LU5qUaK6xqU7VqH0n1bY2vWdX7aG',
  1,
  'S'
) ON DUPLICATE KEY UPDATE email = email;
