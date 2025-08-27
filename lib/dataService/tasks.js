import pool from '@/lib/db';

export async function createTask(taskParams) {
  const { 
    title, description, deadline, created_by, 
    status, ownerId, reviewerId 
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
        status || 'pending', ownerId, reviewerId
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

export async function updateTask(id, taskParams) {
  const { 
    title, description, deadline, 
    status, ownerId, reviewerId 
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
        status, ownerId, reviewerId, id
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

export async function assignUserToTask(taskId, ownerId, reviewerId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (!ownerId && !reviewerId) {
      throw new Error('owner or reviewer must be assigned');
    }
    const setClauses = [];
    const params = [];
    let paramIndex = 1;

    if (ownerId) {
      setClauses.push(`owner_id = $${paramIndex}`);
      params.push(ownerId);
      paramIndex++;
    }

    if (reviewerId) {
      setClauses.push(`reviewer_id = $${paramIndex}`);
      params.push(reviewerId);
      paramIndex++;
    }

    params.push(taskId); // taskId is always the last parameter

    const queryString = `
      UPDATE tasks
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
    `;

    await client.query(queryString, params);
    await client.query('COMMIT');
    return { taskId, ownerId, reviewerId };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteAssignedUsers(taskId, deleteOwner, deleteReviewer) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const setClauses = [];
    if (deleteOwner) {
      setClauses.push('owner_id = NULL');
    }
    if (deleteReviewer) {
      setClauses.push('reviewer_id = NULL');
    }
    
    if (setClauses.length === 0) {
      throw new Error('No users provided for deletion');
    }

    const queryString = `
      UPDATE tasks
      SET ${setClauses.join(', ')}
      WHERE id = $1
    `;

    await client.query(queryString, [taskId]);
    await client.query('COMMIT');
    return { taskId, deleteOwner, deleteReviewer };
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