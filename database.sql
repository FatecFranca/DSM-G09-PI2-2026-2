-- ==================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS — SIS_PI
-- Sistema de Gestão Integrada
-- Versão: 1.0 | Data: 07/11/2026
-- ==================================================

CREATE DATABASE IF NOT EXISTS `sis_pi` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `sis_pi`;

-- ==================================================
-- TABELA: niveis_acesso
-- ==================================================
DROP TABLE IF EXISTS `niveis_acesso`;
CREATE TABLE `niveis_acesso` (
  `nivel_id` INT NOT NULL AUTO_INCREMENT COMMENT 'Chave única do nível',
  `nivel_nome` VARCHAR(50) NOT NULL COMMENT 'Nome do nível de acesso',
  `nivel_descricao` VARCHAR(255) DEFAULT NULL COMMENT 'Descrição das permissões',
  `ordem` TINYINT NOT NULL COMMENT 'Hierarquia: menor = mais permissões',
  PRIMARY KEY (`nivel_id`),
  UNIQUE KEY `nivel_nome` (`nivel_nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Níveis de permissão do sistema';

INSERT INTO `niveis_acesso` VALUES
(1, 'Administrador', 'Acesso total ao sistema', 1),
(2, 'Gerente', 'Gestão operacional e relatórios', 2),
(3, 'Operador', 'Cadastro e consulta de dados', 3),
(4, 'Consulta', 'Apenas visualização', 4);

-- ==================================================
-- TABELA: usuarios
-- ==================================================
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'Chave única do usuário',
  `nome` VARCHAR(100) NOT NULL COMMENT 'Nome completo',
  `email` VARCHAR(255) NOT NULL COMMENT 'E-mail utilizado para login',
  `senha` VARCHAR(255) NOT NULL COMMENT 'Senha criptografada (bcrypt)',
  `nivel_id` INT DEFAULT NULL COMMENT 'Vínculo com o nível de acesso',
  `usu_ativo` CHAR(1) DEFAULT 'S' COMMENT 'S=Ativo / N=Inativo',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de cadastro',
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última alteração',
  `ultimo_acesso` DATETIME DEFAULT NULL COMMENT 'Data e hora do último login',
  `cadastrado_por` INT DEFAULT NULL COMMENT 'Usuário que criou este registro',
  `alterado_por` INT DEFAULT NULL COMMENT 'Último usuário que alterou',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `cadastrado_por` (`cadastrado_por`),
  KEY `alterado_por` (`alterado_por`),
  KEY `idx_usu_email` (`email`),
  KEY `idx_usu_ativo` (`usu_ativo`),
  KEY `idx_usu_nivel` (`nivel_id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`nivel_id`) REFERENCES `niveis_acesso` (`nivel_id`) ON DELETE SET NULL,
  CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`cadastrado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `usuarios_ibfk_3` FOREIGN KEY (`alterado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Cadastro de usuários do sistema';

-- ==================================================
-- TABELA: user_tokens
-- ==================================================
DROP TABLE IF EXISTS `user_tokens`;
CREATE TABLE `user_tokens` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_id` INT NOT NULL,
  `refresh_token` TEXT COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `user_tokens_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================================================
-- TABELA: clientes
-- ==================================================
DROP TABLE IF EXISTS `clientes`;
CREATE TABLE `clientes` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'Chave única do cliente',
  `cli_tipo` ENUM('F','J') NOT NULL COMMENT 'F=Física / J=Jurídica',
  `cli_nome_razao` VARCHAR(255) NOT NULL COMMENT 'Nome ou Razão Social',
  `cli_nome_fantasia` VARCHAR(255) DEFAULT NULL COMMENT 'Nome Fantasia',
  `cli_cpf` VARCHAR(14) DEFAULT NULL COMMENT 'CPF',
  `cli_cnpj` VARCHAR(18) DEFAULT NULL COMMENT 'CNPJ',
  `cli_rg` VARCHAR(20) DEFAULT NULL COMMENT 'RG',
  `cli_ie` VARCHAR(50) DEFAULT NULL COMMENT 'Inscrição Estadual',
  `cli_im` VARCHAR(50) DEFAULT NULL COMMENT 'Inscrição Municipal',
  `cli_email` VARCHAR(255) NOT NULL COMMENT 'E-mail',
  `cli_telefone` VARCHAR(20) DEFAULT NULL COMMENT 'Telefone fixo',
  `cli_celular` VARCHAR(20) NOT NULL COMMENT 'Celular',
  `cli_contato` VARCHAR(100) DEFAULT NULL COMMENT 'Pessoa de contato',
  `cli_endereco` VARCHAR(255) NOT NULL COMMENT 'Logradouro',
  `cli_numero` VARCHAR(20) NOT NULL COMMENT 'Número',
  `cli_complemento` VARCHAR(100) DEFAULT NULL COMMENT 'Complemento',
  `cli_bairro` VARCHAR(100) NOT NULL COMMENT 'Bairro',
  `cli_cidade` VARCHAR(100) NOT NULL COMMENT 'Cidade',
  `cli_estado` CHAR(2) NOT NULL COMMENT 'UF',
  `cli_cep` VARCHAR(10) NOT NULL COMMENT 'CEP',
  `cli_limite_credito` DECIMAL(12,2) DEFAULT NULL COMMENT 'Limite de crédito',
  `cli_observacoes` TEXT COMMENT 'Observações gerais',
  `cadastrado_por` INT DEFAULT NULL COMMENT 'Usuário que cadastrou',
  `alterado_por` INT DEFAULT NULL COMMENT 'Último que alterou',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de cadastro',
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última alteração',
  PRIMARY KEY (`id`),
  KEY `cadastrado_por` (`cadastrado_por`),
  KEY `alterado_por` (`alterado_por`),
  KEY `idx_clientes_nome` (`cli_nome_razao`),
  KEY `idx_clientes_email` (`cli_email`),
  KEY `idx_clientes_cidade` (`cli_cidade`),
  CONSTRAINT `clientes_ibfk_1` FOREIGN KEY (`cadastrado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `clientes_ibfk_2` FOREIGN KEY (`alterado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Cadastro de clientes';

-- ==================================================
-- TABELA: fornecedores
-- ==================================================
DROP TABLE IF EXISTS `fornecedores`;
CREATE TABLE `fornecedores` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT 'Chave única do fornecedor',
  `for_tipo` ENUM('F','J') NOT NULL COMMENT 'F=Física / J=Jurídica',
  `for_nome_razao` VARCHAR(255) NOT NULL COMMENT 'Nome ou Razão Social',
  `for_nome_fantasia` VARCHAR(255) DEFAULT NULL COMMENT 'Nome Fantasia',
  `for_cpf` VARCHAR(14) DEFAULT NULL COMMENT 'CPF',
  `for_rg` VARCHAR(20) DEFAULT NULL,
  `for_cnpj` VARCHAR(18) DEFAULT NULL COMMENT 'CNPJ',
  `for_ie` VARCHAR(50) DEFAULT NULL COMMENT 'Inscrição Estadual',
  `for_im` VARCHAR(50) DEFAULT NULL COMMENT 'Inscrição Municipal',
  `for_email` VARCHAR(255) NOT NULL COMMENT 'E-mail',
  `for_telefone` VARCHAR(20) DEFAULT NULL COMMENT 'Telefone fixo',
  `for_celular` VARCHAR(20) NOT NULL COMMENT 'Celular',
  `for_contato` VARCHAR(100) DEFAULT NULL COMMENT 'Pessoa de contato',
  `for_endereco` VARCHAR(255) NOT NULL COMMENT 'Logradouro',
  `for_numero` VARCHAR(20) NOT NULL COMMENT 'Número',
  `for_complemento` VARCHAR(100) DEFAULT NULL COMMENT 'Complemento',
  `for_bairro` VARCHAR(100) NOT NULL COMMENT 'Bairro',
  `for_cidade` VARCHAR(100) NOT NULL COMMENT 'Cidade',
  `for_estado` CHAR(2) NOT NULL COMMENT 'UF',
  `for_cep` VARCHAR(10) NOT NULL COMMENT 'CEP',
  `for_categoria` VARCHAR(50) DEFAULT NULL COMMENT 'Categoria do fornecedor',
  `for_condicao_pgto` VARCHAR(100) DEFAULT NULL COMMENT 'Condição de pagamento',
  `for_prazo_entrega_dias` INT DEFAULT NULL COMMENT 'Prazo de entrega em dias',
  `for_banco` VARCHAR(100) DEFAULT NULL COMMENT 'Banco',
  `for_agencia` VARCHAR(20) DEFAULT NULL COMMENT 'Agência',
  `for_conta` VARCHAR(30) DEFAULT NULL COMMENT 'Conta corrente',
  `for_chave_pix` VARCHAR(255) DEFAULT NULL COMMENT 'Chave PIX',
  `for_observacoes` TEXT COMMENT 'Observações gerais',
  `cadastrado_por` INT DEFAULT NULL COMMENT 'Usuário que cadastrou',
  `alterado_por` INT DEFAULT NULL COMMENT 'Último que alterou',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de cadastro',
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última alteração',
  PRIMARY KEY (`id`),
  KEY `cadastrado_por` (`cadastrado_por`),
  KEY `alterado_por` (`alterado_por`),
  KEY `idx_fornecedores_nome` (`for_nome_razao`),
  KEY `idx_fornecedores_email` (`for_email`),
  KEY `idx_fornecedores_cidade` (`for_cidade`),
  CONSTRAINT `fornecedores_ibfk_1` FOREIGN KEY (`cadastrado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fornecedores_ibfk_2` FOREIGN KEY (`alterado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Cadastro de fornecedores';

-- ==================================================
-- TABELA: materiais
-- ==================================================
DROP TABLE IF EXISTS `materiais`;
CREATE TABLE `materiais` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `unidade` VARCHAR(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preco_unitario` DECIMAL(10,2) DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================================================
-- TABELA: status_orcamentos
-- ==================================================
DROP TABLE IF EXISTS `status_orcamentos`;
CREATE TABLE `status_orcamentos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `status_orcamentos` VALUES
(1, 'Pendente'),
(2, 'Concluído'),
(3, 'Cancelado'),
(4, 'Aprovado'),
(5, 'Aguardando');

-- ==================================================
-- TABELA: orcamentos
-- ==================================================
DROP TABLE IF EXISTS `orcamentos`;
CREATE TABLE `orcamentos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `descricao` VARCHAR(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo` ENUM('rede_eletrica','cabeamento_estruturado') COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor_total` DECIMAL(10,2) DEFAULT NULL,
  `data` DATE DEFAULT NULL,
  `cliente_id` INT DEFAULT NULL,
  `status_id` INT DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cliente_id` (`cliente_id`),
  KEY `status_id` (`status_id`),
  CONSTRAINT `orcamentos_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `orcamentos_ibfk_2` FOREIGN KEY (`status_id`) REFERENCES `status_orcamentos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================================================
-- TABELA: orcamento_itens
-- ==================================================
DROP TABLE IF EXISTS `orcamento_itens`;
CREATE TABLE `orcamento_itens` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `orcamento_id` INT DEFAULT NULL,
  `material_id` INT DEFAULT NULL,
  `quantidade` DECIMAL(10,2) DEFAULT NULL,
  `subtotal` DECIMAL(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_orcamento_material` (`orcamento_id`,`material_id`),
  KEY `material_id` (`material_id`),
  CONSTRAINT `orcamento_itens_ibfk_1` FOREIGN KEY (`orcamento_id`) REFERENCES `orcamentos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orcamento_itens_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `materiais` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================================================
-- TABELA: status_projetos
-- ==================================================
DROP TABLE IF EXISTS `status_projetos`;
CREATE TABLE `status_projetos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `status_projetos` VALUES
(1, 'Planejamento'),
(2, 'Em Execução'),
(3, 'Concluído'),
(4, 'Suspenso'),
(5, 'Cancelado');

-- ==================================================
-- TABELA: projetos
-- ==================================================
DROP TABLE IF EXISTS `projetos`;
CREATE TABLE `projetos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo` ENUM('rede_eletrica','cabeamento_estruturado','iot','manutencao','ampliacao','nova_instalacao') COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_inicio` DATE DEFAULT NULL,
  `data_fim` DATE DEFAULT NULL,
  `cliente_id` INT DEFAULT NULL,
  `status_id` INT DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cliente_id` (`cliente_id`),
  KEY `status_id` (`status_id`),
  CONSTRAINT `projetos_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `projetos_ibfk_2` FOREIGN KEY (`status_id`) REFERENCES `status_projetos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================================================
-- TABELA: projeto_orcamentos
-- ==================================================
DROP TABLE IF EXISTS `projeto_orcamentos`;
CREATE TABLE `projeto_orcamentos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `projeto_id` INT DEFAULT NULL,
  `orcamento_id` INT DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_projeto_orcamento` (`projeto_id`,`orcamento_id`),
  KEY `orcamento_id` (`orcamento_id`),
  CONSTRAINT `projeto_orcamentos_ibfk_1` FOREIGN KEY (`projeto_id`) REFERENCES `projetos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `projeto_orcamentos_ibfk_2` FOREIGN KEY (`orcamento_id`) REFERENCES `orcamentos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================================================
-- USUÁRIO PADRÃO DE ACESSO
-- ==================================================
-- Senha padrão: 123456
-- Hash gerado com: node -e "console.log(require('bcryptjs').hashSync('123456', 10))"
INSERT INTO `usuarios` (`nome`, `email`, `senha`, `nivel_id`, `usu_ativo`) VALUES
(
  'Administrador',
  'admin@sistema.com',
  '$2a$10$EixZaYb4xU58Gpq1R0yWbeb00LU5qUaK6xqU7VqH0n1bY2vWdX7aG',
  1,
  'S'
) 
ON DUPLICATE KEY UPDATE email = email;