const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'universo_empada.db');

async function migrateDestinos() {
  try {
    console.log('🔄 Carregando SQL.js...');
    const SQL = await initSqlJs();

    // Verificar se banco existe
    if (!fs.existsSync(dbPath)) {
      console.log('❌ Banco de dados não encontrado. Execute setup-db.js primeiro.');
      return;
    }

    const dbBuffer = fs.readFileSync(dbPath);
    const db = new SQL.Database(dbBuffer);

    // Verificar colunas existentes na tabela destinos
    const columnsResult = db.exec("PRAGMA table_info(destinos)");
    const existingColumns = columnsResult[0]?.values.map(v => v[1]) || [];

    console.log('📋 Colunas existentes em destinos:', existingColumns);

    // Adicionar colunas se não existirem
    const columnsToAdd = [
      { name: 'cpf_cnpj', type: 'VARCHAR(20)' },
      { name: 'tipo_pessoa', type: 'VARCHAR(20) DEFAULT \'fisica\'' },
      { name: 'observacao', type: 'TEXT' }
    ];

    for (const col of columnsToAdd) {
      if (!existingColumns.includes(col.name)) {
        console.log(`➕ Adicionando coluna ${col.name}...`);
        db.run(`ALTER TABLE destinos ADD COLUMN ${col.name} ${col.type}`);
      } else {
        console.log(`ℹ️  Coluna ${col.name} já existe`);
      }
    }

    // Salvar banco
    const data = db.export();
    const outputBuffer = Buffer.from(data);
    fs.writeFileSync(dbPath, outputBuffer);

    console.log('✅ Migração concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

migrateDestinos();

