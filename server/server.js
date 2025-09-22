import express from "express";
import cors from "cors";
import http from "http"; // necessário para socket.io
import { Server } from "socket.io";
import bookingRoutes from "./routes/bookings.js";
import { criarTabelaAgendamentos } from "./CreateBanco.js";

await criarTabelaAgendamentos();

const app = express();
const server = http.createServer(app); // criar servidor HTTP normal

const io = new Server(server, {
  cors: {
    origin: "*", // pode colocar o domínio do frontend depois
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use("/api/agendamentos", bookingRoutes);
app.use("/api/bookings", bookingRoutes);

// quando algum cliente conectar
io.on("connection", (socket) => {
  console.log("Novo cliente conectado:", socket.id);

  // opcional: escutar eventos do cliente
  socket.on("disconnect", () => {
    console.log("Cliente desconectou:", socket.id);
  });
});

// exportar io para usar em outros arquivos
export { io };

server.listen(5000, () => {
  console.log("Servidor rodando na porta 5000");
});
