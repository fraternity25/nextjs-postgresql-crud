import useTasksForm from '@/hooks/useTasksForm';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import CreateForm from './CreateForm'

export default function TasksForm({
  mode = "new",
  tasks = [],
  userId = "",
  onSubmit,
}) {
  const { states, handlers, renderers, controls }= useTasksForm({mode:mode, tasks:tasks, userId:userId, onSubmit:onSubmit});

  const {
    users, setUsers,
    rolesMap, setRolesMap,
    title, setTitle,
    description, setDescription,
    setDeadline,
    setStatus,
    selectedUserIdList, 
    setSelectedTaskId,
    showTasks, 
    loading, setLoading,
    error, setError
  } = states;

  const {
    handleSubmit,
    handleUserChange, 
    handleTitleChange, 
    handleDescriptionChange, 
    handleShowTasksChange,
    handleRoleChange
  } = handlers;

  const {
    renderAssignedUsers,
    renderDeadlineAndStatus,
    renderTasks
  } = renderers;

  const {
    isView,
    isEdit,
    isNew
   } = controls;

  const { data: session } = useSession();
  const isAdmin = session?.user?.roles?.includes("admin");

  useEffect(() => {
    if (isNew) {
      setLoading(true); 
      fetchUsers();
    }

    if (isEdit && tasks.length === 1) {
      const t = tasks[0];
      if(userId)
      {
        const au = t.assigned_users.find((au) => au.user_id == userId);
        setRolesMap(prev => {
          const newMap = new Map(prev);
          newMap.set(selectedUserIdList.at(0), au.role);
          return newMap;
        });
      }
      setSelectedTaskId(t.id);
      setTitle(t.title);
      setDescription(t.description);
      setDeadline(
        t.deadline?.split("T")[0] || new Date().toISOString().split("T")[0]
      );
      setStatus(t.status || "pending");
    }
  }, [tasks]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow rounded-lg px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {isView ? "View Task" : isEdit ? "Edit Task" : "Assign Task"}
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          <CreateForm 
            states={{
              users, 
              rolesMap, 
              title,
              description,
              selectedUserIdList,
              showTasks,
              loading, 
            }}
            handlers={{
              handleSubmit,
              handleUserChange,
              handleTitleChange,
              handleDescriptionChange,
              handleShowTasksChange,
              handleRoleChange
            }}
            renderers={{
              renderAssignedUsers,
              renderDeadlineAndStatus,
              renderTasks
            }}
            controls={{
              isView,
              isEdit,
              isNew
            }}
          />
        </div>
      </div>
    </div>
  );
}

