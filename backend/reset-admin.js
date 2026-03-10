/**
 * Script para resetar a senha do admin
 * Execute: node reset-admin.js
 */

const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'universo_empada.db');
const db = new Database(dbPath);

async function resetAdminPassword() {
    const novaSenha = 'admin123'; // Nova senha padrão
    
    try {
        // Gerar novo hash
        const senhaHash = await bcrypt.hash(novaSenha, 10);
        
        // Atualizar senha do admin (id = 1)
        const stmt = db.prepare('UPDATE usuarios SET senha = ? WHERE id = 1');
        const result = stmt.run(senhaHash);
        
        if (result.changes > 0) {
            console.log('✅ Senha do admin resetada com sucesso!');
            console.log(`   Email: admin@universoempada.com.br`);
            console.log(`   Nova senha: ${novaSenha}`);
        } else {
            console.log('❌ Usuário admin não encontrado');
        }
        
    } catch (error) {
        console.error('❌ Erro ao resetar senha:', error.message);
    } finally {
        db.close();
    }
}

resetAdminPassword();

