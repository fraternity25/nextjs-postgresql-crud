import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function TaskList({ user, tasks }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.roles?.includes('admin');

  if (!user || !tasks) return <p className="p-6">Loading...</p>;

  return (
    <div className="space-y-2">
    {
      tasks.length > 0 ? (
        <>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Assigned Tasks for {user.name}
          </h2>
          <ol>
            {tasks.map((task) => (
              <li 
                key={task.id}
                className="text-sm text-gray-700 border border-gray-300 rounded-md shadow-sm m-1"  
              >
                <Link
                  href={{
                    pathname: isAdmin ? `/tasks/${task.id}/edit` : '#',
                    query: isAdmin ? { userId: user.id } : null
                  }}
                  className={`flex flex-col md:flex-row md:justify-between md:items-center 
                    block border border-gray-300 rounded-md shadow-sm py-2 px-3 
                    focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm 
                    ${!isAdmin ?
                      'pointer-events-none opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                    }
                  `}
                  aria-disabled={!isAdmin}
                  tabIndex={!isAdmin ? -1 : undefined}
                >
                  {/* First "row" for small screens, becomes part of one flex row on larger screens */}
                  <div className="flex flex-row md:flex-row md:items-center md:space-x-4 mb-2 md:mb-0">
                    <span className="text-sm font-medium text-gray-900">
                      {task.title}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      Status: {task.status}
                    </span>
                  </div>
                  
                  {/* Second "row" for small screens, becomes part of one flex row on larger screens */}
                  <div className="flex flex-row md:flex-row md:items-center md:space-x-4">
                    <span className="text-sm font-medium text-gray-700">
                      Created: {new Date(task.created_at).toLocaleString("en-US", {
                        hour12: false,
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      Deadline: {new Date(task.deadline).toLocaleString("en-US", {
                        hour12: false,
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      Created by: {task.creater_name}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <h2 className="text-sm font-medium text-gray-700">
          There is no assigned tasks for {user.name}
        </h2>
      )
    }
    </div>
  );
}