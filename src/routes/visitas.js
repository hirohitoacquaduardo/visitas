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
  const { num_expediente, id_visitado, tipo_visita, observacion, fec_aper, control_estatus, fec_cier, tm_control, nombre_empleado } = req.body;

  // Validación: tipo_visita siempre debe tener valor
  if (!tipo_visita) {
    return res.status(400).json({ error: 'El campo tipo_visita es obligatorio' });
  }

  // Validación: num_expediente debe venir en el body (ya no se genera automático)
  if (!num_expediente) {
    return res.status(400).json({ error: 'El campo num_expediente es obligatorio y debe insertarse manualmente' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO visitas (num_expediente, tipo_visita, fec_aper, fec_cier, control_estatus, id_visitado, tm_control, observacion, nombre_empleado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [num_expediente, tipo_visita, fec_aper, fec_cier, control_estatus || 'ab', id_visitado, tm_control, observacion, nombre_empleado]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error al insertar visita:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET visita por número de expediente
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM visitas WHERE num_expediente = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT actualizar estatus, fecha de cierre y tm_control
router.put('/:id', async (req, res) => {
  const { control_estatus, fec_cier, tm_control } = req.body;

  try {
    const result = await pool.query(
      `UPDATE visitas
       SET control_estatus = COALESCE($1, control_estatus),
           fec_cier = COALESCE($2, fec_cier),
           tm_control = COALESCE($3, tm_control)
       WHERE num_expediente = $4
       RETURNING *`,
      [control_estatus, fec_cier, tm_control, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Visita no encontrada' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error al actualizar visita:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE eliminar una visita
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM visitas WHERE num_expediente = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Visita no encontrada' });
    }

    res.status(200).json({ message: 'Visita eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
