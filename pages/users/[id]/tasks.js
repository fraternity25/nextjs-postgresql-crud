import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import TaskList from '@/components/TaskList';

export default function UserTasksPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userTasks, setUserTasks] = useState([]);

  useEffect(() => {
    if (router.isReady) {
      const { user, userTasks } = router.query;
      if (user && userTasks) {
        setUser(JSON.parse(user));
        setUserTasks(JSON.parse(userTasks));
      }
    }
  }, [router.isReady, router.query]);

  if (!user) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto"> {/* Centering container */}
        <TaskList user={user} tasks={userTasks} />
      </div>
    </div>
  );
}
