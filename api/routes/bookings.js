import express from "express";
import db from "../database.js";
import { format, startOfWeek, endOfWeek } from "date-fns";

const router = express.Router();

// -----------------------
// Criar agendamento
// -----------------------
router.post("/", async (req, res) => {
  const { nome, telefone, servico, data, horario } = req.body;

  // 🌟 DEBUG PONTO 1: Loga os dados recebidos antes da inserção
  console.log('DADOS RECEBIDOS NA ROTA POST:', { nome, telefone, servico, data, horario });

  try {
    const result = await db.execute({
      sql: `
        INSERT INTO agendamentos (nome, telefone, servico, data, horario)
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [nome, telefone, servico, data, horario],
    });

    // CORREÇÃO CRÍTICA: Convertendo BigInt para String para evitar TypeError no Express
    let insertedId = null;
    if (result.insertId) {
      insertedId = String(result.insertId);
    }
    
    res.status(201).json({
      id: insertedId,
      nome,
      telefone,
      servico,
      data,
      horario,
    });
  } catch (err) {
    // 🌟 DEBUG PONTO 2: Loga o erro completo que o banco retornou
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.log('ERRO CRÍTICO NO BANCO DE DADOS (TURSO/SQLITE):', err);
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');

    // Se a restrição for violada (ex: horário já reservado)
    if (err.code === "SQLITE_CONSTRAINT") {
      return res.status(400).json({ error: "Horário já reservado" });
    }
    
    // Retorna a mensagem genérica de erro interno
    res.status(500).json({ error: "Erro interno ao criar agendamento. Verifique os logs do servidor para detalhes." });
  }
});

// -----------------------
// Buscar TODOS os agendamentos (Nova rota para Painel Admin)
// -----------------------
router.get("/all", async (req, res) => {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM agendamentos ORDER BY data ASC, horario ASC`,
      args: [],
    });

    // Garante que os IDs sejam strings
    const rows = (result.rows || result.results || []).map(row => ({
        ...row,
        id: row.id ? String(row.id) : row.id
    }));

    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar todos os agendamentos:", err);
    res.status(500).json({ error: "Erro ao buscar todos os agendamentos" });
  }
});

// -----------------------
// Buscar agendamentos por data
// -----------------------
router.get("/data/:data", async (req, res) => {
  const { data } = req.params;

  try {
    const result = await db.execute({
      sql: `SELECT * FROM agendamentos WHERE data = ? ORDER BY horario`,
      args: [data],
    });

    // Converte IDs para string, se existirem
    const rows = (result.rows || result.results || []).map(row => ({
        ...row,
        id: row.id ? String(row.id) : row.id
    }));

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar agendamentos da data" });
  }
});

// -----------------------
// Estatísticas para painel
// -----------------------
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

    let proximo = proximoRes.rows?.[0] ?? null;

    if (proximo && proximo.id) {
        proximo.id = String(proximo.id); // Garante que o ID do próximo agendamento é string
    }


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
