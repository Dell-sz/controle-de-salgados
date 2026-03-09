const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { initDb } = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const producaoRoutes = require('./routes/producaoRoutes');
const saidaRoutes = require('./routes/saidaRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const destinoRoutes = require('./routes/destinoRoutes');
const relatorioRoutes = require('./routes/relatorioRoutes');

const app = express();

// Segurança
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5500',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // limite por IP
});
app.use('/api/', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/producoes', producaoRoutes);
app.use('/api/saidas', saidaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/destinos', destinoRoutes);
app.use('/api/relatorios', relatorioRoutes);

// Rota de saúde
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ erro: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3000;

// Iniciar servidor
async function startServer() {
    try {
        console.log('🔄 Inicializando banco de dados...');
        await initDb();
        console.log('✅ Banco de dados conectado!');
        
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`📊 Banco: SQLite (universo_empada.db)`);
        });
    } catch (error) {
        console.error('❌ Erro ao iniciar:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;
