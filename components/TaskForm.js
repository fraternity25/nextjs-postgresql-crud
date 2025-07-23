import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export default function TaskForm({ mode = 'new', task = null, user = null, onSubmit }) {
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [selectedUserId, setSelectedUserId] = useState(user?.id || '');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('pending');
  const [role, setRole] = useState(user?.role || 'viewer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const { data: session } = useSession();
  const isAdmin = session?.user?.roles?.includes('admin');

  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const isNew = mode === 'new';

  useEffect(() => {
    fetchUsers();
  }, []);

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
          title,
          description,
          userId: selectedUserId || user?.id,
          role,
          deadline,
          status,
          created_by: session?.user?.id
        });
      }
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderDeadlineAndStatus = () => (
    <>
      <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
        Deadline
      </label>
      <input
        id="deadline"
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
      />

      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
        Status
      </label>
      <select
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
              <div>
                <label htmlFor="user" className="block text-sm font-medium text-gray-700">
                  Assign To
                </label>
                <select
                  id="user"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                >
                  <option value="">Select user</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>

                {renderDeadlineAndStatus()}
              </div>
            )}

            {!isNew && user && (
              <div className="space-y-1">
                <div className="text-sm text-gray-700">
                  <strong>Name:</strong> {user.name}
                </div>
                <div className="text-sm text-gray-700">
                  <strong>Email:</strong> {user.email}
                </div>

                {renderDeadlineAndStatus()}
              </div>
            )}

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
            
            {(isNew || isEdit) && isAdmin && (
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
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

