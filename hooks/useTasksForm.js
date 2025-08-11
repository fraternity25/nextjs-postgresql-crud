import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export default function useTasksForm({
  mode = "edit",
  tasks = [],
  userId = "",
  form = "tasks",
  onSubmit
}) {
  const router = useRouter();
  //States
  const [users, setUsers] = useState([]);
  const [rolesMap, setRolesMap] = useState(new Map());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState('pending');
  const [selectedUserIdList, setSelectedUserIdList] = useState(userId ? [userId] : []);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [showTasks, setShowTasks] = useState(form !== "create");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: session } = useSession();
  const isAdmin = session?.user?.roles?.includes("admin");

  const isAssignForm = form === "assign"
  const isCreateForm = form === "create"

  useEffect(() => {
    if (mode === "edit" && tasks.length === 1) {
      const t = tasks[0];
      if (t) {
        setSelectedTaskId(prev => prev !== t.id ? t.id : prev);
        setTitle(prev => prev !== t.title ? t.title : prev);
        setDescription(prev => prev !== t.description ? t.description : prev);
        const au = t.assigned_users.find(au => au.user_id == userId);
        setRolesMap(prev => {
          if (prev.get(userId) !== au?.role) {
            const newMap = new Map(prev);
            newMap.set(userId, au?.role);
            return newMap;
          }
          return prev;
        });
      }
    }
  }, [mode, tasks, userId]);

  /*useEffect(() => {
    if(mode === "edit" && tasks.length == 1)
    {
      const t = tasks[0];
      if(t){
        setSelectedTaskId(t.id);
        setTitle(t.title);
        setDescription(t.description);
        const au = t.assigned_users.find((au) => au.user_id == userId);
        setRolesMap(prev => {
          const newMap = new Map(prev);
          newMap.set(userId, au.role); 
          return newMap;
        });
      }
    }
  }, [mode, tasks, userId])*/

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
    const userId = e.target.value;
    const last = selectedUserIdList.at(-1);
    setSelectedUserIdList(prev => 
      [...prev.slice(0, -1), userId]
      //prev.includes(userId) ? prev : [...prev, userId]
    );
    
    // Update map if user doesn't exist
    const task = tasks.find((task) => task.id === selectedTaskId);
    const au = task.assigned_users.find((au) => au.user_id == userId);
    if(!au && !rolesMap.has(userId)){
      setRolesMap(prev => {
        const newMap = new Map(prev);
        if (last && newMap.has(last)) {
            newMap.delete(last);
        }
        newMap.set(userId, "viewer"); // Default role
        return newMap;
      });
    }
    else if (au) {
      setRolesMap(prev => {
        const newMap = new Map(prev);
        if (last && newMap.has(last)) {
            newMap.delete(last);
        }
        newMap.set(userId, au.role); 
        return newMap;
      });
    }
  };

  const handleTitleChange = (e) => setTitle(e.target.value)
  const handleDescriptionChange = (e) => setDescription(e.target.value)

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    const userId = selectedUserIdList.at(-1);
    
    setRolesMap(prev => {
      const newMap = new Map(prev);
      newMap.set(userId, newRole);
      return newMap;
    });
  };

  //Renderers
  const renderAssignedUsers = (isNew, tasks) =>
  {
    if(!isNew && tasks?.length > 0)  
    {
      return (
        <div className="space-y-2">
        {tasks.map((task) => (
          task.assigned_users.length > 0 ? (
            <ul key={task.id}>
              <h2 className="text-sm font-medium text-gray-700">
                Assigned users for {task.title}
              </h2>
              {task.assigned_users.map((au) => {
                return (
                  <div
                    key={au.user_id}
                    className="w-full text-sm text-gray-700 border border-gray-300 rounded-md shadow-sm mt-1 py-2 px-3"
                  >
                    <div className='flex justify-between items-center'>
                      <div className=''>
                        {au.user_name} ({au.user_email})
                      </div>
                      <div className=''>
                        {au.role}
                      </div>
                    </div>
                  </div>
                );
              })}
            </ul> 
          ) : (
            <h2 key={task.id} className="text-sm font-medium text-gray-700">
              There is no assigned users for {task.title}
            </h2>
          )
        ))}
        </div>
      );
    }
  }

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
      rolesMap, setRolesMap,
      ...(!isAssignForm && !isCreateForm
        ? { 
            title, setTitle,
            description, setDescription,
            setDeadline,
            setStatus, 
            setSelectedTaskId,
            showTasks, setShowTasks,
          }
        : isCreateForm && {
            title, setTitle,
            description, setDescription,
          }
        ),
      selectedUserIdList,
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