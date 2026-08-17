const express = require('express');
const app = express();
const visitasRouter = require('./routes/visitas');

app.use(express.json());
app.use('/visitas', visitasRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
