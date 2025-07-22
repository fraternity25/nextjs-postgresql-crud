import { createUser } from '@/lib/dataService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method allowed' });
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }

  try {
    await createUser({
      name,
      email,
      password,
      roles: ['viewer'] // yeni kullanıcıya varsayılan role
    });

    return res.status(201).json({ message: 'User created' });

  } catch (err) {
    console.error('Signup error:', err);
    if (err.message.includes('already exists')) {
      return res.status(409).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

