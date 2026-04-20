const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  db.query('SELECT * FROM pets', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

router.post('/', (req, res) => {
  const { nome, especie, idade, tutor } = req.body;
  const sql = 'INSERT INTO pets (nome, especie, idade, tutor) VALUES (?, ?, ?, ?)';
  db.query(sql, [nome, especie, idade, tutor], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ id: result.insertId, ...req.body });
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nome, especie, idade, tutor } = req.body;
  const sql = 'UPDATE pets SET nome = ?, especie = ?, idade = ?, tutor = ? WHERE id = ?';
  db.query(sql, [nome, especie, idade, tutor, id], (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM pets WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});

module.exports = router;
