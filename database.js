const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pizzaria.db', (err) => {
  if (err) {
    console.error('Erro ao abrir banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

// Cria tabelas se não existirem
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS Produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco REAL NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS Pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    nome_usuario TEXT,
    endereco_usuario TEXT,
    itens TEXT,
    total REAL,
    status TEXT,
    pagamento TEXT,
    data_pedido TEXT
  )`);
});

// NÃO FECHAR a conexão aqui! Exportar o db aberto para uso no server
module.exports = db;
