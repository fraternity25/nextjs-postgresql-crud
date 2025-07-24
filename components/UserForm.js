import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

export default function UserForm({  mode = 'view', user = null, onSubmit = null, children}) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState(user?.role || 'viewer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const { data: session } = useSession();
  const isAdmin = session?.user?.roles?.includes('admin');

  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const isNew = mode === 'new';
  const editRole = isAdmin && (isEdit || mode.includes("edit-role"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (onSubmit) {
        await onSubmit({ name, email, role });
      }
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  /*
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto">
      </div>
    </div>
  */
  return (
    <div className="max-w-md mx-auto mt-6">
      <div className="bg-white shadow rounded-lg px-6 py-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
          {isView ? 'User Details' : isEdit ? 'Edit User' : 'Sign Up'}
        </h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                disabled={isView}
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                disabled={isView}
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter email"
              />
            </div>

          {!isNew && (
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
              <select
                disabled={!isAdmin || (isView && !editRole)}
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          )}

          {children}
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            {!isView && ( 
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : isEdit ? 'Update' : 'Sign Up'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}