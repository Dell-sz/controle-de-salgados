const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'universo_empada.db');
const db = new Database(dbPath);

console.log('🔍 DIAGNÓSTICO DO SISTEMA\n');

try {
  // 1. Verificar tabelas
  console.log('📊 TABELAS NO BANCO:');
  const tabelas = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
  tabelas.forEach(t => console.log(`   - ${t.name}`));

  // 2. Verificar estrutura da tabela produtos
  console.log('\n📋 ESTRUTURA DA TABELA PRODUTOS:');
  const colunas = db.prepare("PRAGMA table_info(produtos)").all();
  colunas.forEach(c => {
    console.log(`   - ${c.name} (${c.type})${c.pk ? ' PK' : ''}`);
  });

  // 3. Listar produtos
  console.log('\n🍪 PRODUTOS CADASTRADOS:');
  const produtos = db.prepare("SELECT id, nome, valor_unitario, quantidade_estoque FROM produtos").all();

  if (produtos.length === 0) {
    console.log('   Nenhum produto cadastrado!');
  } else {
    produtos.forEach(p => {
      console.log(`   ID ${p.id}: ${p.nome}`);
      console.log(`      Preço: R$ ${p.valor_unitario}`);
      console.log(`      Estoque: ${p.quantidade_estoque}`);
      console.log('      ---');
    });
  }

  // 4. Verificar destinos
  console.log('\n📍 DESTINOS:');
  const destinos = db.prepare("SELECT * FROM destinos").all();
  if (destinos.length === 0) {
    console.log('   Nenhum destino cadastrado!');
  } else {
    destinos.forEach(d => {
      console.log(`   ID ${d.id}: ${d.nome}`);
    });
  }

  // 5. Verificar estoque
  console.log('\n📦 TABELA ESTOQUE:');
  const estoques = db.prepare("SELECT * FROM estoque").all();
  if (estoques.length === 0) {
    console.log('   Nenhum registro de estoque!');
  } else {
    estoques.forEach(e => {
      console.log(`   Produto ID ${e.produto_id}: ${e.quantidade} unidades`);
    });
  }

  console.log('\n✅ Diagnóstico concluído!');

} catch (error) {
  console.error('❌ Erro no diagnóstico:', error);
} finally {
  db.close();
}

