import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import TasksForm from '@/components/TasksForm';

export default function TaskPage() {
  const { query } = useRouter();
  const [task, setTask] = useState(null);

  useEffect(() => {
    if (!query.id) return;

    fetch(`/api/tasks/${query.id}`)
      .then(res => res.json())
      .then(data => {
        console.log('Fetched task:', data); // 🪵
        setTask(data);
      })
      .catch(err => console.error(err));
  }, [query.id]);

  if (!task) return <div>Loading...</div>;

  return <TasksForm task={task} mode="edit" />;
}
