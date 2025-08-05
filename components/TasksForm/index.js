import useTasksFormState from '@/hooks/useTasksFormState';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import AssignForm from './AssignForm';
import CreateForm from './CreateForm'

export default function TasksForm({
  mode = "new",
  tasks = [],
  userId = null,
  onSubmit,
}) {
  const states = useTasksFormState(mode, userId);
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
  /*const [users, setUsers] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUserIdList, setSelectedUserIdList] = useState([userId] || "");
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [showTasks, setShowTasks] = useState(mode === "new");
  const [deadline, setDeadline] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [status, setStatus] = useState("pending");
  const [roles, setRoles] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");*/
  const router = useRouter();

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
      const au = t.assigned_users.filter((au) => au.user_id == userId)[0];
      setTitle(t.title);
      setDescription(t.description);
      setDeadline(
        t.deadline?.split("T")[0] || new Date().toISOString().split("T")[0]
      );
      setStatus(t.status || "pending");
      setRoles((prev) => ({ ...prev, [selectedUserIdList]: au.role }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (onSubmit) {
        await onSubmit({
          ...(showTasks
            ? { task_id: selectedTaskId }
            : {
                title,
                description,
                deadline,
                status,
              }),
          userIdList: selectedUserIdList,
          roleList: roles,
          created_by: session?.user?.id,
        });
      }
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (e) => {
    const userId = e.target.value;
    setSelectedUserIdList(userId);
    if (!roles[userId]) {
      setRoles((prev) => ({ ...prev, [userId]: "viewer" }));
    }
  };

  const handleTitleChange = (e) => setTitle(e.target.value)
  const handleDescriptionChange = (e) => setDescription(e.target.value)

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setRoles((prev) => ({ ...prev, [selectedUserIdList]: newRole }));
  };

  const renderDeadlineAndStatus = () =>
    (!showTasks || tasks?.length == 0) && (
      <>
        <label
          htmlFor="deadline"
          className="block text-sm font-medium text-gray-700"
        >
          Deadline
        </label>
        <input
          disabled={isView}
          id="deadline"
          type="date"
          min={new Date().toISOString().split("T")[0]}
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
        />

        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700"
        >
          Status
        </label>
        <select
          disabled={isView}
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </>
    );

  const renderTasks = () =>
    showTasks &&
    tasks?.length > 0 && (
      <>
        <div className="space-y-2 mt-6">
          <label
            htmlFor="selectTask"
            className="block text-sm font-medium text-gray-700"
          >
            Select a Task
          </label>
          <select
            id="selectTask"
            className="w-full border rounded px-3 py-2 text-sm"
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            required
          >
            <option value="">-- Select a task --</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </div>
      </>
    );

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

          {(!showTasks || tasks?.length == 0) ? (
            <CreateForm 
              mode={mode} 
              handleSubmit={handleSubmit} 
              handleUserChange={handleUserChange}
              handleTitleChange={handleTitleChange}
              handleDescriptionChange={handleDescriptionChange}
              handleRoleChange={handleRoleChange}
              renderDeadlineAndStatus={renderDeadlineAndStatus}
              renderTasks={renderTasks}
              tasks={tasks}
              states={{
                users, 
                roles, 
                title,
                description,
                selectedUserIdList,
                loading, 
              }}
            />
          ) : showTasks && tasks?.length > 0 && (
            <AssignForm 
              mode={mode} 
              handleSubmit={handleSubmit} 
              handleUserChange={handleUserChange}
              handleRoleChange={handleRoleChange}
              renderDeadlineAndStatus={renderDeadlineAndStatus}
              renderTasks={renderTasks}
              tasks={tasks}
              states={{
                users,
                roles,
                selectedUserIdList,
                loading, 
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

