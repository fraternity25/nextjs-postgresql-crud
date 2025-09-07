import TasksLayout from '@/components/layouts/TasksLayout';
import TaskActionSelect from '@/components/selects/TaskActionSelect';
import ConfirmModal from '@/components/ConfirmModal';
import Toast from '@/components/Toast';
import Link from 'next/link';
import { useTasks } from '@/contexts/TasksContext';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

function TasksContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { tasks, setTasks, error, setError } = useTasks();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [toastMessages, setToastMessages] = useState([]);

  const isAdmin = session?.user?.role === "admin";

  // Giriş yapılmamışsa auth sayfasına yönlendir
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
    } 
  }, [status, router]);

  const deleteTask = async (id) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setShowConfirmModal(false);
      setSelectedTaskId(null);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (!session) return null;

  if (error) {
    return (
      <div className="flex items-center justify-center text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Tasks</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all tasks and their assigned users.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <div className="flex gap-2">
            {isAdmin && (
              <Link
                href="/tasks/new"
                className="inline-flex items-center justify-center rounded-md 
                border border-transparent bg-indigo-600 px-4 py-2 text-sm 
                font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none 
                focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
              >
                Create or Assign Task
              </Link>
            )}
          </div>
        </div>
      </div>

      <div 
        className="flex flex-col inline-block min-w-full overflow-x-auto 
        align-middle py-2 md:px-6 lg:px-8 mt-8 -my-2 -mx-4 sm:-mx-6 lg:-mx-8"
      >
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Deadline
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {task.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.creater_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(task.created_at).toLocaleString("en-US", {
                      hour12: false,
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(task.deadline).toLocaleString("en-US", {
                      hour12: false,
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  {/*
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(task.assigned_users || [])
                          .map((user) => user.name)
                          .join(", ") || "—"}
                      </td>
                  */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {isAdmin && (
                      <TaskActionSelect
                        task={task}
                      />
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setSelectedTaskId(task.id);
                          setShowConfirmModal(true);
                        }}
                        className="inline-flex items-center ml-4 px-4 py-2 border border-transparent 
                        rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {showConfirmModal && (
                <ConfirmModal
                  message="Are you sure you want to delete this task?"
                  onConfirm={() => deleteTask(selectedTaskId)}
                  onCancel={() => {
                    setSelectedTaskId(null);
                    setShowConfirmModal(false);
                  }}
                />
              )}
              {toastMessages.length !== 0 && (
                <Toast
                  messages={toastMessages}
                  time={5000}
                  onClose={() => setToastMessages([])}
                />
              )}
            </tbody>
          </table>

          {tasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No tasks found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  return (
    <TasksLayout>
      <TasksContent />
    </TasksLayout>
  );
}
