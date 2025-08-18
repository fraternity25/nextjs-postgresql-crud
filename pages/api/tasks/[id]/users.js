import { deleteAssignedUsers } from '@/lib/dataService';

export default async function handler(req, res) {
  const { method, query } = req;
  const { id: taskId } = query;

  switch (method) {
    case 'DELETE':
      try {
        const { userIdList } = req.body;

        if (!userIdList || userIdList.length === 0) {
          return res.status(400).json({ error: 'No users provided for deletion' });
        }

        const result = await deleteAssignedUsers(taskId, userIdList);

        res.status(200).json(result);
      } catch (error) {
        console.error('[API] Error deleting assigned users:', error);
        res.status(500).json({ error: 'Failed to delete assigned users' });
      }
      break;

    default:
      res.setHeader('Allow', ['DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
