const express = require('express');
const router = express.Router();
const pool = require('../../config/db'); // Ajusta la ruta a tu db.js

// GET todas las visitas con JOIN
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.num_expediente,
             v.tipo_visita,
             v.fec_aper,
             v.fec_cier,
             v.control_estatus,
             v.nombre_empleado,
             v.observacion,
             c.id_visitado,
             c.nombre_visitado,
             c.rfc
      FROM visitas v
      LEFT JOIN control_visitados c
             ON v.id_visitado = c.id_visitado
      ORDER BY v.fec_aper DESC
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error al listar visitas:", err);
    res.status(500).json({ error: "Error al listar visitas" });
  }
});

// POST crear una nueva visita en PostgreSQL
router.post('/', async (req, res) => {
  const { num_expediente, nombre_visitado, rfc, tipo_visita, observacion, fec_aper, control_estatus, fec_cier, nombre_empleado } = req.body;

  if (!tipo_visita) {
    return res.status(400).json({ error: 'El campo tipo_visita es obligatorio' });
  }
  if (!num_expediente) {
    return res.status(400).json({ error: 'El campo num_expediente es obligatorio' });
  }
  if (!nombre_visitado || !rfc) {
    return res.status(400).json({ error: 'Debes proporcionar nombre_visitado y rfc' });
  }

  try {
    // Paso 1: asegurar que el visitado existe en control_visitados
    const visitadoResult = await pool.query(
      `INSERT INTO control_visitados (id_visitado, nombre_visitado, rfc)
       VALUES ($1, $2, $3)
       ON CONFLICT (id_visitado) DO UPDATE SET nombre_visitado = EXCLUDED.nombre_visitado, rfc = EXCLUDED.rfc
       RETURNING id_visitado`,
      [rfc, nombre_visitado, rfc] // usamos RFC como id_visitado
    );

    const idVisitadoFinal = visitadoResult.rows[0].id_visitado;

    // Paso 2: insertar en visitas
    await pool.query(
      `INSERT INTO visitas (num_expediente, tipo_visita, fec_aper, fec_cier, control_estatus, id_visitado, observacion, nombre_empleado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [num_expediente, tipo_visita, fec_aper, fec_cier, control_estatus || 'ab', idVisitadoFinal, observacion, nombre_empleado]
    );

    // Paso 3: devolver el expediente con JOIN
    const joinResult = await pool.query(
      `SELECT v.num_expediente,
              v.tipo_visita,
              v.fec_aper,
              v.fec_cier,
              v.control_estatus,
              v.nombre_empleado,
              v.observacion,
              c.id_visitado,
              c.nombre_visitado,
              c.rfc
       FROM visitas v
       LEFT JOIN control_visitados c ON v.id_visitado = c.id_visitado
       WHERE v.num_expediente = $1`,
      [num_expediente]
    );

    res.status(201).json(joinResult.rows[0]);
  } catch (err) {
    console.error("Error al insertar visita:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET visita por número de expediente
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.num_expediente,
              v.tipo_visita,
              v.fec_aper,
              v.fec_cier,
              v.control_estatus,
              v.nombre_empleado,
              v.observacion,
              c.id_visitado,
              c.nombre_visitado,
              c.rfc
       FROM visitas v
       LEFT JOIN control_visitados c ON v.id_visitado = c.id_visitado
       WHERE v.num_expediente = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT actualizar estatus y fecha de cierre
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