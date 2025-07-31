import pool from './db';
import bcrypt from 'bcrypt';

export async function getUsers() {
  const result = await pool.query(`
    SELECT 
      users.id, users.name, users.email, users.created_at, users.updated_at,
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

export async function deleteUser(id) {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}

export async function getTasks() {
  const result = await pool.query(`
    SELECT
      t.id,
      t.title,
      t.description,
      t.deadline,
      t.status,
      t.created_by,
      t.created_at,
      cu.name AS created_by_name,
      json_agg(json_build_object(
        'user_id', u.id,
        'user_name', u.name,
        'user_email', u.email,
        'role', r.name
      )) AS assigned_users
    FROM tasks t
    LEFT JOIN users cu ON t.created_by = cu.id
    LEFT JOIN task_assignments ta ON t.id = ta.task_id
    LEFT JOIN users u ON ta.user_id = u.id
    LEFT JOIN roles r ON ta.role_id = r.id
    GROUP BY t.id, cu.name
    ORDER BY t.id ASC;
  `);
  return result.rows;
}

export async function getTaskById(id) {
  const result = await pool.query(`
    SELECT
      t.id,
      t.title,
      t.description,
      t.deadline,
      t.status,
      t.created_by,
      t.created_at,
      json_agg(json_build_object(
        'user_id', u.id,
        'user_name', u.name,
        'user_email', u.email,
        'role', r.name
      )) AS assigned_users
    FROM tasks t
    LEFT JOIN task_assignments ta ON t.id = ta.task_id
    LEFT JOIN users u ON ta.user_id = u.id
    LEFT JOIN roles r ON ta.role_id = r.id
    WHERE t.id = $1
    GROUP BY t.id;
  `, [id]);

  return result.rows[0]; 
}

export async function processUsersAndRoles(client, taskId, userIdList, roleList) {
  const lenUsers = userIdList.length;
  const lenRoles = roleList.length;
  if (lenRoles > lenUsers) {
    roleList = roleList.slice(0, lenUsers);
  }
  else if (lenRoles < lenUsers) {
    const needed = lenUsers - lenRoles;
    roleList = roleList.concat(Array(needed).fill("viewer"));
  }

  //Replace null/undefined roles with "viewer"
  roleList = roleList.map(role => role || "viewer");

  for (let i = 0; i < lenUsers; i++) {
    const userId = userIdList[i];
    const role = roleList[i];

    try {
      // Get role ID for the current role
      const roleRes = await client.query(`SELECT id FROM roles WHERE name = $1`, [role]);
      const roleId = roleRes.rows[0]?.id;

      if (!roleId) {
        console.error(`Role not found: ${role}`);
        continue;
      }

      if (userId) {
        await client.query(
          `INSERT INTO task_assignments (task_id, user_id, role_id)
          VALUES ($1, $2, $3)
          ON CONFLICT (task_id, user_id)
          DO UPDATE SET role_id = EXCLUDED.role_id;
          `,
          [taskId, userId, roleId]
        );
      }
    } catch (error) {
      console.error(`Error processing user ${userId} with role ${role}:`, error);
      // Continue with next iteration even if one fails
    }
  }
}

export async function createTask({ title, description, deadline, created_by, status, userIdList, roleList }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const taskRes = await client.query(
      `
      INSERT INTO tasks (title, description, deadline, created_by, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
      `,
      [title, description, deadline, created_by, status || 'pending']
    );

    const taskId = taskRes.rows[0].id;

    processUsersAndRoles(client, taskId, userIdList, roleList);

    await client.query('COMMIT');
    return taskRes.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function updateTask(id, { title, description, deadline, status, userIdList, roleList }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `
      UPDATE tasks
      SET title = $1, description = $2, deadline = $3, status = $4
      WHERE id = $5
      `,
      [title, description, deadline, status, id]
    );

    processUsersAndRoles(client, id, userIdList, roleList);

    const updatedTaskRes = await client.query(
      `SELECT * FROM tasks WHERE id = $1`,
      [id]
    );

    await client.query('COMMIT');
    return updatedTaskRes.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function assignUserToTask(taskId, userIdList, roleList) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const lenUsers = userIdList.length;
    if (!userIdList || lenUsers == 0) {
      throw new Error('Users not found');
    }

    processUsersAndRoles(client, taskId, userIdList, roleList);

    await client.query('COMMIT');
    return { taskId, userId, roleId };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteTask(id) {
  await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
}
