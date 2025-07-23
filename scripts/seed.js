import 'dotenv/config';
import bcrypt from 'bcrypt';
import pool from '../lib/db.js';

//dotenv.config({ path: '.env.local' });

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Create tables in correct order
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, role_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        deadline DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER REFERENCES users(id),
        status TEXT DEFAULT 'pending'
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS task_assignments (
        task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role_id INTEGER REFERENCES roles(id),
        PRIMARY KEY (task_id, user_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // 2. Insert initial data
    const password = '123a';
    const hashedPassword = await bcrypt.hash(password, 10);

    await client.query(`
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO NOTHING;
    `, ['Admin', 'admin@example.com', hashedPassword]);

    await client.query(`
      INSERT INTO roles (name)
      VALUES ('admin'), ('editor'), ('viewer')
      ON CONFLICT (name) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT u.id, r.id
      FROM users u, roles r
      WHERE u.email = $1 AND r.name = $2
      ON CONFLICT DO NOTHING;
    `, ['admin@example.com', 'admin']);

    await client.query('COMMIT');
    console.log('✅ Database seeded successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
