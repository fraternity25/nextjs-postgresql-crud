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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        deadline TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER REFERENCES users(id),
        status TEXT DEFAULT 'pending'
      );
    `);

    // Intermediate table for many-to-many relationship: task_assignments
    await pool.query(`
      CREATE TABLE IF NOT EXISTS task_assignments (
        task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role_id INTEGER REFERENCES roles(id),
        PRIMARY KEY (task_id, user_id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
  } catch (err) {
    console.error('❌ Error seeding data:', err);
  } finally {
    await pool.end(); 
  }
}

seed();
