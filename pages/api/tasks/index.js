import { getTasks, createTask } from '@/lib/dataService/tasks';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const tasks = await getTasks();
        res.status(200).json(tasks);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
      }
      break;

    case 'POST':
      try {
        const { title, description, deadline, status, created_by, rolesMap: rolesMapEntries } = req.body;
        let ownerId, reviewerId;

        for (const [key, value] of rolesMapEntries) {
          if (value === "owner") {
            ownerId = key;
          } else if (value === "reviewer") {
            reviewerId = key;
          }
        }

        if (!title || !description || !deadline) {
          return res.status(400).json({ error: 'Title, description and deadline are required' });
        }

        const task = await createTask({ title, description, deadline, status, created_by, ownerId, reviewerId });
        res.status(201).json(task);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
