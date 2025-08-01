import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import UserActionSelect from '@/components/UserActionSelect';
import ConfirmModal from '@/components/ConfirmModal';
import Toast from '@/components/Toast';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [toastMessages, setToastMessages] = useState([]);

  const roles = session?.user?.roles || [];
  const isAdmin = roles.includes('admin');

  // Giriş yapılmamışsa auth sayfasına yönlendir
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
    }
    else if(status === 'authenticated') {
      fetchUsers();
      fetchTasks();
    }
  }, [status]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } 
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error('Task fetch error:', err);
    }
  };

  const deleteUser = async (id) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      const idleTasks = tasks.filter((task) =>
        task.assigned_users?.length === 1 &&
        task.assigned_users[0].user_id === id
      );

      if (idleTasks.length > 0) {
        setToastMessages(
          [
            {
              type:"h1", 
              content:"After deleting user, there are no users left working on these tasks: "
            },
            {
              type:"ul",
              content:idleTasks.map(task => `${task.title}`)
            }
          ]
        );
      }

      setUsers(users.filter(user => user.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setShowConfirmModal(false);
      setSelectedUserId(null);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Users</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all users in the system including their name and email.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <div className="flex gap-2">
              {isAdmin && (
                <Link
                  href={{
                    pathname: "/tasks/new",
                    query: { tasks: JSON.stringify(tasks)}
                  }}
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                >
                  Assign Task
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: '/auth' })}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Roles
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleString('en-US', {
                            hour12: false,
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(user.roles || []).join(', ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {isAdmin && (
                            <UserActionSelect user={user} tasks={tasks} mode="edit"/>
                          )}
                          <UserActionSelect user={user} tasks={tasks} mode="view"/>
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setSelectedUserId(user.id);
                                setShowConfirmModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 ml-4"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {showConfirmModal && (
                      <ConfirmModal
                        message="Are you sure you want to delete this user?"
                        onConfirm={() => deleteUser(selectedUserId)}
                        onCancel={() => {
                          setSelectedUserId(null);
                          setShowConfirmModal(false);
                        }}
                      />
                    )}
                    { toastMessages.length !== 0 && (
                      <Toast messages={toastMessages} time={5000} onClose={() => setToastMessages([])} />
                    )}
                  </tbody>
                </table>
                
                {users.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No users found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}