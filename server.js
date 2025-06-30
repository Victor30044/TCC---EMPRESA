const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
const db = new Database('./pizzaria.db');

app.use(cors());
app.use(express.json());

// Criação das tabelas
db.exec(`
  CREATE TABLE IF NOT EXISTS Produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS Usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    telefone TEXT,
    endereco TEXT
  );

  CREATE TABLE IF NOT EXISTS Pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    itens TEXT NOT NULL,
    total REAL NOT NULL,
    data_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
  );
`);

// Inserção inicial dos produtos, se a tabela estiver vazia
const row = db.prepare('SELECT COUNT(*) as total FROM Produtos').get();

if (row.total === 0) {
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

  const insert = db.prepare('INSERT INTO Produtos (nome, descricao, preco) VALUES (?, ?, ?)');
  const insertMany = db.transaction((produtos) => {
    for (const p of produtos) insert.run(...p);
  });

  insertMany(produtos);
  console.log('Produtos do cardápio inseridos com sucesso!');
}

// Rotas para produtos

app.get('/produtos', (req, res) => {
  const produtos = db.prepare('SELECT * FROM Produtos').all();
  res.json(produtos);
});

app.post('/produtos', (req, res) => {
  const { nome, descricao = '', preco } = req.body;

  if (!nome || preco === undefined) {
    return res.status(400).json({ error: 'Nome e preço são obrigatórios.' });
  }

  try {
    const stmt = db.prepare('INSERT INTO Produtos (nome, descricao, preco) VALUES (?, ?, ?)');
    const info = stmt.run(nome, descricao, preco);
    res.json({
      id: info.lastInsertRowid,
      nome,
      descricao,
      preco,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// mudança 
// Rotas para usuários
app.post('/usuarios', (req, res) => {
  const { nome, email, senha, telefone, endereco } = req.body;

  if (!nome || !email || !senha || !telefone || !endereco) {
    return res.status(400).send('Todos os campos são obrigatórios');
  }

  try {
    const stmt = db.prepare('INSERT INTO Usuarios (nome, email, senha, telefone, endereco) VALUES (?, ?, ?, ?, ?)');
    stmt.run(nome, email, senha, telefone, endereco);
    res.status(200).json({ mensagem: 'Usuário cadastrado com sucesso!' });
  } catch (err) {
    res.status(500).send('Erro ao inserir usuário');
  }
});

app.get('/usuarios', (req, res) => {
  try {
    const usuarios = db.prepare('SELECT * FROM Usuarios').all();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/produtos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const produto = db.prepare('SELECT * FROM Produtos WHERE id = ?').get(id);
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(produto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// Inicializa o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});