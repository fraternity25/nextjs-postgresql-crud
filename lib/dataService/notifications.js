import pool from '@/lib/db';

export async function createNotification(userId, message, type) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO notifications (user_id, message, type, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [userId, message, type]
    );
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getNotifications() {
  const userIdsResult = await pool.query(`
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
}

export async function getNotificationsByUser(userId) {
  const idsResult = await pool.query(
    `SELECT id FROM notifications 
      WHERE user_id = $1
      ORDER BY created_at DESC`,
    [userId]
  );

  const notifications = await Promise.all(
    idsResult.rows.map((row) => getNotificationById(row.id))
  );

  return notifications;
}

export async function getNotificationById(id) {
  const result = await pool.query(
    `SELECT * FROM notifications WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function deleteNotification(notificationId) {
  await pool.query(`DELETE FROM notifications WHERE id = $1`, [
    notificationId,
  ]);
  return { success: true, id: notificationId };
}