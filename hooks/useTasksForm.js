import { useState } from 'react';
import { useRouter } from 'next/router';

export default function useTasksForm({
  mode = "edit",
  tasks = [],
  userId = "",
  form = "tasks"
}) {
  const router = useRouter();
  //States
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState({});
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState('pending');
  const [selectedUserIdList, setSelectedUserIdList] = useState([userId]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [showTasks, setShowTasks] = useState(mode === "new");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isAssignForm = form === "assign"
  const isCreateForm = form === "create"

  //Handlers
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

  //Renderers
  const renderAssignedUsers = (isNew, tasks) =>
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

  const renderDeadlineAndStatus = (showTasks, tasks, isView) =>
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

  const renderTasks = (showTasks, tasks) =>
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

  return {
    states: {
      users, setUsers,
      roles, setRoles,
      ...(!isAssignForm && !isCreateForm
        ? { 
            title, setTitle,
            description, setDescription,
            deadline, setDeadline,
            status, setStatus, 
            selectedTaskId, setSelectedTaskId,
            showTasks, setShowTasks,
          }
        : isCreateForm && {
            title, setTitle,
            description, setDescription,
          }
        ),
      selectedUserIdList, setSelectedUserIdList,
      loading, setLoading,
      error, setError
    },
    handlers: {
      handleSubmit,
      handleUserChange, 
      ...(!isAssignForm &&
          { 
            handleTitleChange, 
            handleDescriptionChange, 
          }
         ),
      handleRoleChange
    },
    renderers: {
      renderAssignedUsers,
      ...(!isAssignForm && !isCreateForm
        ? { 
            renderDeadlineAndStatus,
            renderTasks
          }
        : isCreateForm ? {
            renderDeadlineAndStatus
          }
        : isAssignForm && {
            renderTasks
          } 
        )
    }
  };
}