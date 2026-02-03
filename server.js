require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ifsdb';

const pool = new Pool({ connectionString: DATABASE_URL });

async function ensureTable() {
  const create = `
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `;
  await pool.query(create);
}

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/items', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch items' });
  }
});

app.post('/api/items', async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  try {
    const result = await pool.query(
      'INSERT INTO items (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to create item' });
  }
});

app.put('/api/items/:id', async (req, res) => {
  const id = req.params.id;
  const { name, description } = req.body;
  try {
    const result = await pool.query(
      'UPDATE items SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to update item' });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query('DELETE FROM items WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.json({ deleted: true, item: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to delete item' });
  }
});

const port = process.env.PORT || 3000;

ensureTable()
  .then(() => {
    app.listen(port, () => console.log(`Server listening on port ${port}`));
  })
  .catch((err) => {
    console.error('Failed to ensure database table:', err);
    process.exit(1);
  });
