const express = require('express');
const cors = require('cors');
const db = require('./config/database');

const app = express();

// CORS liberado para frontend
app.use(cors({
    origin: 'http://localhost:5500',
    credentials: true
}));

app.use(express.json());

// Servir arquivos estáticos do frontend
app.use(express.static(require('path').join(__dirname, '..', 'frontend')));

// Rota para servir o index.html na raiz
app.get('/', (req, res) => {
    res.sendFile(require('path').join(__dirname, '..', 'frontend', 'index.html'));
});

// Rotas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/produtos', require('./routes/produtoRoutes'));
app.use('/api/producoes', require('./routes/producaoRoutes'));
app.use('/api/saidas', require('./routes/saidaRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/relatorios', require('./routes/relatorioRoutes'));

// Rota de saúde
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📡 Frontend deve acessar: http://localhost:5500`);
});

module.exports = app;

