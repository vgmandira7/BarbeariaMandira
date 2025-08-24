import Database from "better-sqlite3";

// cria ou abre o banco
const db = new Database("server/barbearia.db");

// cria tabela se não existir
db.prepare(`
  CREATE TABLE IF NOT EXISTS agendamentos (
    codAgendamento INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    telefone TEXT NOT NULL,
    servico TEXT NOT NULL,
    data TEXT NOT NULL,     -- YYYY-MM-DD
    horario TEXT NOT NULL,  -- HH:mm
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE (data, horario)  -- impede dois clientes no mesmo horário
  )
`).run();

export default db;
