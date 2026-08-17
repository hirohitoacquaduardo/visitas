// controllers/visitasController.js
const pool = require('../config/db');

// Obtener todas las visitas
exports.getVisitas = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM visitas ORDER BY fec_aper DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener una visita por ID
exports.getVisitaById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM visitas WHERE id = $1', [req.params.id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Visita no encontrada' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear nueva visita
exports.createVisita = async (req, res) => {
  const { id, codigo, nombre, rfc, estatus, tipo_visita, tm_control, numexp, fec_aper, fec_cier, visitado, observacion } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO visitas (id, codigo, nombre, rfc, estatus, tipo_visita, tm_control, numexp, fec_aper, fec_cier, visitado, observacion)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [id, codigo, nombre, rfc, estatus, tipo_visita, tm_control, numexp, fec_aper, fec_cier, visitado, observacion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Actualizar visita
exports.updateVisita = async (req, res) => {
  const { id } = req.params;
  const { codigo, nombre, rfc, estatus, tipo_visita, tm_control, numexp, fec_aper, fec_cier, visitado, observacion } = req.body;
  try {
    const result = await pool.query(
      `UPDATE visitas SET codigo=$1, nombre=$2, rfc=$3, estatus=$4, tipo_visita=$5, tm_control=$6, numexp=$7, fec_aper=$8, fec_cier=$9, visitado=$10, observacion=$11
       WHERE id=$12 RETURNING *`,
      [codigo, nombre, rfc, estatus, tipo_visita, tm_control, numexp, fec_aper, fec_cier, visitado, observacion, id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Visita no encontrada' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar visita
exports.deleteVisita = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM visitas WHERE id=$1 RETURNING *', [req.params.id]);
    if (result.rows.length > 0) {
      res.json({ message: 'Visita eliminada' });
    } else {
      res.status(404).json({ error: 'Visita no encontrada' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
