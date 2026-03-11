const express = require('express');
const cors = require('cors');
const db = require('./config/database');

const app = express();

// CORS liberado para frontend Next.js
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}));

app.use(express.json());

// Rotas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/destinos', require('./routes/destinoRoutes'));
app.use('/api/produtos', require('./routes/produtoRoutes'));
app.use('/api/producoes', require('./routes/producaoRoutes'));
app.use('/api/saidas', require('./routes/saidaRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/relatorios', require('./routes/relatorioRoutes'));

// Rota de saúde
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📡 Frontend Next.js deve acessar: http://localhost:3000`);
});

module.exports = app;

