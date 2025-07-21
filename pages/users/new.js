import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import UserForm from '@/components/UserForm';

export default function NewUser() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') return <p>Loading...</p>;
  if (!session || !session.user.roles.includes('admin')) {
    router.push('/');
    return null;
  }
  
  const handleSubmit = async (userData) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create user');
    }

    return response.json();
  };

  return <UserForm onSubmit={handleSubmit} />;
}