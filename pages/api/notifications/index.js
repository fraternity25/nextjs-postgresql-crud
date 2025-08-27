import { createNotification, getNotifications } from '@/lib/dataService/notifications';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const notifications = await getNotifications();
        res.status(200).json(notifications);
      } catch (err) {
        console.error('[API] Error fetching notifications:', err);
        res.status(500).json({ error: 'Failed to fetch notifications' });
      }
      break;

    case 'POST':
      try {
        const { userId, message } = req.body;
        if (!userId || !message) {
          return res.status(400).json({ error: 'userId and message required' });
        }
        const notification = await createNotification(userId, message);
        res.status(201).json(notification);
      } catch (err) {
        console.error('[API] Error creating notification:', err);
        res.status(500).json({ error: 'Failed to create notification' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}