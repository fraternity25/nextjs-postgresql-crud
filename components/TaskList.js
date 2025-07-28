import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function TaskList({ user, tasks }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.roles?.includes('admin');

  if (!user || !tasks) return <p className="p-6">Loading...</p>;
  if (tasks.length === 0) 
  {
    return ( 
      <p 
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        No tasks assigned.
      </p>
    );
  }
    

  /*return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tasks for {user.name}</h1>
      <ul className="space-y-2">
        {tasks.map((task) => (
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
    </div>
  );*/

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Assigned Tasks for {user.name}</h2>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li key={task.id}>
            <Link
              href={isAdmin ? `/tasks/${task.id}/edit` : '#'}
              className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                !isAdmin ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
              aria-disabled={!isAdmin}
              tabIndex={!isAdmin ? -1 : undefined}
            >
              Edit Task #{task.id}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
