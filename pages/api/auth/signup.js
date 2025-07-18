import bcrypt from 'bcrypt';
import pool from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, password } = req.body;

  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
      [name, email, hashed]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'User already exists' });
    res.status(500).json({ error: 'Server error' });
  }
}
