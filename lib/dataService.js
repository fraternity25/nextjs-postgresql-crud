import pool from './db';
import bcrypt from 'bcrypt';

export async function getUsers() {
  const result = await pool.query(`
    SELECT 
      users.id, users.name, users.email, users.created_at,
      ARRAY_AGG(roles.name) AS roles
    FROM users
    LEFT JOIN user_roles ON users.id = user_roles.user_id
    LEFT JOIN roles ON user_roles.role_id = roles.id
    GROUP BY users.id
    ORDER BY users.id ASC
  `);
  return result.rows;
}

export async function getUserById(id) {
  const result = await pool.query(
    `
    SELECT 
      users.id, users.name, users.email, users.created_at, users.updated_at,
      ARRAY_AGG(roles.name) AS roles
    FROM users
    LEFT JOIN user_roles ON users.id = user_roles.user_id
    LEFT JOIN roles ON user_roles.role_id = roles.id
    WHERE users.id = $1
    GROUP BY users.id
    `,
    [id]
  );
  return result.rows[0];
}

export async function createUser(user) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { name, email, password, roles } = user;

    const hashedPassword = await bcrypt.hash(password, 10);
    const res = await client.query(
      `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`,
      [name, email, hashedPassword]
    );

    const userId = res.rows[0].id;

    if (Array.isArray(roles)) {
      for (const roleName of roles) {
        const roleRes = await client.query(`SELECT id FROM roles WHERE name = $1`, [roleName]);
        const roleId = roleRes.rows[0]?.id;

        if (roleId) {
          await client.query(
            `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`,
            [userId, roleId]
          );
        }
      }
    }

    await client.query('COMMIT');
    return res.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      throw new Error('A user with this email already exists.');
    }
    throw error;
  } finally {
    client.release();
  }
}

/*export async function createUser(user) {
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
  
}*/

export async function updateUser(id, user) {
  const client = await pool.connect();
  try {
    const { name, email, roles } = user;

    await client.query('BEGIN');

    // Kullanıcıyı güncelle
    await client.query(
      `UPDATE users SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
      [name, email, id]
    );

    if (roles && Array.isArray(roles)) {
      // Mevcut rollerin hepsini sil
      await client.query('DELETE FROM user_roles WHERE user_id = $1', [id]);

      // Yeni rolleri ekle
      for (const roleName of roles) {
        const roleRes = await client.query(`SELECT id FROM roles WHERE name = $1`, [roleName]);
        const roleId = roleRes.rows[0]?.id;
        if (roleId) {
          await client.query(`INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`, [id, roleId]);
        }
      }
    }

    await client.query('COMMIT');

    // Güncellenmiş kullanıcıyı döndür
    return await getUserById(id);

  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      throw new Error('A user with this email already exists.');
    }
    throw error;
  } finally {
    client.release();
  }
}

/*export async function updateUser(id, user) {
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
}*/

export async function deleteUser(id) {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}

export async function createTask({ title, description, deadline, created_by, status, userId, role }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Görevi oluştur
    const taskRes = await client.query(
      `
      INSERT INTO tasks (title, description, deadline, created_by, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
      `,
      [title, description, deadline || null, created_by, status || 'pending']
    );

    const taskId = taskRes.rows[0].id;

    // 2. Rol id'sini bul
    const roleRes = await client.query(`SELECT id FROM roles WHERE name = $1`, [role]);
    const roleId = roleRes.rows[0]?.id;

    // 3. Atama tablosuna ekle
    await client.query(
      `
      INSERT INTO task_assignments (task_id, user_id, role_id)
      VALUES ($1, $2, $3);
      `,
      [taskId, userId, roleId]
    );

    await client.query('COMMIT');
    return taskRes.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

