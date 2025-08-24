import express from "express";
import cors from "cors";
import bookingRoutes from "./routes/bookings.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/bookings", bookingRoutes);

app.listen(5000, () => {
  console.log("Servidor rodando na porta 5000");
});
