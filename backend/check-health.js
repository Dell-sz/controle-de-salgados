/**
 * Script de Diagnóstico - Verifica a saúde do sistema
 * Execute: node check-health.js
 */

const Database = require('better-sqlite3');
const path = require('path');

console.log('🔍 DIAGNÓSTICO DO SISTEMA\n');
console.log('=' .repeat(50));

// 1. Verificar banco de dados
console.log('\n📦 Verificando Banco de Dados...');
const dbPath = path.join(__dirname, 'database', 'universo_empada.db');

try {
    const db = new Database(dbPath, { readonly: true });
    
    // Verificar tabelas
    const tables = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).all();
    
    console.log(`✅ Banco de dados encontrado: ${dbPath}`);
    console.log(`   Tabelas encontradas: ${tables.map(t => t.name).join(', ')}`);
    
    // Contar registros
    const usuarioCount = db.prepare('SELECT COUNT(*) as count FROM usuarios').get();
    const produtoCount = db.prepare('SELECT COUNT(*) as count FROM produtos').get();
    
    console.log(`   👥 Usuários: ${usuarioCount.count}`);
    console.log(`   📦 Produtos: ${produtoCount.count}`);
    
    db.close();
} catch (error) {
    console.log(`❌ Erro no banco: ${error.message}`);
}

// 2. Verificar variáveis de ambiente
console.log('\n⚙️ Verificando Configurações...');
require('dotenv').config();

console.log(`   PORT: ${process.env.PORT || 3000}`);
console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'http://localhost:5500'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✓ configurado' : '✗ não configurado'}`);

// 3. Verificar CORS
console.log('\n🛡️ Configuração CORS:');
console.log(`   Origin permitida: ${process.env.FRONTEND_URL || 'http://localhost:5500'}`);
console.log(`   Credentials: true`);

console.log('\n' + '=' .repeat(50));
console.log('\n📋 PRÓXIMOS PASSOS PARA TESTAR:');
console.log('   1. Inicie o backend: cd backend && npm start');
console.log('   2. Teste a API: http://localhost:3000/api/health');
console.log('   3. Acesse o frontend: http://localhost:3000');
console.log('   4. Abra o console do navegador (F12) para verificar erros');

