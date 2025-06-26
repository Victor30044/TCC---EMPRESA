const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

// Inicializa o app e o banco
const app = express();
const db = new sqlite3.Database('./pizzaria.db');

// Middlewares
app.use(cors()); // Habilita o CORS para todas as origens
app.use(express.json()); // Permite receber JSON no corpo das requisições

// Cria a tabela se não existir
db.run(`
  CREATE TABLE IF NOT EXISTS Produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco REAL NOT NULL
  )
`);
// Criar tabela de usuários
db.run(`
  CREATE TABLE IF NOT EXISTS Usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    telefone TEXT,
    endereco TEXT
  )
`);

// Criar tabela de pedidos
db.run(`
  CREATE TABLE IF NOT EXISTS Pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    itens TEXT NOT NULL,
    total REAL NOT NULL,
    data_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
  )
`);
// Rota GET para listar os produtos
app.get('/produtos', (req, res) => {
  db.all('SELECT * FROM Produtos', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Rota POST para adicionar um novo produto
app.post('/produtos', (req, res) => {
  const { nome, descricao, preco } = req.body;

  if (!nome || !preco) {
    return res.status(400).json({ error: 'Nome e preço são obrigatórios.' });
  }

  const sql = `INSERT INTO Produtos (nome, descricao, preco) VALUES (?, ?, ?)`;
  db.run(sql, [nome, descricao, preco], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({
      id: this.lastID,
      nome,
      descricao,
      preco
    });
  });
});
app.post('/usuarios', (req, res) => {
  const { nome, email, senha, telefone, endereco } = req.body;

  if (!nome || !email || !senha || !telefone || !endereco) {
    return res.status(400).send('Todos os campos são obrigatórios');
  }

  const sql = `INSERT INTO Usuarios (nome, email, senha, telefone, endereco) VALUES (?, ?, ?, ?, ?)`;

  db.run(sql, [nome, email, senha, telefone, endereco], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro ao inserir usuário');
    }

    res.status(200).json({ mensagem: 'Usuário cadastrado com sucesso!' });

  });
});
app.get('/usuarios', (req, res) => {
  db.all('SELECT * FROM Usuarios', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Inicializa o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
