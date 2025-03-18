const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// Hent alle kunder
router.get('/', async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM customers ORDER BY company_name LIMIT $1 OFFSET $2',
      [req.query.limit || 10, req.query.offset || 0]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Hent kunde med ID
router.get('/:id', async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM customers WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kunde ikke funnet' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Opprett ny kunde
router.post('/', async (req, res, next) => {
  const {
    company_name,
    organization_number,
    website,
    industry,
    address_street,
    address_city,
    address_postal_code,
    address_country
  } = req.body;

  try {
    const result = await query(
      `INSERT INTO customers (
        company_name,
        organization_number,
        website,
        industry,
        address_street,
        address_city,
        address_postal_code,
        address_country
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        company_name,
        organization_number,
        website,
        industry,
        address_street,
        address_city,
        address_postal_code,
        address_country || 'Norge'
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Unik constraint feil
      return res.status(400).json({ error: 'Organisasjonsnummer er allerede registrert' });
    }
    next(err);
  }
});

// Oppdater kunde
router.put('/:id', async (req, res, next) => {
  const {
    company_name,
    organization_number,
    website,
    industry,
    address_street,
    address_city,
    address_postal_code,
    address_country
  } = req.body;

  try {
    const result = await query(
      `UPDATE customers SET
        company_name = COALESCE($1, company_name),
        organization_number = COALESCE($2, organization_number),
        website = COALESCE($3, website),
        industry = COALESCE($4, industry),
        address_street = COALESCE($5, address_street),
        address_city = COALESCE($6, address_city),
        address_postal_code = COALESCE($7, address_postal_code),
        address_country = COALESCE($8, address_country),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9 RETURNING *`,
      [
        company_name,
        organization_number,
        website,
        industry,
        address_street,
        address_city,
        address_postal_code,
        address_country,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kunde ikke funnet' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Organisasjonsnummer er allerede registrert' });
    }
    next(err);
  }
});

// Slett kunde
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await query(
      'DELETE FROM customers WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kunde ikke funnet' });
    }

    res.json({ message: 'Kunde slettet', customer: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;