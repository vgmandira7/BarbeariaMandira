import express from "express";
import cors from "cors";
import bookingRoutes from "./routes/bookings.js";
import { criarTabelaAgendamentos } from "./CreateBanco.js";
import serverless from "serverless-http";

// --- PONTO CRÍTICO ---
// Garantimos que a tabela seja criada no início (apenas uma vez)
await criarTabelaAgendamentos(); 
// --------------------

const app = express();

app.use(cors()); // CORS está correto, permitindo a comunicação
app.use(express.json());

// Rotas
app.use("/api/agendamentos", bookingRoutes);
app.use("/api/bookings", bookingRoutes);

const PORT = 8081; // Definimos a porta correta

// ----------------------------------------------------
// 🌟 DEBUG CRÍTICO: Executar app.listen APENAS no ambiente LOCAL
// ----------------------------------------------------
// O serverless-http só é necessário para o Vercel. 
// No desenvolvimento local, precisamos do app.listen.
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`\n\n--------------------------------------`);
        console.log(`✅ Servidor Express rodando em http://localhost:${PORT}`);
        console.log(`--------------------------------------\n`);
    });
}

// Exporta o handler para o Vercel/Serverless
export default app; 
export const handler = serverless(app);

