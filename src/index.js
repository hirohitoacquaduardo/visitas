const express = require('express');
const cors = require('cors'); // Requerir CORS
const pool = require('../config/db');
const visitasRouter = require('./routes/visitas');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Habilita CORS para conectar el HTML/Frontend
app.use(express.json());

// Rutas
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Backend conectado a la BD', time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error de conexión');
  }
});

app.use('/visitas', visitasRouter);

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});