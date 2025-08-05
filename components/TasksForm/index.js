import useTasksForm from '@/hooks/useTasksForm';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AssignForm from './AssignForm';
import CreateForm from './CreateForm'

export default function TasksForm({
  mode = "new",
  tasks = [],
  userId = "",
  onSubmit,
}) {
  const { states, handlers, renderers }= useTasksForm(mode, userId);

  const {
    users, setUsers,
    roles, setRoles,
    title, setTitle,
    description, setDescription,
    deadline, setDeadline,
    status, setStatus,
    selectedUserIdList, setSelectedUserIdList,
    selectedTaskId, setSelectedTaskId,
    showTasks, setShowTasks,
    loading, setLoading,
    error, setError
  } = states;

  const {
    handleSubmit,
    handleUserChange, 
    handleTitleChange, 
    handleDescriptionChange, 
    handleRoleChange
  } = handlers;

  const {
    renderDeadlineAndStatus,
    renderTasks
  } = renderers;

  const { data: session } = useSession();
  const isAdmin = session?.user?.roles?.includes("admin");

  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isNew = mode === "new";

  useEffect(() => {
    if (isNew) {
      setLoading(true); 
      fetchUsers();
    }

    if (isEdit && tasks.length === 1) {
      const t = tasks[0];
      if(userId)
      {
        const au = t.assigned_users.filter((au) => au.user_id == userId)[0];
        setRoles((prev) => ({ ...prev, [selectedUserIdList.at(0)]: au.role }));
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

          {isNew && (
            <div className="flex space-x-3 mb-4">
            <button
                type="button"
                onClick={() => setShowTasks(false)}
                className={`px-3 py-1 border rounded ${
                !showTasks ? "bg-indigo-600 text-white" : "bg-white"
                }`}
            >
                Create New Task
            </button>
            <button
                type="button"
                onClick={() => setShowTasks(true)}
                className={`px-3 py-1 border rounded ${
                showTasks ? "bg-indigo-600 text-white" : "bg-white"
                }`}
            >
                Assign Existing Task
            </button>
            </div>
          )}

          {!isNew && tasks?.length > 0 && (
            <div className="space-y-2">
              {tasks.map((task) => (
                task.assigned_users.length > 0 ? (
                  <>
                    <ul key={task.id}>
                      <h2 className="text-sm font-medium text-gray-700">
                        Assigned users for {task.title}
                      </h2>
                      {task.assigned_users.map((au) => {
                        return (
                          <div
                            key={au.user_id}
                            className="text-sm text-gray-700 border border-gray-200 rounded px-3 py-2"
                          >
                            <div>
                              <strong>Name:</strong> {au.user_name}
                            </div>
                            <div>
                              <strong>Email:</strong> {au.user_email}
                            </div>
                            <div>
                              <strong>Role:</strong> {au.role}
                            </div>
                          </div>
                        );
                      })}
                    </ul> 
                  </>
                ) : (
                  <h2 key={task.id} className="text-sm font-medium text-gray-700">
                    There is no assigned users for {task.title}
                  </h2>
                )
              ))}
            </div>
          )}

          {(!showTasks || tasks?.length == 0) ? (
            <CreateForm 
              mode={mode} 
              tasks={tasks}
              states={{
                users, 
                roles, 
                title,
                description,
                selectedUserIdList,
                loading, 
              }}
              handlers={{
                handleSubmit,
                handleUserChange,
                handleTitleChange,
                handleDescriptionChange,
                handleRoleChange
              }}
              renderDeadlineAndStatus={renderDeadlineAndStatus}
            />
          ) : showTasks && tasks?.length > 0 && (
            <AssignForm 
              mode={mode} 
              tasks={tasks}
              states={{
                users,
                roles,
                selectedUserIdList,
                loading, 
              }}
              handlers={{
                handleSubmit,
                handleUserChange,
                handleRoleChange
              }}
              renderTasks={renderTasks}
            />
          )}
        </div>
      </div>
    </div>
  );
}

