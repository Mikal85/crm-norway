require('dotenv').config();
const { pool, query } = require('../config/database');

describe('Database tilkobling', () => {
  afterAll(async () => {
    await pool.end();
  });

  test('kan koble til databasen', async () => {
    const result = await query('SELECT NOW()');
    expect(result.rows).toHaveLength(1);
  });

  test('kan hente brukertabellen', async () => {
    const result = await query('SELECT * FROM users LIMIT 1');
    expect(result).toBeDefined();
  });
});