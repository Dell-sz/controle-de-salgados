const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'database', 'universo_empada.db');
const schemaPath = path.join(__dirname, 'database', 'schema.sql');

async function setupDatabase() {
    try {
        console.log('🔄 Carregando SQL.js...');
        const SQL = await initSqlJs();
        
        let db;
        
        // Verificar se banco já existe
        if (fs.existsSync(dbPath)) {
            console.log('ℹ️  Banco de dados já existe, carregando...');
            const buffer = fs.readFileSync(dbPath);
            db = new SQL.Database(buffer);
        } else {
            console.log('🔄 Criando novo banco de dados...');
            db = new SQL.Database();
        }
        
        // Ler e executar o schema
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Executar cada statement separadamente
        const statements = schema.split(';').filter(s => s.trim().length > 0);
        
        for (const statement of statements) {
            if (statement.trim().length > 0) {
                try {
                    db.run(statement);
                } catch (e) {
                    // Ignorar erros de INSERT OR IGNORE que não afetam
                    if (!e.message.includes('UNIQUE constraint failed') && 
                        !e.message.includes('already exists')) {
                        console.log('  ⚠️  ', e.message.substring(0, 50));
                    }
                }
            }
        }
        
        console.log('✅ Tabelas criadas com sucesso!');
        
        // Criar usuário admin padrão
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        
        const checkAdmin = db.exec("SELECT id FROM usuarios WHERE email = 'admin@universoempada.com.br'");
        
        if (checkAdmin.length === 0 || checkAdmin[0].values.length === 0) {
            db.run(`
                INSERT INTO usuarios (nome, email, senha, tipo) 
                VALUES (?, ?, ?, ?)
            `, ['Administrador', 'admin@universoempada.com.br', hashedPassword, 'admin']);
            console.log('✅ Usuário admin criado! (email: admin@universoempada.com.br / senha: admin123)');
        } else {
            console.log('ℹ️  Usuário admin já existe');
        }
        
        // Salvar banco
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
        
        console.log('🎉 Setup concluído!');
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

setupDatabase();
