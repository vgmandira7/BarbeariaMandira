// bookings.js
import express from "express";
import db from "../database.js";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { io } from "../server.js";

const router = express.Router();

// -----------------------
// Criar agendamento
// -----------------------
router.post("/", async (req, res) => {
  const { nome, telefone, servico, data, horario } = req.body;

  try {
    const result = await db.execute({
      sql: `
        INSERT INTO agendamentos (nome, telefone, servico, data, horario)
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [nome, telefone, servico, data, horario],
    });

    const insertedId = result.insertId || null;

    // Emitir evento para todos os clientes conectados
    io.emit("novo-agendamento", {
      id: insertedId,
      nome,
      telefone,
      servico,
      data,
      horario,
    });

    res.status(201).json({
      id: insertedId,
      nome,
      telefone,
      servico,
      data,
      horario,
    });
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT") {
      return res.status(400).json({ error: "Horário já reservado" });
    }
    console.error(err);
    res.status(500).json({ error: "Erro ao criar agendamento" });
  }
});

// -----------------------
// Buscar agendamentos por data
// -----------------------
// bookings.js
router.get("/data/:data", async (req, res) => {
  const { data } = req.params;

  try {
    const result = await db.execute({
      sql: `SELECT * FROM agendamentos WHERE data = ? ORDER BY horario`,
      args: [data],
    });

    console.log("Resultado da query:", result); // Adicione esta linha

    res.json(result.rows || result.results || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar agendamentos da data" });
  }
});

// -----------------------
// Estatísticas para painel
// -----------------------
// bookings.js
router.get("/stats", async (req, res) => {
  try {
    const hoje = format(new Date(), "yyyy-MM-dd");
    const inicioSemana = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const fimSemana = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

    // Total de hoje
    const hojeRes = await db.execute({
      sql: `
        SELECT COUNT(*) AS total 
        FROM agendamentos 
        WHERE data = ?
      `,
      args: [hoje],
    });
    const hojeCount = hojeRes.rows?.[0]?.total ?? 0;

    // Total da semana
    const semanaRes = await db.execute({
      sql: `
        SELECT COUNT(*) AS total
        FROM agendamentos
        WHERE data BETWEEN ? AND ?
      `,
      args: [inicioSemana, fimSemana],
    });
    const semanaCount = semanaRes.rows?.[0]?.total ?? 0;

    // Próximo agendamento
    const proximoRes = await db.execute({
      sql: `
        SELECT * FROM agendamentos
        WHERE data >= ?
        ORDER BY data ASC, horario ASC
        LIMIT 1
      `,
      args: [hoje],
    });
    const proximo = proximoRes.rows?.[0] ?? null;

    res.json({
      hoje: hojeCount,
      semana: semanaCount,
      proximo,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
});// bookings.js
router.get("/stats", async (req, res) => {
  try {
    const hoje = format(new Date(), "yyyy-MM-dd");
    const inicioSemana = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const fimSemana = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

    // Total de hoje
    const hojeRes = await db.execute({
      sql: `
        SELECT COUNT(*) AS total 
        FROM agendamentos 
        WHERE data = ?
      `,
      args: [hoje],
    });
    const hojeCount = hojeRes.rows?.[0]?.total ?? 0;

    // Total da semana
    const semanaRes = await db.execute({
      sql: `
        SELECT COUNT(*) AS total
        FROM agendamentos
        WHERE data BETWEEN ? AND ?
      `,
      args: [inicioSemana, fimSemana],
    });
    const semanaCount = semanaRes.rows?.[0]?.total ?? 0;

    // Próximo agendamento
    const proximoRes = await db.execute({
      sql: `
        SELECT * FROM agendamentos
        WHERE data >= ?
        ORDER BY data ASC, horario ASC
        LIMIT 1
      `,
      args: [hoje],
    });
    const proximo = proximoRes.rows?.[0] ?? null;

    res.json({
      hoje: hojeCount,
      semana: semanaCount,
      proximo,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
});

// -----------------------
// Rota para buscar todas as datas com agendamentos
// -----------------------
router.get("/dates-with-bookings", async (req, res) => {
  try {
    const result = await db.execute({
      sql: `
        SELECT DISTINCT data FROM agendamentos 
        ORDER BY data ASC
      `,
    });

    const dates = result.rows ? result.rows.map(row => row.data) : [];
    res.json(dates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar datas com agendamentos" });
  }
});

export default router;
