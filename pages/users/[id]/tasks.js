import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import TaskList from '@/components/TaskList';

export default function UserTasksPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userTasks, setUserTasks] = useState([]);

  const { id, userTasks:tasksQuery } = router.query;

  useEffect(() => {
    if (id && tasksQuery) {
      fetchUser();
      setUserTasks(JSON.parse(tasksQuery));
    }
  }, [id, tasksQuery]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto"> {/* Centering container */}
        <TaskList user={user} tasks={userTasks} />
      </div>
    </div>
  );
}
