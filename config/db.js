const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL || (
  process.env.DB_HOST && process.env.DB_HOST.startsWith('postgres')
    ? process.env.DB_HOST
    : null
);

const connectionConfig = databaseUrl
  ? {
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    };

const mainPool = new Pool(connectionConfig);

const readPool = new Pool(
  databaseUrl
    ? connectionConfig
    : {
        ...connectionConfig,
        user: process.env.DB_READ_USER || process.env.DB_USER,
        password: process.env.DB_READ_PASSWORD || process.env.DB_PASSWORD,
      }
);

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
