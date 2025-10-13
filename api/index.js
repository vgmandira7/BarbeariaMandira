// api/index.js: Ponto de entrada para a Serverless Function no Vercel
const express = require('express'); // <-- ADICIONE ESTA LINHA
const cors = require('cors');
// Importa o router de agendamentos (agora usando CJS: require)
const bookingRoutes = require('./routes/bookings');
const { criarTabelaAgendamentos } = require('./CreateBanco');
const serverless = require('serverless-http');

// Cria o aplicativo Express
const app = express();

// --- PONTO CRÍTICO ---
// Garantimos que a tabela seja criada no início (apenas uma vez)
// Nota: Em ambientes Serverless, isso pode ser chamado em cada execução.
// É essencial que a função 'criarTabelaAgendamentos' lide com isso de forma idempotente.
// O await aqui pode ser problemático no runtime da Vercel, faremos uma correção no CreateBanco.
criarTabelaAgendamentos(); 
// --------------------

app.use(cors()); 
app.use(express.json());

// 💡 IMPORTANTE: No Vercel, a rota base já é /api, então montamos o router na raiz '/'
// Isso garante que [DOMINIO]/api/bookings chegue corretamente.
app.use("/bookings", bookingRoutes); 
app.use("/agendamentos", bookingRoutes); 
// Incluímos /api na rota para ser mais explícito
app.use("/api/bookings", bookingRoutes);
app.use("/api/agendamentos", bookingRoutes);


// 🌟 EXPORTAÇÃO CRÍTICA PARA VERCEL
// Serverless Functions na Vercel precisam exportar o app Express (ou um handler).
// Usar 'module.exports = app;' é o padrão mais estável.
module.exports = app;

// Se você insistir em usar serverless-http (não recomendado para Vercel Node Runtime):
// module.exports.handler = serverless(app);

// Deixamos apenas 'module.exports = app;'