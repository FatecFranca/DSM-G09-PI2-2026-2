// Em vez de: const mysql = require("mysql2");
const mysql = require("mysql2/promise"); // ← com suporte a async/await

require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,      // até 10 conexões simultâneas
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Testar conexão
const testarConexao = async () => {
  try {
    const conexao = await pool.getConnection();
    console.log("✅ Conexão com o banco estabelecida com sucesso!");
    conexao.release();
  } catch (err) {
    console.error("❌ Erro ao conectar:", err.message);
    process.exit(1);
  }
};

testarConexao();

module.exports = pool;
