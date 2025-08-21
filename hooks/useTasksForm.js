import UserList from '@/components/UserList';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export default function useTasksForm({
  mode,
  context,
  tasks = [],
  userId = "",
  form = "tasks",
  onSubmit
}) {
  const router = useRouter();
  //States
  const { users, error, setError, loading, setLoading } = context;
  const [rolesMap, setRolesMap] = useState(new Map());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState('pending');
  const [selectedUserId, setSelectedUserId] = useState(Number(userId) ?? 0);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [showTasks, setShowTasks] = useState(form !== "create" && tasks.length > 0);

  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isNew = mode === "new";
  const isFirst = tasks.length === 0 && isNew;
  const singleTask = useMemo(() => (isEdit && tasks.length === 1 ? tasks[0] : null), [isEdit, tasks]);

  useEffect(() => {
    if (singleTask) {
      const now = new Date();
      setSelectedTaskId(singleTask.id);
      setTitle(singleTask.title);
      setDescription(singleTask.description);
      setStatus(singleTask.status);
      setDeadline(now < new Date(singleTask.deadline) ? 
        singleTask.deadline?.split("T")[0] : 
        now.toISOString().split("T")[0]
      );
      if(userId){
        const role = singleTask.owner.id == userId ? 
          "owner" : singleTask.reviewer.id == userId ? 
          "reviewer" : null;
        setSelectedRole(role);
      }
    }
  }, [singleTask, userId]);

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
          rolesMap: rolesMap,
          created_by: session?.user?.id,
        });
      }
      router.push("/tasks");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (e) => {
    const userId = Number(e.target.value);
    if(!userId) {
      setSelectedUserId(null);
      return;
    }
    setSelectedUserId(userId);
    
    const task = singleTask || tasks.find((task) => task.id == selectedTaskId);
    const role = task ? 
      (
        task.owner.id == userId ? 
        "owner" : task.reviewer.id == userId ? 
        "reviewer" : null
      ) 
      : null;
    console.log("task = ", task);
    if(!rolesMap.has(userId) && !role){
      setSelectedRole("");
    }
    else if(rolesMap.has(userId)) {
      setSelectedRole(rolesMap.get(userId));
    }
    else if (role) {
      setSelectedRole(role);
    }
  };

  const handleRoleChange = (e) => setSelectedRole(e.target.value)
  const handleTitleChange = (e) => setTitle(e.target.value)
  const handleDescriptionChange = (e) => setDescription(e.target.value)
  const handleShowTasksChange = () => setShowTasks(!showTasks)

  const handleAddUser = () => {
    const task = singleTask || tasks.find((task) => task.id == selectedTaskId);
    const role = task?.owner.id == selectedUserId ? 
      "owner" : task?.reviewer.id == selectedUserId ? 
      "reviewer" : null;
    const otherId = role === "owner" ? task?.reviewer.id : task?.owner.id;
    console.log("role = ", role);

    setRolesMap(prev => {
      const newMap = new Map(prev);
      if(!role) {
        for (const [userId, role] of newMap.entries()) {
          if (role === selectedRole) {
            newMap.delete(userId);
          }
        }
        newMap.set(selectedUserId, selectedRole);
      }
      else if(selectedRole === role) {
        newMap.delete(selectedUserId);
        newMap.delete(otherId);
        /* Array.from(newMap.entries())
          .filter(([userId, role]) => role === selectedRole)
          .forEach(([userId]) => newMap.delete(userId)); */
      }
      else if(selectedRole === "owner") {
        newMap.set(selectedUserId, "owner");
        newMap.set(task.owner.id, "reviewer");
      } 
      else if(selectedRole === "reviewer") {
        newMap.set(selectedUserId, "reviewer");
        newMap.set(task.reviewer.id, "owner");
      } 
      return newMap;
    });
  };

  //Renderers
  const renderAssignedUsers = () =>
  {
    if((showTasks || isEdit) && selectedTaskId)  
    {
      const task = tasks.find((task) => task.id == selectedTaskId)
      return (
        <UserList task={task} mode="view" />
      );
    }
  }

  const renderUserSelection = () =>
  {
    return (
      <div className="space-y-2">
        <ol className="w-full text-sm text-gray-700">
          {rolesMap.size > 0 &&
            Array.from(rolesMap.entries()).map(([user_id, role]) => (
              <li
                key={user_id}
                className={`w-full text-sm text-gray-700 border border-gray-300 rounded-md shadow-sm mt-1 mb-2 py-2 px-3`}
              >
                <div className='flex justify-between items-center'>
                  {users.find(u => u.id == user_id)?.name} ({users.find(u => u.id == user_id)?.email})
                  <div>
                    {role}
                  </div>
                </div>
              </li>
            ))
          }
        </ol>
      </div>
    );
  }

  const renderDeadlineAndStatus = () =>
    (!showTasks || tasks?.length == 0) && (
      <>
        <label
          htmlFor="deadline"
          className="mt-1 block text-sm font-medium text-gray-700"
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
          className="block text-sm font-medium text-gray-700 mt-1"
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
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </>
    );

  const renderTasks = () => {
    console.log("selectedTaskId = ", selectedTaskId);
    return (
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
    ));
  }

  return {
    states: {
      users,
      rolesMap,
      title, 
      description, 
      showTasks, 
      selectedUserId,
      selectedRole,
      loading, setLoading,
      error, setError,
    },
    handlers: {
      handleSubmit,
      handleUserChange, 
      handleTitleChange, 
      handleDescriptionChange, 
      handleShowTasksChange,
      handleRoleChange,
      handleAddUser
    },
    renderers: {
      renderAssignedUsers,
      renderUserSelection,
      renderDeadlineAndStatus,
      renderTasks
    },
    controls: {
      isView,
      isEdit,
      isNew,
      isFirst
    }
  };
}