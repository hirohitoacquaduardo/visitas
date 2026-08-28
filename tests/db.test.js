const mockQuery = jest.fn();

jest.mock('pg', () => ({
  Pool: jest.fn(() => ({ query: mockQuery })),
}));

const { getData, insertData, adminTask, query } = require('../config/db.js');

describe('funciones de base de datos', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  it('getData devuelve las filas de productos', async () => {
    const rows = [{ id: 1, nombre: 'Producto', precio: 10 }];
    mockQuery.mockResolvedValueOnce({ rows });

    await expect(getData()).resolves.toEqual(rows);
    expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM productos');
  });

  it('insertData inserta y devuelve el producto creado', async () => {
    const product = { id: 1, nombre: 'Producto', precio: 10 };
    mockQuery.mockResolvedValueOnce({ rows: [product] });

    await expect(insertData('Producto', 10)).resolves.toEqual(product);
    expect(mockQuery).toHaveBeenCalledWith(
      'INSERT INTO productos(nombre, precio) VALUES($1, $2) RETURNING *',
      ['Producto', 10]
    );
  });

  it('adminTask ejecuta VACUUM FULL y devuelve la respuesta', async () => {
    const response = { command: 'VACUUM' };
    mockQuery.mockResolvedValueOnce(response);

    await expect(adminTask()).resolves.toBe(response);
    expect(mockQuery).toHaveBeenCalledWith('VACUUM FULL');
  });

  it('query delega la consulta al pool principal', async () => {
    const response = { rows: [] };
    mockQuery.mockResolvedValueOnce(response);

    await expect(query('SELECT 1', [1])).resolves.toBe(response);
    expect(mockQuery).toHaveBeenCalledWith('SELECT 1', [1]);
  });
});
