const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'universo_empada.db');
const db = new Database(dbPath);

// Configurar para retornar objetos em vez de arrays
db.pragma('journal_mode = WAL');

// Helper para simular a interface do pg (async/await com $1, $2)
function query(sql, params = []) {
    // Converter $1, $2, etc. para ?
    let normalizedSql = sql.replace(/\$(\d+)/g, '?');
    
    const stmt = db.prepare(normalizedSql);
    
    try {
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
            const rows = stmt.all(...params);
            return Promise.resolve({ rows });
        } else {
            // INSERT, UPDATE, DELETE
            let result;
            if (sql.toLowerCase().includes('returning')) {
                //处理 RETURNING
                const result = stmt.get(...params);
                return Promise.resolve({ rows: [result] });
            } else {
                result = stmt.run(...params);
                return Promise.resolve({ rows: [result] });
            }
        }
    } catch (error) {
        console.error('Erro na query:', error.message, 'SQL:', normalizedSql);
        return Promise.reject(error);
    }
}

// Para queries síncronas directas
function dbExec(sql, params = []) {
    const normalizedSql = sql.replace(/\$(\d+)/g, '?');
    const stmt = db.prepare(normalizedSql);
    return stmt.run(...params);
}

function dbGet(sql, params = []) {
    const normalizedSql = sql.replace(/\$(\d+)/g, '?');
    const stmt = db.prepare(normalizedSql);
    return stmt.get(...params);
}

function dbAll(sql, params = []) {
    const normalizedSql = sql.replace(/\$(\d+)/g, '?');
    const stmt = db.prepare(normalizedSql);
    return stmt.all(...params);
}

module.exports = {
    db,
    query,
    exec: dbExec,
    get: dbGet,
    all: dbAll
};
