import pool from './db';
import bcrypt from 'bcrypt';

export async function getUsers() {
  const userIdsResult = await pool.query(`
    SELECT id FROM users ORDER BY id ASC
  `);

  const users = await Promise.all(
    userIdsResult.rows.map(row => getUserById(row.id))
  );

  return users;
}

export async function getUserById(id) {
  const result = await pool.query(`
    SELECT 
      u.id,
      u.name,
      u.email,
      u.created_at,
      u.updated_at,
      r.name AS role,
      COALESCE(
        NULLIF(
          json_agg(
            CASE 
              WHEN t.id IS NOT NULL THEN 
                json_build_object(
                  'task_id', t.id,
                  'title', t.title,
                  'description', t.description,
                  'deadline', t.deadline,
                  'status', t.status,
                  'created_by', t.created_by,
                  'created_at', t.created_at,
                  'creater_name', cu.name,
                  'role', 
                    CASE 
                      WHEN t.owner_id = u.id THEN 'owner'
                      WHEN t.reviewer_id = u.id THEN 'reviewer'
                      ELSE NULL
                    END
                )
              ELSE NULL
            END
          )::text,
          '[null]'
        )::json,
        '[]'::json
      ) AS assigned_tasks
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    LEFT JOIN tasks t ON (t.owner_id = u.id OR t.reviewer_id = u.id)
    LEFT JOIN users cu ON t.created_by = cu.id
    WHERE u.id = $1
    GROUP BY u.id, r.name
    `,
    [id]
  );
  return result.rows[0];
}

//This should be the dynamic version of getUserById
export async function getUserWithFields(id, fields = []) {
  const allFields = {
    id: 'u.id',
    name: 'u.name',
    email: 'u.email',
    created_at: 'u.created_at',
    updated_at: 'u.updated_at',
    role: 'r.name AS role',
    assigned_tasks: `
      COALESCE(
        NULLIF(
          json_agg(
            CASE 
              WHEN t.id IS NOT NULL THEN 
                json_build_object(
                  'task_id', t.id,
                  'title', t.title,
                  'description', t.description,
                  'deadline', t.deadline,
                  'status', t.status,
                  'created_by', t.created_by,
                  'created_at', t.created_at,
                  'creater_name', cu.name,
                  'role',
                    CASE 
                      WHEN t.owner_id = u.id THEN 'owner'
                      WHEN t.reviewer_id = u.id THEN 'reviewer'
                      ELSE NULL
                    END
                )
              ELSE NULL
            END
          )::text,
          '[null]'
        )::json,
        '[]'::json
      ) AS assigned_tasks
    `,
  };


  // Eğer boş gelirse her şeyi al
  const selectedFields =
    fields.length > 0
      ? fields.map((f) => allFields[f]).filter(Boolean)
      : Object.values(allFields);

  // JOIN ihtiyacını kontrol et
  const needsRoles = fields.length === 0 || fields.includes("roles");
  const needsTasks = fields.length === 0 || fields.includes("assigned_tasks");

  // Dinamik join’leri ekle
  const joins = [];
  if (needsRoles) {
    joins.push(`
      LEFT JOIN roles r ON u.role_id = r.id
    `);
  }
  if (needsTasks) {
    joins.push(`
      LEFT JOIN tasks t ON (t.owner_id = u.id OR t.reviewer_id = u.id)
      LEFT JOIN users cu ON t.created_by = cu.id
    `);
  }

  const query = `
    SELECT ${selectedFields.join(", ")}
    FROM users u
    ${joins.join("\n")}
    WHERE u.id = $1
    GROUP BY u.id
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
}

export async function createUser(user) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { name, email, password, role } = user;
    const hashedPassword = await bcrypt.hash(password, 10);

    const roleRes = await client.query(`SELECT id FROM roles WHERE name = $1`, [role]);
    const roleId = roleRes.rows[0]?.id;
    
    if (!roleId) {
      throw new Error(`Role '${role}' not found`);
    }

    // kullanıcıyı role_id ile ekle
    const res = await client.query(
      `INSERT INTO users (name, email, password, role_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, hashedPassword, roleId]
    );

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
    const { name, email, role } = user;
    let roleId;
    if (role) {
      const roleRes = await client.query(`SELECT id FROM roles WHERE name = $1`, [role]);
      roleId = roleRes.rows[0]?.id;
      if (!roleId) {
        throw new Error(`Role '${role}' not found`);
      }
    }

    await client.query('BEGIN');
    await client.query(
      `UPDATE users 
       SET 
         name = $1, email = $2, 
         role_id = $3,
         updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4`,
      [name, email, roleId, id]
    );

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
  // First get all task IDs
  const taskIdsResult = await pool.query(`
    SELECT id FROM tasks ORDER BY id ASC
  `);
  
  // Then fetch each task using getTaskById
  const tasks = await Promise.all(
    taskIdsResult.rows.map(row => getTaskById(row.id))
  );
  
  return tasks;
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
      cu.name AS creater_name,
      -- Owner bilgisi
      json_build_object(
        'id', ou.id,
        'name', ou.name,
        'email', ou.email
      ) AS owner,
      -- Reviewer bilgisi
      json_build_object(
        'id', ru.id,
        'name', ru.name,
        'email', ru.email
      ) AS reviewer
    FROM tasks t
    LEFT JOIN users cu ON t.created_by = cu.id
    LEFT JOIN users ou ON t.owner_id = ou.id
    LEFT JOIN users ru ON t.reviewer_id = ru.id
    WHERE t.id = $1
    `,
    [id]
  );

  return result.rows[0];
}

export async function createTask(taskParams) {
  const { 
    title, description, deadline, created_by, 
    status, owner, reviewer 
  } = taskParams;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const taskRes = await client.query(`
      INSERT INTO tasks (title, description, deadline, created_by, status, owner_id, reviewer_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
      `,
      [
        title, description, deadline, created_by, 
        status || 'pending', owner, reviewer
      ]
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

export async function updateTask(id, taskParams) {
  const { 
    title, description, deadline, 
    status, owner, reviewer 
  } = taskParams;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      UPDATE tasks
      SET title = $1, description = $2, deadline = $3, status = $4, owner_id = $5, reviewer_id = $6
      WHERE id = $7
      `,
      [
        title, description, deadline, 
        status, owner, reviewer, id
      ]
    );

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

export async function assignUserToTask(taskId, owner, reviewer) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (!owner && !reviewer) {
      throw new Error('Owner or Reviewer must be assigned');
    }

    await client.query(`
      UPDATE tasks
      SET owner_id = $1, reviewer_id = $2
      WHERE id = $3
    `, [owner, reviewer, taskId]
    );

    await client.query('COMMIT');
    return { taskId, owner, reviewer };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteAssignedUsers(taskId, owner, reviewer) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (!owner && !reviewer) {
      throw new Error('No users provided for deletion');
    }

    await client.query(`
      UPDATE tasks
      SET ${owner ? 'owner_id = NULL ' : ''} 
          ${reviewer ? ', reviewer_id = NULL' : ''}
      WHERE id = $1
      `,
      [taskId]
    );

    await client.query('COMMIT');
    return { taskId, owner, reviewer };
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
