import UsersLayout from "@/components/UsersLayout";
import TasksLayout from "@/components/TasksLayout";
import UsersContext from "@/contexts/UsersContext";
import TasksContext from "@/contexts/TasksContext";
import UserActionSelect from "@/components/UserActionSelect";
import ConfirmModal from "@/components/ConfirmModal";
import Toast from "@/components/Toast";
import { useState, useEffect, useContext } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

function UsersPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { users, setUsers, error, setError } = useContext(UsersContext); 
  const { tasks } = useContext(TasksContext); 
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [toastMessages, setToastMessages] = useState([]);

  const isAdmin = session?.user?.role === "admin";

  // Giriş yapılmamışsa auth sayfasına yönlendir
  useEffect(() => {
    if (status === "unauthenticated" && !session) {
      router.push("/auth");
    } 
  }, [status]);

  const deleteUser = async (id) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      const idleTasks = tasks.filter((task) => {
        const res = (task.owner.id == id && !task.reviewer.id) || 
          (task.reviewer.id == id && !task.owner.id)
        return res;
      });

      if (idleTasks.length > 0) {
        setToastMessages([
          {
            type: "h1",
            content:
              "After deleting user, there are no users left working on these tasks: ",
          },
          {
            type: "ul",
            content: idleTasks.map((task) => `${task.title}`),
          },
        ]);
      }

      setUsers(users.filter((user) => user.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setShowConfirmModal(false);
      setSelectedUserId(null);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl py-4 mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-bold text-black">Users</h1>
          <p className="mt-2 text-md font-semibold text-gray-800">
            A list of all users in the system including their name and email.
          </p>
        </div>
      </div>

      <div 
        className="flex flex-col inline-block min-w-full align-middle 
        py-2 mt-2 -my-2 -mx-4 overflow-x-auto sm:-mx-6 md:px-6 lg:-mx-8 lg:px-8"
      >
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wide"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wide"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wide"
                >
                  Created
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wide"
                >
                  Role
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {new Date(user.created_at).toLocaleString("en-US", {
                      hour12: false,
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {user.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {isAdmin && (
                      <UserActionSelect
                        user={user}
                      />
                    )}
                    {/*
                      <UserActionSelect
                        user={user}
                        tasks={tasks}
                        mode="view"
                      />
                    */}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setSelectedUserId(user.id);
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
                  message="Are you sure you want to delete this user?"
                  onConfirm={() => deleteUser(selectedUserId)}
                  onCancel={() => {
                    setSelectedUserId(null);
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

          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <UsersLayout>
      <TasksLayout>
        <UsersPageContent />
      </TasksLayout>
    </UsersLayout>
  );
}