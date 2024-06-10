const express = require('express');
const app = express();
const path = require('path');
const db = require('./models/bccd.js');
const buscarRouter = require('./routes/buscar');
const transacoesRouter = require('./routes/transacoes');
const bcrypt = require('bcrypt');
const session = require('express-session');
require('dotenv').config();

console.log('SESSION_SECRET:', process.env.SESSION_SECRET);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Middleware de autenticação
const authMiddleware = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
};
//ROTA PRINCIPAL
app.get('/', (req, res) => {
  res.render('layout');
});

//ROTA DE REGISTRO
app.get('/registrar', (req, res) => {
  res.render('registrar');
});

app.post('/registrar', async (req, res) => {
  const { fullName, username, cpf, birthdate, gender, email, phone, password } = req.body;
  if (!fullName || !username || !cpf || !birthdate || !gender || !email || !phone || !password) {
    return res.status(400).send('Todos os campos são obrigatórios');
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = 'INSERT INTO usuarios (nome_completo, username, cpf, data_nascimento, genero, email, telefone, senha) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  const params = [fullName, username, cpf, birthdate, gender, email, phone, hashedPassword];
  try {
    await db.executeQuery(query, params);
    res.redirect('/menu');
  } catch (err) {
    console.error('Erro ao inserir dados no banco de dados:', err);
    res.status(500).send('Erro ao inserir dados no banco de dados');
  }
});

//ROTA DE LOGIN
app.get('/login', (req, res) => {
  const error = req.query.error || null;
  res.render('login', { error });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await db.getUserByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.redirect('/login?error=Credenciais inválidas');
    }
    req.session.userId = user.id;
    req.session.userEmail = user.email; // Adicione o email à sessão
    res.redirect('/menu');
  } catch (err) {
    console.error('Erro ao consultar o banco de dados:', err);
    res.status(500).send('Erro interno do servidor');
  }
});

// Rotas DE MENU
app.get('/menu', authMiddleware, (req, res) => {
  res.render('menu', { email: req.session.userEmail });
});

//ROTAS BUCAS E TRANSACOES EM ARQUIVOS SEPARADOS 
app.use('/buscar', authMiddleware, require('./routes/buscar'));
app.use('/transacoes', authMiddleware, require('./routes/transacoes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));