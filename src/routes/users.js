const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const bcrypt = require('bcrypt');

// Hent alle brukere (uten passordhash)
router.get('/', async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, email, first_name, last_name, role, created_at, updated_at FROM users ORDER BY last_name, first_name',
      []
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Hent bruker med ID (uten passordhash)
router.get('/:id', async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, email, first_name, last_name, role, created_at, updated_at FROM users WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bruker ikke funnet' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Opprett ny bruker
router.post('/', async (req, res, next) => {
  const {
    email,
    password,
    first_name,
    last_name,
    role
  } = req.body;

  try {
    // Hash passord
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const result = await query(
      `INSERT INTO users (
        email,
        password_hash,
        first_name,
        last_name,
        role
      ) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, role, created_at`,
      [email, password_hash, first_name, last_name, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'E-postadresse er allerede registrert' });
    }
    next(err);
  }
});

// Oppdater bruker
router.put('/:id', async (req, res, next) => {
  const {
    email,
    password,
    first_name,
    last_name,
    role
  } = req.body;

  try {
    let password_hash;
    if (password) {
      const saltRounds = 10;
      password_hash = await bcrypt.hash(password, saltRounds);
    }

    const result = await query(
      `UPDATE users SET
        email = COALESCE($1, email),
        password_hash = COALESCE($2, password_hash),
        first_name = COALESCE($3, first_name),
        last_name = COALESCE($4, last_name),
        role = COALESCE($5, role),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 RETURNING id, email, first_name, last_name, role, updated_at`,
      [email, password_hash, first_name, last_name, role, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bruker ikke funnet' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'E-postadresse er allerede registrert' });
    }
    next(err);
  }
});

// Slett bruker
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id, email, first_name, last_name, role',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bruker ikke funnet' });
    }

    res.json({ message: 'Bruker slettet', user: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;