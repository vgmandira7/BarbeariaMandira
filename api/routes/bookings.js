// api/routes/bookings.js
const express = require("express");
const { format, startOfWeek, endOfWeek } = require("date-fns");
const Agendamento = require("../CreateBanco");

const router = express.Router();

// ------------ Função para calcular horários ocupados pelo serviço ------------
function calcularHorariosOcupados(horario, servico) {
  const duracoes = {
    "cabelo": 60,
    "hair": 60,
    "cabelo + barba": 60,
    "hair-beard": 60,
    "barba": 30,
    "beard": 30,
    "sobrancelha": 30,
    "eyebrow": 30,
  };

  const duracao = duracoes[servico.toLowerCase()] || 60;
  const slots = duracao === 60 ? 2 : 1;

  const [h, m] = horario.split(":").map(Number);
  const ocupados = [];

  for (let i = 0; i < slots; i++) {
    const totalMin = h * 60 + m + i * 30;
    const hh = String(Math.floor(totalMin / 60)).padStart(2, "0");
    const mm = String(totalMin % 60).padStart(2, "0");
    ocupados.push(`${hh}:${mm}`);
  }

  return ocupados;
}

// -----------------------
// Criar agendamento
// -----------------------
router.post("/", async (req, res) => {
  const { nome, telefone, servico, data, horario } = req.body;

  try {
    // Calcula todos os horários afetados
    const horariosOcupados = calcularHorariosOcupados(horario, servico);

    // Verifica conflito com qualquer horário ocupado
    const conflito = await Agendamento.findOne({
      data,
      horario: { $in: horariosOcupados },
    });

    if (conflito) {
      return res.status(400).json({
        error: `Esse horário conflita com outro agendamento às ${conflito.horario}.`,
      });
    }

    // Cria o agendamento
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
// Buscar TODOS
// -----------------------
router.get("/all", async (req, res) => {
  try {
    const agendamentos = await Agendamento.find().sort({ data: 1, horario: 1 });
    res.json(agendamentos);
  } catch (err) {
    console.error("Erro:", err);
    res.status(500).json({ error: "Erro ao buscar agendamentos" });
  }
});

// -----------------------
// Buscar por data
// -----------------------
router.get("/data/:data", async (req, res) => {
  const { data } = req.params;

  try {
    const agendamentos = await Agendamento.find({ data }).sort({ horario: 1 });
    res.json(agendamentos);
  } catch (err) {
    console.error("Erro:", err);
    res.status(500).json({ error: "Erro ao buscar agendamentos" });
  }
});

// -----------------------
// Estatísticas
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

    res.json({ hoje: hojeCount, semana: semanaCount, proximo });
  } catch (err) {
    console.error("Erro:", err);
    res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
});

// -----------------------
// Deletar agendamento
// -----------------------
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletado = await Agendamento.findByIdAndDelete(id);

    if (!deletado) {
      return res.status(404).json({ error: "Agendamento não encontrado" });
    }

    res.json({ message: "Agendamento removido" });
  } catch (err) {
    console.error("Erro:", err);
    res.status(500).json({ error: "Erro ao deletar agendamento" });
  }
});

module.exports = router;
