const Database = require('better-sqlite3');
const db = new Database('./pizzaria.db');

db.close(() => {
  console.log('Tabela Produtos criada com sucesso!');
});
