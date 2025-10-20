// api/routes/bookings.js
const express = require("express");
const { format, startOfWeek, endOfWeek } = require("date-fns");
const Agendamento = require("../CreateBanco");

const router = express.Router();

// -----------------------
// Criar agendamento
// -----------------------
router.post("/", async (req, res) => {
  const { nome, telefone, servico, data, horario } = req.body;

  try {
    const novo = new Agendamento({ nome, telefone, servico, data, horario });
    await novo.save();
    res.status(201).json(novo);
  } catch (err) {
    console.error("Erro ao criar agendamento:", err);

    if (err.code === 11000) {
      return res.status(400).json({ error: "Horário já reservado" });
    }

    res.status(500).json({ error: "Erro interno ao criar agendamento" });
  }
});

// -----------------------
// Buscar TODOS os agendamentos (Painel Admin)
// -----------------------
router.get("/all", async (req, res) => {
  try {
    const agendamentos = await Agendamento.find().sort({ data: 1, horario: 1 });
    res.json(agendamentos);
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
    const agendamentos = await Agendamento.find({ data }).sort({ horario: 1 });
    res.json(agendamentos);
  } catch (err) {
    console.error("Erro ao buscar agendamentos da data:", err);
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

    const hojeCount = await Agendamento.countDocuments({ data: hoje });
    const semanaCount = await Agendamento.countDocuments({
      data: { $gte: inicioSemana, $lte: fimSemana },
    });

    const proximo = await Agendamento.findOne({ data: { $gte: hoje } })
      .sort({ data: 1, horario: 1 })
      .exec();

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
