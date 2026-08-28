const express = require('express');
const app = express();

app.use(express.json());

const visitasRouter = require('./routes/visitas'); // ajusta la ruta
app.use('/visitas', visitasRouter);

app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));
