
// Teste de autenticação direta
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = require('./backend/config/database');

async function testLogin() {
    console.log('🔍 Testando login...\n');
    
    const email = 'admin@universoempada.com.br';
    const senha = 'admin123';
    
    try {
        // Buscar usuário
        const stmt = db.db.prepare('SELECT * FROM usuarios WHERE email = ? AND ativo = 1');
        const usuario = stmt.get(email);
        
        if (!usuario) {
            console.log('❌ Usuário não encontrado ou inativo');
            return;
        }
        
        console.log('✅ Usuário encontrado:', usuario.nome);
        console.log('   Hash no banco:', usuario.senha.substring(0, 30) + '...');
        
        // Verificar senha
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        console.log('✅ Senha válida:', senhaValida);
        
        if (senhaValida) {
            const token = jwt.sign(
                { id: usuario.id, email: usuario.email, tipo: usuario.tipo, nome: usuario.nome },
                process.env.JWT_SECRET || 'segredo_dev',
                { expiresIn: '8h' }
            );
            console.log('\n🎉 Login bem-sucedido!');
            console.log('Token:', token.substring(0, 50) + '...');
        }
        
    } catch (error) {
        console.log('❌ Erro:', error.message);
        console.log(error.stack);
    }
    
    process.exit(0);
}

testLogin();

