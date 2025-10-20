// api/database.js
const mongoose = require("mongoose");

let isConnected = false;

async function conectarMongoDB() {
  if (isConnected) return; // evita múltiplas conexões no ambiente serverless

  try {
    const mongoURI = process.env.MONGODB_URI;
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("✅ Conectado ao MongoDB Atlas com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao conectar ao MongoDB:", error);
  }
}

module.exports = { conectarMongoDB };
