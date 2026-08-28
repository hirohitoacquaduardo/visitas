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
    // Crea la tabla automáticamente si no existe en Render
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visitas (
        num_expedientegit CHAR(10) NOT NULL PRIMARY KEY,
        tipo_visita CHAR(2) NOT NULL,
        fec_aper DATE NOT NULL,
        fec_cier DATE,
        estatus CHAR(2) NOT NULL DEFAULT 'ab',
        visitado VARCHAR(100),
        tm_control TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        observacion TEXT
      );
    `);
    res.json({ message: 'Backend conectado a la BD y tabla verificada' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error de conexión con la BD');
  }
});

app.use('/visitas', visitasRouter);

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});