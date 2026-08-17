const express = require('express');
const router = express.Router();
const pool = require('../../config/db'); // Ajusta la ruta a tu db.js

// GET todas las visitas desde la BD
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM visitas');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST crear una nueva visita en PostgreSQL
router.post('/', async (req, res) => {
  const { visitado, tipo_visita, observacion, fec_aper, estatus } = req.body;
  
  // Genera un código único de 10 caracteres (Ej: 2026000001)
  const num_exp = `${new Date().getFullYear()}${Math.floor(100000 + Math.random() * 900000)}`;

  try {
    const result = await pool.query(
      `INSERT INTO visitas (num_exp, tipo_visita, fec_aper, estatus, visitado, observacion) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [num_exp, tipo_visita, fec_aper, estatus || 'ab', visitado, observacion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET visita por número de expediente (id)
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM visitas WHERE num_exp = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;