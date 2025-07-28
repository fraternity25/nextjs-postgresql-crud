import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import TaskList from '@/components/TaskList';

export default function UserForm({  mode = 'view', user = null, tasks=null, onSubmit = null, children}) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState(user?.role || 'viewer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const { data: session } = useSession();
  const isAdmin = session?.user?.roles?.includes('admin');

  // Parse the mode string into permission flags
  const parseMode = (modeString) => {
    const permissions = {
      view: { all: false, fields: [] },
      edit: { all: false, fields: [] },
      create: false
    };

    if (modeString === 'new') {
      return {
        ...permissions,
        create: true
      };
    }
    else if (modeString === 'view') {
      return {
        ...permissions,
        view: { all: true, fields: [] }
      };
    }
    else if (modeString === 'edit') {
      return {
        ...permissions,
        edit: { all: true, fields: [] },
      };
    }

    // Split into operations (view/edit/new)
    const operations = modeString.split('+');
    //console.log(`operations = ${operations}`)
    
    operations.forEach(op => {
      if (op === 'new') {
        permissions.create = true;
        return;
      }

      const [action, params] = op.split(':');
      if (!['view', 'edit'].includes(action)) return;

      //console.log(`action = ${action} and params = ${params}\n`)

      if (!params) {
        // No parameters means all fields
        permissions[action] = { all: true, fields: [] };
      } else if (params.startsWith('exclude:')) {
        // "exclude:" prefix means all except specified
        const excludeFields = params.replace('exclude:', '').split(',').map(f => f.trim());
        permissions[action] = { all: true, exclude: excludeFields };
      } else {
        // Specific fields only
        const fields = params.split(',').map(f => f.trim());
        permissions[action] = { all: false, fields };
      }
    });

    return permissions;
  };

  const { view, edit, create } = parseMode(mode);
  //console.log(`view = \n${JSON.stringify(view)}, \nedit = \n${JSON.stringify(edit)} and \ncreate = \n${create}`);

  // Helper functions to check field permissions
  const canView = (field) => {
    if (view.all) {
      return !(view.exclude || []).includes(field);
    }
    return view.fields.includes(field);
  };

  const canEdit = (field) => {
    if (edit.all) {
      return !(edit.exclude || []).includes(field);
    }
    return edit.fields.includes(field);
  };

  // Usage examples in your form:
  // {canView('name') && <NameField viewMode={true} />}
  // {canEdit('email') && <EmailField editable={true} />}

  const isView = view.all;
  const isEdit = edit.all && !view.all && !create;
  const isNew = create;
  const editRole = isAdmin && canEdit('role');

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

  const deleteUser = async () => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      router.push('/');
    } catch (err) {
      setError(err.message);
    }
  };
  
  return (
    <div className="max-w-md mx-auto mt-6">
      <div className="bg-white shadow rounded-lg px-6 py-2">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            {editRole || isEdit ? 'Edit User' : isView ? 'User Details' : 'Sign Up'}
          </h1>
          
          {isAdmin && (
            <div className="flex justify-end space-x-3 mb-2">
              {editRole || isEdit ? (
                <button
                  onClick={() => router.push({
                    pathname: `/users/${user.id}`,
                    query: {
                      user: JSON.stringify(user),
                      userTasks: JSON.stringify(tasks),
                    },
                  })}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View
                </button>
              ) : isView && (
                <button
                  onClick={() => router.push({
                    pathname: `/users/${user.id}/edit`,
                    query: {
                      mode: 'role-only',
                      user: JSON.stringify(user),
                      userTasks: JSON.stringify(tasks),
                    },
                  })}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit
                </button>
              )}
              <button
                onClick={deleteUser}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <>
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

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {"Created At:  "}
                  <span className="mt-1 mr-2 text-sm text-gray-900">
                    {new Date(user.created_at).toLocaleString('en-US', {
                      hour12: false,
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) + "  "}
                  </span>
                  {"Updated At:  "}
                  <span className="mt-1 text-sm text-gray-900">
                    {new Date(user.updated_at).toLocaleString('en-US', {
                      hour12: false,
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </label>
              </div>
            </>
          )}

          {tasks !== null ? (
            <div className="flex items-center justify-between mt-4">
              <TaskList user={user} tasks={tasks} />
            </div>
            ) : children
          }
          
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