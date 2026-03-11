const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'universo_empada.db');
const db = new Database(dbPath);

console.log('🔧 Iniciando correção do banco de dados...');

try {
  // Verificar se a coluna existe na tabela produtos
  const colunas = db.prepare("PRAGMA table_info(produtos)").all();

  console.log('📊 Colunas atuais na tabela produtos:');
  colunas.forEach(col => {
    console.log(`   - ${col.name} (${col.type})`);
  });

  const temColuna = colunas.some(col => col.name === 'quantidade_estoque');

  if (!temColuna) {
    console.log('➕ Adicionando coluna quantidade_estoque...');

    db.exec("ALTER TABLE produtos ADD COLUMN quantidade_estoque INTEGER DEFAULT 0");
    console.log('✅ Coluna quantidade_estoque adicionada com sucesso!');

    // Atualizar valores iniciais baseados na tabela estoque
    db.exec(`
            UPDATE produtos 
            SET quantidade_estoque = (
                SELECT e.quantidade FROM estoque e WHERE e.produto_id = produtos.id
            )
            WHERE EXISTS (SELECT 1 FROM estoque e WHERE e.produto_id = produtos.id)
        `);

    // Se ainda tiver null, define como 100
    db.exec("UPDATE produtos SET quantidade_estoque = 100 WHERE quantidade_estoque IS NULL OR quantidade_estoque = 0");

    console.log('✅ Estoque inicial definido para 100');
  } else {
    console.log('✅ Coluna quantidade_estoque já existe!');
  }

  // Mostrar resultado final
  const produtos = db.prepare("SELECT id, nome, quantidade_estoque FROM produtos").all();

  console.log('\n📦 Produtos após correção:');
  produtos.forEach(p => {
    console.log(`   ID ${p.id}: ${p.nome} - Estoque: ${p.quantidade_estoque}`);
  });

  console.log('\n✅ Correção concluída com sucesso!');

} catch (err) {
  console.error('❌ Erro:', err.message);
} finally {
  db.close();
}

