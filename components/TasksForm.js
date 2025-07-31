import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export default function TasksForm({ mode = 'new', tasks = [], id=null, onSubmit }) {
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUserIdList, setSelectedUserIdList] = useState([id] || '');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [showTasks, setShowTasks] = useState(mode === "new");
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('pending');
  const [roles, setRoles] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const { data: session } = useSession();
  const isAdmin = session?.user?.roles?.includes('admin');

  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const isNew = mode === 'new';

  useEffect(() => {
    if(isNew) {
      fetchUsers();
    }
    
    if (isEdit && tasks.length === 1) {
      const t = tasks[0];
      const au = t.assigned_users.filter((au) => au.user_id == id)[0];
      setTitle(t.title);
      setDescription(t.description);
      setDeadline(t.deadline?.split('T')[0] || new Date().toISOString().split('T')[0]);
      setStatus(t.status || 'pending');
      setRoles((prev) => ({ ...prev, [selectedUserIdList]: au.role }));
    }
  }, [tasks]);

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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
      router.push('/');
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
      setRoles((prev) => ({ ...prev, [userId]: 'viewer' }));
    }
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setRoles((prev) => ({ ...prev, [selectedUserIdList]: newRole }));
  };

  const renderTasks = () => (
    showTasks && tasks?.length > 0 && (
      <>
        <div className="space-y-2 mt-6">
          <label htmlFor="selectTask" className="block text-sm font-medium text-gray-700">
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
    )
  );

  const renderDeadlineAndStatus = () => (
    (!showTasks || tasks?.length == 0) && (
      <>
        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
          Deadline
        </label>
        <input
          disabled={isView}
          id="deadline"
          type="date"
          min={new Date().toISOString().split('T')[0]}
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
        />

        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
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
    )
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow rounded-lg px-6 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {isView ? 'View Task' : isEdit ? 'Edit Task' : 'Assign Task'}
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isNew && (
              <>
                <div className="flex space-x-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setShowTasks(false)}
                    className={`px-3 py-1 border rounded ${
                      !showTasks ? 'bg-indigo-600 text-white' : 'bg-white'
                    }`}
                  >
                    Create New Task
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTasks(true)}
                    className={`px-3 py-1 border rounded ${
                      showTasks ? 'bg-indigo-600 text-white' : 'bg-white'
                    }`}
                  >
                    Assign Existing Task
                  </button>
                </div>

                <div>
                  <label htmlFor="user" className="block text-sm font-medium text-gray-700">
                    Assign To
                  </label>
                  <select
                    id="user"
                    value={selectedUserIdList}
                    onChange={handleUserChange}
                    required={showTasks}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  >
                    <option value="">Select user</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                  {renderTasks()}
                  {renderDeadlineAndStatus()}
                </div>
              </>
            )}

            {!isNew && tasks?.length > 0 && (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <ul key={task.id}>
                    <h2 className="text-sm font-medium text-gray-700">Assigned Users for {task.title}</h2>
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
                ))}

                {renderDeadlineAndStatus()}
              </div>
            )}

            {(!showTasks || tasks?.length == 0) && (
              <>
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isView}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isView}
                    rows={4}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  />
                </div>
              </>
            )}
            
            {/*(isNew || isEdit) && isAdmin && */(
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  disabled={isView}
                  id="role"
                  value={roles[selectedUserIdList] || 'viewer'}
                  onChange={handleRoleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white"
              >
                Cancel
              </button>
              {!isView && (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Saving...' : isEdit ? 'Update' : 'Assign'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

