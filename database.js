const Database = require('better-sqlite3');
const db = new Database('./pizzaria.db');


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
