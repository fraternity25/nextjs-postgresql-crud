import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import TaskForm from '@/components/TaskForm';

export default function AssignTask() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') return <p>Loading...</p>;
  if (!session || !session.user.roles.includes('admin')) {
    router.push('/');
    return null;
  }

  const handleSubmit = async (formData) => {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to assign task');
    }

    return response.json();
  };

  return (
    <TaskForm
      onSubmit={handleSubmit}
      mode='new'
    />
  );
}
