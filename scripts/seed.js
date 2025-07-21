import 'dotenv/config';
import bcrypt from 'bcrypt';
import pool from '../lib/db.js';

async function seed() {
  try {
    // Hash password
    const password = '123a';
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Add admin user (skip if exist)
    await pool.query(`
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO NOTHING;
    `, ['Admin', 'admin@example.com', hashedPassword]);

    // 2. Rolls
    const roles = ['admin', 'editor', 'viewer'];
    for (const role of roles) {
      await pool.query(`
        INSERT INTO roles (name)
        VALUES ($1)
        ON CONFLICT (name) DO NOTHING;
      `, [role]);
    }

    // 3. Assign admin role to admin@example.com
    await pool.query(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT u.id, r.id
      FROM users u, roles r
      WHERE u.email = $1 AND r.name = $2
      ON CONFLICT DO NOTHING;
    `, ['admin@example.com', 'admin']);
  } catch (err) {
    console.error('❌ Error seeding data:', err);
  } finally {
    await pool.end(); 
  }
}

seed();
