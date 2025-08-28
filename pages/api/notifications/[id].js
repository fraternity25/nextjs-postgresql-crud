import { 
    getNotificationsByUser, 
    deleteNotification 
} from '@/lib/dataService/notifications';

export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  switch (method) {
    case 'GET':
      try {
        const notifications = await getNotificationsByUser(id);
        res.status(200).json(notifications);
      } catch (err) {
        console.error('[API] Error fetching user notifications:', err);
        res.status(500).json({ error: 'Failed to fetch user notifications' });
      }
      break;

    /* case 'PUT': 
      try {
        const updated = await markNotificationAsRead(id);
        res.status(200).json(updated);
      } catch (err) {
        console.error('[API] Error marking notification as read:', err);
        res.status(500).json({ error: 'Failed to mark notification as read' });
      }
      break; */

    case 'DELETE':
      try {
        const result = await deleteNotification(id);
        res.status(200).json(result);
      } catch (err) {
        console.error('[API] Error deleting notification:', err);
        res.status(500).json({ error: 'Failed to delete notification' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}