const { Pool } = require('pg');

// Detecta si se proporcionó una URL completa o si DB_HOST contiene la URL de Postgres
const databaseUrl = process.env.DATABASE_URL || (
  process.env.DB_HOST && process.env.DB_HOST.startsWith('postgres')
    ? process.env.DB_HOST
    : null
);

// Configuración base de conexión con soporte SSL obligatorio para Supabase
const connectionConfig = databaseUrl
  ? {
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false }, // Habilita SSL para variables individuales
    };

// Pool principal
const mainPool = new Pool(connectionConfig);

// Pool de lectura
const readPool = new Pool(
  databaseUrl
    ? connectionConfig
    : {
        ...connectionConfig,
        user: process.env.DB_READ_USER || process.env.DB_USER,
        password: process.env.DB_READ_PASSWORD || process.env.DB_PASSWORD,
      }
);

// Pool de escritura
const writePool = new Pool(
  databaseUrl
    ? connectionConfig
    : {
        ...connectionConfig,
        user: process.env.DB_WRITE_USER || process.env.DB_USER,
        password: process.env.DB_WRITE_PASSWORD || process.env.DB_PASSWORD,
      }
);

async function getData() {
  const res = await readPool.query('SELECT * FROM productos');
  return res.rows;
}

async function insertData(nombre, precio) {
  const res = await writePool.query(
    'INSERT INTO productos(nombre, precio) VALUES($1, $2) RETURNING *',
    [nombre, precio]
  );
  return res.rows[0];
}

async function adminTask() {
  const res = await mainPool.query('VACUUM FULL');
  return res;
}

module.exports = {
  query: (...args) => mainPool.query(...args),
  getData,
  insertData,
  adminTask,
};