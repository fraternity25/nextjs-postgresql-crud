import { createTask } from '@/lib/dataService';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'POST':
      try {
        const { title, description, deadline, status, created_by, userId, role } = req.body;

        if (!title || !description || !userId) {
          return res.status(400).json({ error: 'Title, description and userId are required' });
        }

        const task = await createTask({ title, description, deadline, status, created_by, userId, role });
        res.status(201).json(task);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
