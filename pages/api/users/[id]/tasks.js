import { deleteAssignedTasks } from "@/lib/dataService";

export default async function handler(req, res) {
  const { method, query } = req;
  const { id: userId } = query;

  switch (method) {
    case 'DELETE':
      try {
        const { selectedTaskIdList } = req.body;
        console.log("selectedTaskIdList (API) = ", selectedTaskIdList);

        if (!selectedTaskIdList || selectedTaskIdList.length === 0) {
          return res.status(400).json({ error: 'No tasks provided for deletion' });
        }

        const result = await deleteAssignedTasks(userId, selectedTaskIdList);

        res.status(200).json(result);
      } catch (error) {
        console.error('[API] Error deleting assigned tasks:', error);
        res.status(500).json({ error: 'Failed to delete assigned tasks' });
      }
      break;

    default:
      res.setHeader('Allow', ['DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}