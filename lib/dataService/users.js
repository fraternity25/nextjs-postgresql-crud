import pool from '@/lib/db';
import bcrypt from 'bcrypt';

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

export async function deleteAssignedTasks(userId, selectedTaskIdList) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (!selectedTaskIdList || selectedTaskIdList.length === 0) {
      throw new Error('No tasks provided for deletion');
    }

    // owner_id veya reviewer_id eşleşiyorsa NULL yap
    const queryString = `
      UPDATE tasks
      SET
        owner_id = CASE WHEN owner_id = $1 THEN NULL ELSE owner_id END,
        reviewer_id = CASE WHEN reviewer_id = $1 THEN NULL ELSE reviewer_id END
      WHERE id = ANY($2::int[])
    `;

    await client.query(queryString, [userId, selectedTaskIdList]);
    await client.query('COMMIT');

    return { userId, unassignedTasks: selectedTaskIdList };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}