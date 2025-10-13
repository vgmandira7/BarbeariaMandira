// api/database.js: Conversão para CJS (CommonJS)
const { createClient } = require("@libsql/client");

// Conexão com o Turso
const db = createClient({
  // As variáveis de ambiente serão lidas do Vercel
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

module.exports = db;