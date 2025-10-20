// api/createBanco.js
const mongoose = require("mongoose");

const agendamentoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  telefone: { type: String, required: true },
  servico: { type: String, required: true },
  data: { type: String, required: true },
  horario: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

agendamentoSchema.index({ data: 1, horario: 1 }, { unique: true });

const Agendamento = mongoose.model("Agendamento", agendamentoSchema);

module.exports = Agendamento;
