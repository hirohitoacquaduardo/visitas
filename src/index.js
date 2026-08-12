const express = require('express');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Backend conectado a la BD', time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error de conexión');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});