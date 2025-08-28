import 'dotenv/config';
import bcrypt from 'bcrypt';
import pool from '@/lib/db.js';

//dotenv.config({ path: '.env.local' });

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role_id INTEGER REFERENCES roles(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        owner_id INTEGER REFERENCES users(id),
        reviewer_id INTEGER REFERENCES users(id),
        status TEXT DEFAULT 'pending'
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Insert initial data
    await client.query(`
      INSERT INTO roles (name)
      VALUES ('admin'), ('editor'), ('viewer')
      ON CONFLICT (name) DO NOTHING;
    `);

    const password = '123a';
    const hashedPassword = await bcrypt.hash(password, 10);

    await client.query(`
      INSERT INTO users (name, email, password, role_id)
      SELECT $1, $2, $3, r.id
      FROM roles r
      WHERE r.name = $4
      ON CONFLICT (email) DO NOTHING;
    `, ['Admin', 'admin@example.com', hashedPassword, 'admin']
    );

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
