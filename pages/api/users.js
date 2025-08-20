import { getUsers } from '../../lib/dataService';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const users = await getUsers();
        res.status(200).json(users);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch users' });
      }
      break;
    /* case 'POST':
      const { name, email, role, password} = req.body;

      if (!name || !email || !role || !password) {
        return res.status(400).json({ error: 'Name, email, role and password are required' });
      }

      try {
        const newUser = await createUser({ name, email, role, password });
        res.status(201).json(newUser);
      } catch (err) {
        console.error(err);
        if (err.message.includes('already exists')) {
          return res.status(409).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
      }
      break; */
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
