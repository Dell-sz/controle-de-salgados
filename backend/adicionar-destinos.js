const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'universo_empada.db');
const db = new Database(dbPath);

console.log('🔧 Adicionando destinos iniciais...');

try {
  // Verificar se já existem destinos
  const destinosExistentes = db.prepare("SELECT COUNT(*) as count FROM destinos").get();

  if (destinosExistentes.count > 0) {
    console.log(`✅ Já existem ${destinosExistentes.count} destinos cadastrados!`);
  } else {
    // Inserir destinos de exemplo
    const insert = db.prepare(`
            INSERT INTO destinos (nome, categoria_id, endereco, contato, telefone) 
            VALUES (?, ?, ?, ?, ?)
        `);

    insert.run('Universo da Empada - Matriz', 1, 'Rua Central, 123', 'João Silva', '(11) 99999-9999');
    insert.run('Lanchonete do Bairro', 1, 'Av. Principal, 456', 'Maria Santos', '(11) 88888-8888');
    insert.run('Mercado Popular', 2, 'Praça da Igreja, 78', 'Pedro Oliveira', '(11) 77777-7777');
    insert.run('Restaurante Sabor Caseiro', 3, 'Rua dos Alimentos, 90', 'Ana Costa', '(11) 66666-6666');

    console.log('✅ 4 destinos adicionados com sucesso!');
  }

  // Listar destinos
  console.log('\n📍 Destinos cadastrados:');
  const destinos = db.prepare("SELECT id, nome, endereco FROM destinos").all();
  destinos.forEach(d => console.log(`   ID ${d.id}: ${d.nome} - ${d.endereco}`));

} catch (err) {
  console.error('❌ Erro:', err.message);
} finally {
  db.close();
}

