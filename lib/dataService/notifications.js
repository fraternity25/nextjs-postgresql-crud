import pool from '@/lib/db';

export async function createNotification(userId, message) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO notifications (user_id, message, is_read, created_at)
       VALUES ($1, $2, false, NOW())
       RETURNING *`,
      [userId, message]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getNotifications() {
  const client = await pool.connect();
  try {
    const userIdsResult = await client.query(`
      SELECT id FROM users ORDER BY id ASC
    `);

    const notifications = await Promise.all(
      userIdsResult.rows.map(async (row) => {
        const userNotifications = await getNotificationsByUser(row.id);
        return {
          user_id: row.id,
          notifications: userNotifications,
        };
      })
    );

    return notifications;
  } finally {
    client.release();
  }
}

export async function getNotificationsByUser(userId) {
  const client = await pool.connect();
  try {
    const idsResult = await client.query(
      `SELECT id FROM notifications 
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    const notifications = await Promise.all(
      idsResult.rows.map((row) => getNotificationById(row.id))
    );

    return notifications;
  } finally {
    client.release();
  }
}

export async function getNotificationById(id) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM notifications WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function markAllNotificationsAsRead(userId) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE notifications
       SET is_read = true
       WHERE user_id = $1
       RETURNING *`,
      [userId]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export async function markNotificationAsRead(notificationId) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE notifications
       SET is_read = true
       WHERE id = $1
       RETURNING *`,
      [notificationId]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function deleteNotification(notificationId) {
  const client = await pool.connect();
  try {
    await client.query(`DELETE FROM notifications WHERE id = $1`, [
      notificationId,
    ]);
    return { success: true, id: notificationId };
  } finally {
    client.release();
  }
}