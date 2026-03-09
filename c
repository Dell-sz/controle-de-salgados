const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'universo_empada.db');

let db = null;

// Inicializar o banco de dados
async function initDb() {
    const SQL = await initSqlJs();
    
    // Carregar banco existente ou criar novo
    if (fs.existsSync(dbPath)) {
        const buffer = fs.readFileSync(dbPath);
        db = new SQL.Database(buffer);
    } else {
        db = new SQL.Database();
    }
    
    return db;
}

function getDb() {
    if (!db) {
        throw new Error('Banco de dados não inicializado. Chame initDb() primeiro.');
    }
    return db;
}

// Salvar banco em disco
function saveDb() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
    }
}

// Helper para query (similar ao pg)
function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        try {
            const normalizedSql = sql.replace(/\$(\d+)/g, '?');
            const stmt = db.prepare(normalizedSql);
            stmt.bind(params);
            
            if (sql.trim().toUpperCase().startsWith('SELECT')) {
                const results = [];
                while (stmt.step()) {
                    results.push(stmt.getAsObject());
                }
                stmt.free();
                resolve({ rows: results });
            } else {
                stmt.run(params);
                stmt.free();
                saveDb(); // Salvar após modificações
                
                // Para INSERT com RETURNING
                if (sql.toLowerCase().includes('returning')) {
                    const results = [];
                    while (stmt.step()) {
                        results.push(stmt.getAsObject());
                    }
                    resolve({ rows: results });
                } else {
                    resolve({ rows: [{ changes: db.getRowsModified() }] });
                }
            }
        } catch (error) {
            console.error('Erro na query:', error.message, 'SQL:', sql);
            reject(error);
        }
    });
}

module.exports = {
    initDb,
    getDb,
    query,
    saveDb
};
