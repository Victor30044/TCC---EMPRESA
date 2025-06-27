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
db.serialize(() => {
  // Recria a tabela Produtos com a coluna descricao
  db.run(`
    CREATE TABLE IF NOT EXISTS Produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      preco REAL NOT NULL
    )
  `);

  // Verifica se a tabela está vazia
  db.get('SELECT COUNT(*) as total FROM Produtos', (err, row) => {
    if (err) {
      console.error('Erro ao verificar produtos:', err.message);
      return;
    }

    if (row.total === 0) {
      const insert = db.prepare(`INSERT INTO Produtos (nome, descricao, preco) VALUES (?, ?, ?)`);

      const produtos = [
        ['Calabresa', 'Calabresa, cebola, orégano, muçarela', 49.90],
        ['Marguerita', 'Muçarela, tomate, manjericão, orégano', 47.90],
        ['Frango com Catupiry', 'Frango desfiado, catupiry, orégano', 52.90],
        ['Portuguesa', 'Presunto, ovo, cebola, pimentão, azeitona, muçarela', 54.90],
        ['Quatro Queijos', 'Muçarela, provolone, gorgonzola, parmesão', 55.90],
        ['Toscana', 'Linguiça toscana, cebola roxa, muçarela', 53.90],
        ['Muçarela Brotinho', 'Muçarela, orégano (4 fatias)', 25.90],
        ['Calabresa Brotinho', 'Calabresa, cebola, muçarela (4 fatias)', 26.90],
        ['Frango com Catupiry Brotinho', 'Frango desfiado, catupiry (4 fatias)', 28.90],
        ['Chocolate ao Leite', 'Chocolate ao leite, granulado', 39.90],
        ['Prestígio', 'Chocolate, coco ralado', 41.90],
        ['Romeu e Julieta', 'Goiabada, catupiry', 37.90],
        ['Banana com Canela', 'Banana, açúcar, canela, leite condensado', 38.90],
        ['Oreo', 'Chocolate branco, pedaços de Oreo', 43.90],
        ['Refrigerante Lata', '350ml', 6.00],
        ['Refrigerante 2L', 'Coca, Guaraná ou Fanta', 12.00],
        ['Água Mineral', '500ml', 3.00],
        ['Suco Natural', 'Laranja, Maracujá ou Uva', 8.00],
        ['Batata Frita', 'Porção individual', 15.00],
        ['Borda Recheada', 'Catupiry, cheddar ou chocolate', 6.00],
        ['Molho Especial', 'Alho, ervas ou picante', 2.00],
      ];

      produtos.forEach(([nome, descricao, preco]) => {
        insert.run(nome, descricao, preco, (err) => {
          if (err) console.error(`Erro ao inserir ${nome}:`, err.message);
        });
      });

      insert.finalize(() => {
        console.log('Produtos do cardápio inseridos com sucesso!');
      });
    }
  });
});

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
  const { nome, preco } = req.body;

  if (!nome || !preco) {
    return res.status(400).json({ error: 'Nome e preço são obrigatórios.' });
  }

  const sql = `INSERT INTO Produtos (nome,   preco) VALUES (?, ?, ?)`;
  db.run(sql, [nome, , preco], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({
      id: this.lastID,
      nome,

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

  db.run(sql, [nome, email, senha, telefone, endereco], function (err) {
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
// Verifica se a tabela Produtos está vazia e insere os dados do cardápio
