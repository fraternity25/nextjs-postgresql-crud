import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method allowed' });
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const userRes = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
      [name, email, hashedPassword]
    );
    const userId = userRes.rows[0].id;

    const roleRes = await pool.query(
      'SELECT id FROM roles WHERE name = $1',
      ['user']
    );
    const roleId = roleRes.rows[0]?.id;

    if (roleId) {
      await pool.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
        [userId, roleId]
      );
    }

    return res.status(201).json({ message: 'User created' });

  } catch (err) {
    console.error('Signup error:', err);
    if (err.code === '23505') return res.status(409).json({ error: 'User already exists' });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
