// api/index.js: Ponto de entrada para a Serverless Function no Vercel
const express = require("express");
const cors = require("cors");
const bookingRoutes = require("./routes/bookings");
const { conectarMongoDB } = require("./database"); // conexão MongoDB
const serverless = require("serverless-http");

// Cria o aplicativo Express
const app = express();

app.use(cors());
app.use(express.json());

// 🧩 Conectar ao MongoDB (apenas uma vez)
// Em ambiente Serverless (Vercel), a conexão precisa ser reaproveitada entre execuções.
// Então garantimos que o mongoose só conecte uma vez.
conectarMongoDB();

// Rotas
//app.use("/bookings", bookingRoutes);
app.use("/agendamentos", bookingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/agendamentos", bookingRoutes);

// Exportação para Vercel
module.exports = app;
