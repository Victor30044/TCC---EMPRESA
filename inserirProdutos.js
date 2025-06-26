const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pizzaria.db');

const produtos = [
  { nome: "Margherita", descricao: "Mussarela, tomate e manjericão", preco: 25.5 },
  { nome: "Calabresa", descricao: "Calabresa e cebola", preco: 29.9 },
  { nome: "Portuguesa", descricao: "Presunto, ovo, ervilha e cebola", preco: 30.0 }
];

db.serialize(() => {
  const stmt = db.prepare("INSERT INTO produtos (nome, descricao, preco) VALUES (?, ?, ?)");
  produtos.forEach(p => stmt.run(p.nome, p.descricao, p.preco));
  stmt.finalize();
});

db.close(() => {
  console.log("produtos inseridas!");
});
