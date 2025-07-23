import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';

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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tasks for {user.name}</h1>
      {userTasks.length === 0 ? (
        <p>No tasks assigned.</p>
      ) : (
        <ul className="space-y-2">
          {userTasks.map((task) => (
            <li key={task.id}>
              <Link
                href={`/tasks/${task.id}/edit`}
                className="text-indigo-600 hover:underline"
              >
                Edit Task #{task.id}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
