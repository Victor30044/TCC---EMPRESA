const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pizzaria.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS Produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco REAL NOT NULL
  )`);
});

db.close(() => {
  console.log('Tabela Produtos criada com sucesso!');
});
