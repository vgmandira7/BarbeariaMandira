import express from "express";
import db from "../database.js";

const router = express.Router();

// criar agendamento
router.post("/", (req, res) => {
  const { nome, telefone, servico, data, horario } = req.body;

  try {
    const stmt = db.prepare(`
      INSERT INTO agendamentos (nome, telefone, servico, data, horario)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(nome, telefone, servico, data, horario);

    res.status(201).json({ id: info.lastInsertRowid, nome, telefone, servico, data, horario });
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT") {
      return res.status(400).json({ error: "Horário já reservado" });
    }
    res.status(500).json({ error: "Erro ao criar agendamento" });
  }
});

// listar todos os agendamentos
router.get("/", (req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM agendamentos ORDER BY data, horario");
    const bookings = stmt.all();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar agendamentos" });
  }
});

export default router;
