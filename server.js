const express = require('express');
const path = require('path');
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
    status TEXT DEFAULT 'pendente',
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
  );
`);
// Tenta adicionar a coluna "pagamento" se ainda não existir
try {
  db.prepare(`ALTER TABLE Pedidos ADD COLUMN pagamento TEXT DEFAULT 'entrega'`).run();
} catch (err) {
  if (!err.message.includes('duplicate column')) {
    console.error("Erro ao adicionar coluna pagamento:", err.message);
  }
}
try {
  db.prepare(`ALTER TABLE Usuarios ADD COLUMN tipo TEXT DEFAULT 'cliente'`).run();
} catch (err) {
  if (!err.message.includes('duplicate column')) {
    console.error("Erro ao adicionar coluna tipo:", err.message);
  }
}


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
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  const usuario = db.prepare('SELECT * FROM Usuarios WHERE email = ? AND senha = ?').get(email, senha);

  if (usuario) {
    res.json({ usuario });
  } else {
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
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
    const info = stmt.run(nome, email, senha, telefone, endereco);
    
    res.status(200).json({ 
      mensagem: 'Usuário cadastrado com sucesso!',
      id: info.lastInsertRowid // envia o ID para o front salvar no localStorage
    });
  } catch (err) {
    console.error('Erro ao inserir usuário:', err.message);
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
app.post('/pedidos', (req, res) => {
  const { usuario_id, itens, total } = req.body;

  if (typeof usuario_id !== 'number' || !Array.isArray(itens) || typeof total !== 'number') {
    return res.status(400).json({ error: 'Dados inválidos. Verifique usuário, itens e total.' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO Pedidos (usuario_id, itens, total)
      VALUES (?, ?, ?)
    `);
    const info = stmt.run(usuario_id, JSON.stringify(itens), total);

    res.status(200).json({
      mensagem: 'Pedido salvo com sucesso!',
      id_pedido: info.lastInsertRowid
    });
  } catch (err) {
    console.error("Erro ao salvar pedido no banco:", err);
    res.status(500).json({ error: 'Erro ao salvar pedido no banco' });
  }
});



// Rota para concluir pedido
app.patch('/pedidos/:id/concluir', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const stmt = db.prepare('UPDATE Pedidos SET status = ? WHERE id = ?');
    const info = stmt.run('entregue', id); // <<<<< AQUI!

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json({ mensagem: 'Pedido marcado como entregue com sucesso' });
  } catch (err) {
    console.error('Erro ao concluir pedido:', err.message);
    res.status(500).json({ error: 'Erro ao concluir pedido' });
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
  app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
  // Rota GET para listar todos os pedidos
app.get('/pedidos', (req, res) => {
  try {
    const pedidos = db.prepare(`
      SELECT p.*, u.nome AS nome_usuario, u.endereco AS endereco_usuario
      FROM Pedidos p
      JOIN Usuarios u ON p.usuario_id = u.id
ORDER BY p.data_pedido ASC
    `).all();

    // Parseia o campo itens que está como JSON string
const pedidosFormatados = pedidos.map(pedido => ({
  id: pedido.id,
  usuario_id: pedido.usuario_id,
  nome_usuario: pedido.nome_usuario,
  endereco_usuario: pedido.endereco_usuario,
  itens: JSON.parse(pedido.itens),
  total: pedido.total,
  data_pedido: pedido.data_pedido,
  pagamento: pedido.pagamento, // <-- necessário para mostrar no frontend
  status: pedido.status
}));


    res.json(pedidosFormatados);

  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
    res.status(500).json({ error: 'Erro ao buscar pedidos no banco' });
  }
});




  // Inicializa o servidor
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });