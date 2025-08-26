import TasksLayout from '@/components/TasksLayout';
import UsersLayout from '@/components/UsersLayout';
import TasksForm from '@/components/TasksForm';
import { useTasks } from '@/contexts/TasksContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

function NewTaskContent() {
  const { tasks } = useTasks(); 
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'loading' && (!session || session.user.role !== "admin")) {
      router.push('/');
    }
  }, [status, session]);

  if (status === 'loading') return <p className="p-6">Loading...</p>;

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
    <UsersLayout>
      <TasksForm
        onSubmit={onSubmit}
        tasks={tasks}
      />
    </UsersLayout>
  );
}

export default function NewTask() {
  return (
    <TasksLayout>
      <NewTaskContent />
    </TasksLayout>
  );
}
