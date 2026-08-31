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
    const result = await pool.query('SELECT * FROM visitas WHERE num_expediente = $1', [req.params.id]);
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
  const { tipo_visita, fec_aper, fec_cier, control_estatus, id_visitado, tm_control, observacion, num_expediente, nombre_empleado } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO visitas (tipo_visita, fec_aper, fec_cier, control_estatus, id_visitado, tm_control, observacion, num_expediente, nombre_empleado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [tipo_visita, fec_aper, fec_cier, control_estatus || 'ab', id_visitado, tm_control, observacion, num_expediente, nombre_empleado]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Actualizar visita
exports.updateVisita = async (req, res) => {
  const { id } = req.params;
  const { tipo_visita, fec_aper, fec_cier, control_estatus, id_visitado, tm_control, observacion, nombre_empleado } = req.body;
  try {
    const result = await pool.query(
      `UPDATE visitas SET tipo_visita=$1, fec_aper=$2, fec_cier=$3, control_estatus=$4, id_visitado=$5, tm_control=$6, observacion=$7, nombre_empleado=$8
       WHERE num_expediente=$9 RETURNING *`,
      [tipo_visita, fec_aper, fec_cier, control_estatus, id_visitado, tm_control, observacion, nombre_empleado, id]
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
    const result = await pool.query('DELETE FROM visitas WHERE num_expediente=$1 RETURNING *', [req.params.id]);
    if (result.rows.length > 0) {
      res.json({ message: 'Visita eliminada' });
    } else {
      res.status(404).json({ error: 'Visita no encontrada' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
