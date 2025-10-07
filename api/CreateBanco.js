// createBanco.js
import db from "./database.js";

// cria a tabela no Turso se não existir
export async function criarTabelaAgendamentos() {
  await db.execute(`
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
  `);
}
