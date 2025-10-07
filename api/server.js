import express from "express";
import cors from "cors";
import bookingRoutes from "./routes/bookings.js";
import { criarTabelaAgendamentos } from "./CreateBanco.js";
import serverless from "serverless-http";

await criarTabelaAgendamentos();

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use("/api/agendamentos", bookingRoutes);
app.use("/api/bookings", bookingRoutes);

// Exporta para o Vercel
export const handler = serverless(app);
