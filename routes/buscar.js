const express = require('express');
const router = express.Router();
const connection = require('../models/bccd');

// Rota de busca
router.get('/search', (req, res) => {
    connection.query('SELECT * FROM usuarios', (error, results) => {
        if (error) {
            throw error;
        }
        res.send(results);
    });
});

module.exports = router;