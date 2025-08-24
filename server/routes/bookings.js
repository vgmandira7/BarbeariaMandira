import express from "express";
import db from "../database.js";
import { format, startOfWeek, endOfWeek } from "date-fns";

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

    res.status(201).json({ 
      id: info.lastInsertRowid, 
      nome, 
      telefone, 
      servico, 
      data, 
      horario 
    });
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

// buscar agendamentos por data específica
router.get("/data/:data", (req, res) => {
  const { data } = req.params;
  try {
    const stmt = db.prepare("SELECT * FROM agendamentos WHERE date(data) = date(?) ORDER BY horario");
    const bookings = stmt.all(data);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar agendamentos da data" });
  }
});

// 📊 estatísticas para o painel do barbeiro
router.get("/stats", (req, res) => {
  try {
    const hoje = format(new Date(), "yyyy-MM-dd");
    const inicioSemana = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const fimSemana = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

    // total de hoje
    const stmtHoje = db.prepare("SELECT COUNT(*) as total FROM agendamentos WHERE date(data) = date(?)");
    const hojeCount = stmtHoje.get(hoje).total;

    // total da semana
    const stmtSemana = db.prepare(`
      SELECT COUNT(*) as total 
      FROM agendamentos 
      WHERE date(data) BETWEEN date(?) AND date(?) 
    `);
    const semanaCount = stmtSemana.get(inicioSemana, fimSemana).total;

    // próximo agendamento
    const stmtProximo = db.prepare(`
      SELECT * FROM agendamentos 
      WHERE date(data) >= date(?) 
      ORDER BY date(data), horario 
      LIMIT 1
    `);
    const proximo = stmtProximo.get(hoje);

    res.json({
      hoje: hojeCount,
      semana: semanaCount,
      proximo: proximo || null
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
});

export default router;
