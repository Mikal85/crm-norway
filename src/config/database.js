const { Pool } = require('pg');
const winston = require('winston');

// Konfigurer logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Database konfigurasjon
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  max: 20, // maksimum antall klienter i poolen
  idleTimeoutMillis: 30000, // hvor lenge en klient kan være inaktiv før den fjernes
  connectionTimeoutMillis: 2000, // hvor lenge å vente på en tilkobling
});

// Test database tilkobling
pool.on('connect', () => {
  logger.info('Database tilkobling opprettet');
});

pool.on('error', (err) => {
  logger.error('Uventet feil på idle klient', err);
  process.exit(-1);
});

// Hjelpefunksjon for å kjøre spørringer
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.info('Utførte spørring', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    logger.error('Feil ved utføring av spørring', { text, error: err.message });
    throw err;
  }
};

// Hjelpefunksjon for å få en klient fra poolen
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = () => {
    client.release();
    logger.info('Database klient frigitt');
  };

  // Sett metoden på klienten for enkel tilgang
  client.query = async (text, params) => {
    const start = Date.now();
    try {
      const res = await query(text, params);
      const duration = Date.now() - start;
      logger.info('Utførte spørring med klient', { text, duration, rows: res.rowCount });
      return res;
    } catch (err) {
      logger.error('Feil ved utføring av klient spørring', { text, error: err.message });
      throw err;
    }
  };

  return { client, release };
};

module.exports = {
  query,
  getClient,
  pool
};