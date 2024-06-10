const express = require('express');
const router = express.Router();
const db = require('../models/transacoes');

router.post('/', async (req, res) => {
  const { tipo, categoria, valor, data, descricao } = req.body;
  const userId = req.session.userId;
  const query = 'INSERT INTO transacoes (user_id, tipo, categoria, valor, data, descricao) VALUES (?, ?, ?, ?, ?, ?)';
  const params = [userId, tipo, categoria, valor, data, descricao];
  try {
    await db.executeQuery(query, params);
    res.redirect('/menu');
  } catch (err) {
    console.error('Erro ao inserir transação:', err);
    res.status(500).send('Erro ao inserir transação');
  }
});

router.get('/', async (req, res) => {
  const userId = req.session.userId;
  const query = 'SELECT * FROM transacoes WHERE user_id = ?';
  try {
    const transacoes = await db.executeQuery(query, [userId]);
    res.render('transacoes', { transacoes });
  } catch (err) {
    console.error('Erro ao buscar transações:', err);
    res.status(500).send('Erro ao buscar transações');
  }
});

module.exports = router;