// tests/visitas.test.js
const request = require('supertest');
const express = require('express');


// Configuración básica de Express para pruebas
const app = express();
const visitasRouter = require('../src/routes/visitas.js');

app.use(express.json());
app.use('/visitas', visitasRouter);


describe('API de visitas', () => {
  // Test GET todas las visitas
  it('debería devolver todas las visitas', async () => {
    const res = await request(app).get('/visitas');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test POST crear visita
  it('debería crear una nueva visita', async () => {
    const nuevaVisita = {
      id: 'EXP001',
      codigo: '2026000001',
      nombre: 'Empresa XYZ',
      rfc: 'XYZ123456789',
      estatus: 'ab',
      tipo_visita: 'vi',
      tm_control: 'Control 1',
      numexp: 'EXP001',
      fec_aper: '2026-08-13',
      fec_cier: null,
      visitado: 'Sucursal Norte',
      observacion: 'Primera visita de vigilancia'
    };

    const res = await request(app).post('/visitas').send(nuevaVisita);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id', 'EXP001');
  });

  // Test GET visita por ID
  it('debería devolver una visita por ID', async () => {
    const res = await request(app).get('/visitas/EXP001');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', 'EXP001');
  });

  // Test PUT actualizar visita
  it('debería actualizar una visita existente', async () => {
    const res = await request(app)
      .put('/visitas/EXP001')
      .send({ estatus: 'pr' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('estatus', 'pr');
  });

  // Test DELETE eliminar visita
  it('debería eliminar una visita existente', async () => {
    const res = await request(app).delete('/visitas/EXP001');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Visita eliminada');
  });
});
