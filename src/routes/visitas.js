router.post('/', async (req, res) => {
  const { num_expediente, nombre_visitado, rfc, tipo_visita, observacion, fec_aper, fec_cier, nombre_empleado, control_estatus } = req.body;

  if (!tipo_visita || !num_expediente || !nombre_visitado || !rfc) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    // Generar un id_visitado de 10 caracteres (ejemplo: primeros 10 del RFC)
    const idVisitado = rfc.substring(0, 10);

    // Insertar o actualizar en control_visitados
    await pool.query(
      `INSERT INTO control_visitados (id_visitado, nombre_visitado, rfc)
       VALUES ($1, $2, $3)
       ON CONFLICT (id_visitado) DO UPDATE 
       SET nombre_visitado = EXCLUDED.nombre_visitado, rfc = EXCLUDED.rfc`,
      [idVisitado, nombre_visitado, rfc]
    );

    // Insertar en visitas
    await pool.query(
      `INSERT INTO visitas (num_expediente, tipo_visita, fec_aper, fec_cier, control_estatus, id_visitado, observacion, nombre_empleado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [num_expediente, tipo_visita, fec_aper, fec_cier, control_estatus || 'ab', idVisitado, observacion, nombre_empleado]
    );

    // Devolver con JOIN
    const joinResult = await pool.query(
      `SELECT v.num_expediente, v.tipo_visita, v.fec_aper, v.fec_cier, v.control_estatus,
              v.nombre_empleado, v.observacion,
              c.id_visitado, c.nombre_visitado, c.rfc
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
