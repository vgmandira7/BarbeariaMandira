// database.js
import { createClient } from "@libsql/client";
import 'dotenv/config'; // carrega variáveis do .env

// Conexão com o Turso
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

export default db;
