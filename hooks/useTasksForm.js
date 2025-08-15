import UserList from '@/components/UserList';
import { useEffect, useState } from 'react';
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
  const [selectedUserIdList, setSelectedUserIdList] = useState(userId ? [userId] : []);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [showTasks, setShowTasks] = useState(form !== "create");


  const { data: session } = useSession();
  const isAdmin = session?.user?.roles?.includes("admin");

  const isCreateForm = form === "create" 

  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isNew = mode === "new";

  useEffect(() => {
    if (isEdit && tasks.length === 1) {
      const t = tasks[0];
      const now = new Date();
      if (t) {
        setSelectedTaskId(prev => prev !== t.id ? t.id : prev);
        setTitle(prev => prev !== t.title ? t.title : prev);
        setDescription(prev => prev !== t.description ? t.description : prev);
        setStatus(prev => prev !== t.status ? t.status : prev);
        setDeadline(prev => prev !== t.deadline?.split("T")[0] && now < new Date(t.deadline) ? t.deadline?.split("T")[0] : prev);
      }
      if(userId){
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
  }, [isEdit, tasks, userId]);

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
    if(!userId) {
      setSelectedUserIdList([]);
      return;
    }
    const last = selectedUserIdList.at(-1);
    setSelectedUserIdList(prev => 
      [...prev.slice(0, -1), userId]
      //prev.includes(userId) ? prev : [...prev, userId]
    );
    
    // Update map if user doesn't exist
    const task = tasks.find((task) => task.id == selectedTaskId);
    const au = task?.assigned_users.find((au) => au.user_id == userId);
    console.log("task = ", task);
    console.log("au = ",au);
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
  const handleShowTasksChange = () => setShowTasks(!showTasks)

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
      rolesMap, setRolesMap,
      ...(isCreateForm
        ? { 
            title, setTitle,
            description, setDescription,
          }
        : {
            title, setTitle,
            description, setDescription,
            setDeadline,
            setStatus, 
            setSelectedTaskId,
            showTasks, setShowTasks,
          }
        ),
      selectedUserIdList,
      loading, setLoading,
      error, setError,
    },
    handlers: {
      handleSubmit,
      handleUserChange, 
      handleTitleChange, 
      handleDescriptionChange, 
      handleShowTasksChange,
      handleRoleChange
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
      isNew
    }
  };
}