require('dotenv').config(); // Carga de variables de entorno

const dns = require('dns');

// Forzar a Node.js a preferir IPv4 sobre IPv6
dns.setDefaultResultOrder('ipv4first')

const express = require('express');
const cors = require('cors');
const pool = require('../config/db'); // Se importa la conexión como 'pool'
const visitasRouter = require('./routes/visitas');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Habilita CORS para conectar el HTML/Frontend
app.use(express.json()); // Corregido: express.json() en lugar de json()

// Rutas
app.get('/', async (req, res) => {
  try {
    // 1. Crear primero la tabla dependiente (control_visitados)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS control_visitados (
        id_visitado VARCHAR(10) PRIMARY KEY,
        nombre_visitado VARCHAR(100) NOT NULL,
        rfc VARCHAR(13)
      );
    `);

    // 2. Crear la tabla principal (visitas) que hace referencia a control_visitados
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visitas (
        num_expediente VARCHAR(10) PRIMARY KEY,  
        tipo_visita CHAR(2) NOT NULL,             
        fec_aper DATE NOT NULL,                   
        fec_cier DATE,                            
        control_estatus CHAR(2) NOT NULL DEFAULT 'ab', 
        id_visitado VARCHAR(10) NOT NULL,            
        tm_control TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        observacion TEXT,                         
        nombre_empleado VARCHAR(100),
        CONSTRAINT fk_visitado FOREIGN KEY (id_visitado)
            REFERENCES control_visitados(id_visitado)
            ON UPDATE CASCADE
            ON DELETE RESTRICT
      );
    `);

    res.json({ message: 'Backend conectado a Supabase y tablas verificadas' });
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