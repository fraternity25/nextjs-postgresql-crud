import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import TaskList from '@/components/TaskList';

export default function UserTasksPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userTasks, setUserTasks] = useState([]);

  useEffect(() => {
    if (router.isReady) {
      const { id, userTasks } = router.query;
      if (id && userTasks) {
        fetchUser();
        setUserTasks(JSON.parse(userTasks));
      }
    }
  }, [router.isReady, router.query]);

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
    } finally {
      setLoading(false);
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
