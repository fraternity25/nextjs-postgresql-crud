import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import TasksForm from '@/components/TasksForm';

export default function AssignTask() {
  const [tasks, setTasks] = useState([]);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      const { tasks } = router.query;
      if (tasks) {
        setTasks(JSON.parse(tasks));
      }
    }
  }, [router.isReady, router.query]);

  if (!session || !session.user.roles.includes('admin')) {
    router.push('/');
    return null;
  }

  if (tasks.length === 0 || status === 'loading') return <p className="p-6">Loading...</p>;

  const handleSubmit = async (formData) => {
    const isExistingTask = !!formData.task_id;

    const response = await fetch(
      isExistingTask ? `/api/tasks/${formData.task_id}` : '/api/tasks',
      {
        method: isExistingTask ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to assign task');
    }

    return response.json();
  };

  return (
    <TasksForm
      onSubmit={handleSubmit}
      tasks={tasks}
      mode='new'
    />
  );
}
