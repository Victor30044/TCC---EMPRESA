const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pizzaria.db');

db.serialize(() => {
  const stmt = db.prepare("INSERT INTO produtos (nome, descricao, preco) VALUES (?, ?, ?)");
  produtos.forEach(p => stmt.run(p.nome, p.descricao, p.preco));
  stmt.finalize();
});

db.close(() => {
  console.log("produtos inseridas!");
});
