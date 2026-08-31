// tests/visitas.test.js
const request = require('supertest');
const express = require('express');

const mockQuery = jest.fn();
jest.mock('../config/db.js', () => ({ query: mockQuery }));

// Configuración básica de Express para pruebas
const app = express();
const visitasRouter = require('../src/routes/visitas.js');

app.use(express.json());
app.use('/visitas', visitasRouter);

describe('API de visitas', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  // Test GET todas las visitas
  it('debería devolver todas las visitas', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ num_expediente: 'EXP001' }] });

    const res = await request(app).get('/visitas');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test POST crear visita
  it('debería crear una nueva visita', async () => {
    const nuevaVisita = {
      tipo_visita: 'vi',
      fec_aper: '2026-08-13',
      control_estatus: 'ab',
      id_visitado: 'Sucursal Norte',
      observacion: 'Primera visita de vigilancia',
      nombre_empleado: 'Inspector Pérez'
    };
    mockQuery.mockResolvedValueOnce({ rows: [{ num_expediente: 'EXP001' }] });

    const res = await request(app).post('/visitas').send(nuevaVisita);
    expect(res.statusCode).toBe(201);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO visitas'),
      expect.arrayContaining(['vi', '2026-08-13', 'ab', 'Sucursal Norte'])
    );
    expect(mockQuery.mock.calls[0][1][0]).toMatch(/^\d{10}$/);
  });

  // Test GET visita por ID
  it('debería devolver una visita por ID', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ num_expediente: 'EXP001' }] });

    const res = await request(app).get('/visitas/EXP001');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('num_expediente', 'EXP001');
  });

  // Test PUT actualizar visita
  it('debería actualizar una visita existente', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ num_expediente: 'EXP001', control_estatus: 'pr' }] });

    const res = await request(app)
      .put('/visitas/EXP001')
      .send({ control_estatus: 'pr' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('control_estatus', 'pr');
  });

  // Test DELETE eliminar visita
  it('debería eliminar una visita existente', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ num_expediente: 'EXP001' }] });

    const res = await request(app).delete('/visitas/EXP001');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Visita eliminada');
  });
});
