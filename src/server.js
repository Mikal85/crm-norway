require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');

// Importer ruter
const customerRoutes = require('./routes/customers');
const userRoutes = require('./routes/users');

// Opprett express app
const app = express();

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

// Middleware
app.use(helmet()); // Sikkerhetshoder
app.use(cors()); // CORS støtte
app.use(express.json()); // JSON parsing

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Ruter
app.use('/api/customers', customerRoutes);
app.use('/api/users', userRoutes);

// Grunnleggende helsesjekk
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Feilhåndtering
app.use((err, req, res, next) => {
  logger.error('Uventet feil:', err);
  res.status(500).json({
    error: 'En uventet feil oppstod',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server kjører på port ${PORT}`);
});