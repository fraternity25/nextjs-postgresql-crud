import pool from './db';

export async function getUsers() {
  const res = await pool.query('SELECT * FROM users ORDER BY id ASC');
  return res.rows;
}

export async function getUserById(id) {
  const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return res.rows[0];
}

export async function createUser(user) {
  try {
    const { name, email } = user;
    const res = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    return res.rows[0];
  }
  catch(error) {
    if (error.code === '23505') {
      // 23505: unique_violation in PostgreSQL
      throw new Error('A user with this email already exists.');
    }
    throw error;
  }
  
}

export async function updateUser(id, user) {
  try {
    const { name, email } = user;
    const res = await pool.query(
      `UPDATE users SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
      [name, email, id]
    );
    return res.rows[0];
  }
  catch(error) {
    if (error.code === '23505') {
      // 23505: unique_violation in PostgreSQL
      throw new Error('A user with this email already exists.');
    }
    throw error;
  }
}

export async function deleteUser(id) {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}
