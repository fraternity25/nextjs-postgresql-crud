import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import TasksForm from '@/components/TasksForm';

export default function AssignTask() {
  const [tasks, setTasks] = useState([]);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    fetchTasks();
  }, []);

  if (!session || !session.user.roles.includes('admin')) {
    router.push('/');
    return null;
  }

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (tasks.length === 0 || status === 'loading') return <p className="p-6">Loading...</p>;

  const onSubmit = async (formData) => {
    const isExistingTask = !!formData.task_id;
    const body = JSON.stringify({
                    ...formData,
                    rolesMap: Array.from(formData.rolesMap.entries()) // [[key1,val1],[key2,val2]]
                  });

    const response = await fetch(
      isExistingTask ? `/api/tasks/${formData.task_id}` : '/api/tasks',
      {
        method: isExistingTask ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
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
      onSubmit={onSubmit}
      tasks={tasks}
      mode='new'
    />
  );
}
