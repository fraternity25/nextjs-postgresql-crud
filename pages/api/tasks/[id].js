import { 
  getTaskById, 
  updateTask, 
  deleteTask,
  assignUserToTask
} from '@/lib/dataService';

export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;
  
  console.log('[API] /api/tasks/[id] called with id:', id); // 🪵 1

  switch (method) {
    case 'GET':
      try {
        const task = await getTaskById(id);
        console.log('[API] Found task:', task); // 🪵 2
        if (!task) {
          console.log('[API] Task not found!');
          return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json(task);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch task' });
      }
      break;

    case 'PUT':
      try {
        const { title, description, deadline, status, created_by, userIdList, roleList } = req.body;

        if (!title || !description ||!deadline)
          return res.status(400).json({ error: 'Title, description and deadline are required' });

        const updatedTask = await updateTask(id, {
          title,
          description,
          deadline,
          status,
          created_by,
          userIdList,
          roleList,
        });

        res.status(200).json(updatedTask);
      } catch (error) {
        console.error('[API] Error fetching task:', error); // 🪵 3
        console.error(error);
        res.status(500).json({ error: error.message });
      }
      break;

    case 'PATCH':
      try {
        const { userIdList, roleList } = req.body;
        console.log("api/tasks/id-patch:")
        console.log("userIdList:")
        console.log(userIdList)
        console.log("roleList:")
        console.log(roleList)

        if (!userIdList || !roleList) {
          return res.status(400).json({ error: 'userIdList and roleList are required' });
        }

        // task_assignments tablosuna insert
        assignUserToTask(id, userIdList, roleList);

        res.status(200).json({ id, userIdList, roleList });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
      break;

    case 'DELETE':
      try {
        await deleteTask(id);
        res.status(204).end();
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete task' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
