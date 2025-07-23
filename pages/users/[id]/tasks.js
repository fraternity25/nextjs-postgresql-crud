// pages/users/[id]/tasks.js
import Link from 'next/link';

export default function UserTasksPage({ user, tasks }) {
  const userTasks = tasks.filter((task) =>
    task.assigned_users?.some((u) => u.user_id === user.id)
  );

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
