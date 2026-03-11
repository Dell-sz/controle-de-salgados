const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'universo_empada.db');
const db = new Database(dbPath);

console.log('🔄 Migrando tabela de clientes...');

try {
  // Verificar estrutura atual
  const colunas = db.prepare("PRAGMA table_info(destinos)").all();
  console.log('Colunas atuais:', colunas.map(c => c.name));

  // Adicionar novas colunas se não existirem
  const colunasExistentes = colunas.map(c => c.name);

  if (!colunasExistentes.includes('cpf_cnpj')) {
    console.log('🆔 Adicionando coluna cpf_cnpj...');
    db.exec("ALTER TABLE destinos ADD COLUMN cpf_cnpj VARCHAR(20)");
  }

  if (!colunasExistentes.includes('tipo_pessoa')) {
    console.log('👤 Adicionando coluna tipo_pessoa...');
    db.exec("ALTER TABLE destinos ADD COLUMN tipo_pessoa VARCHAR(10) DEFAULT 'fisica'");
  }

  if (!colunasExistentes.includes('observacao')) {
    console.log('📝 Adicionando coluna observacao...');
    db.exec("ALTER TABLE destinos ADD COLUMN observacao TEXT");
  }

  console.log('✅ Migração concluída!');

  // Mostrar estrutura final
  const novasColunas = db.prepare("PRAGMA table_info(destinos)").all();
  console.log('\n📊 Estrutura final:');
  novasColunas.forEach(col => {
    console.log(`   - ${col.name} (${col.type})`);
  });

} catch (error) {
  console.error('❌ Erro na migração:', error);
} finally {
  db.close();
}

