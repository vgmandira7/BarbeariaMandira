// api/routes/bookings.js: Conversão para CJS (CommonJS)
const express = require("express");
const db = require("../database"); // Importando o db convertido
const { format, startOfWeek, endOfWeek } = require("date-fns"); // date-fns já é CJS

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
    console.error('ERRO CRÍTICO NO BANCO DE DADOS (TURSO/SQLITE):', err);

    if (err.code === "SQLITE_CONSTRAINT") {
      return res.status(400).json({ error: "Horário já reservado" });
    }
    
    res.status(500).json({ error: "Erro interno ao criar agendamento. Verifique os logs do servidor para detalhes." });
  }
});

// -----------------------
// Buscar TODOS os agendamentos (Painel Admin)
// -----------------------
router.get("/all", async (req, res) => {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM agendamentos ORDER BY data ASC, horario ASC`,
      args: [],
    });

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

    const rows = (result.rows || result.results || []).map(row => ({
        ...row,
        id: row.id ? String(row.id) : row.id
    }));

    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar agendamentos da data:", err);
    res.status(500).json({ error: "Erro ao buscar agendamentos da data" });
  }
});

// -----------------------
// Estatísticas para painel (Omitidas para brevidade, mas o CJS está aplicado)
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
            proximo.id = String(proximo.id); 
        }
    
    
        res.json({
          hoje: hojeCount,
          semana: semanaCount,
          proximo,
        });
      } catch (err) {
        console.error("Erro ao buscar estatísticas:", err);
        res.status(500).json({ error: "Erro ao buscar estatísticas" });
      }
});


module.exports = router;
