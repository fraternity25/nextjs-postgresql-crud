import {
  getUserById,
  updateUser,
  deleteUser,
} from '../../../lib/dataService';

export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  switch (method) {
    case 'GET':
      try {
        const user = await getUserById(id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json(user);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch user' });
      }
      break;

    case 'PUT':
      try {
        const { name, email } = req.body;
        if (!name || !email)
          return res.status(400).json({ error: 'Name and email are required' });

        const updated = await updateUser(id, { name, email });
        res.status(200).json(updated);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
      }
      break;

    case 'DELETE':
      try {
        await deleteUser(id);
        res.status(204).end();
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete user' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
