import { useRouter } from 'next/router';

export default function UserActionSelect({ user, mode = 'edit' }) {
  const router = useRouter();

  console.log(user);

  const handleAction = (e) => {
    const value = e.target.value;
    if (!value) return;

    if (value === 'edit-tasks') {
      router.push(`/users/${user.id}/tasks`);
    } else if (value === 'change-role') {
      router.push({
        pathname: `/users/${user.id}/edit`,
        query: {
          mode: 'role-only',
        },
      });
    }

    e.target.selectedIndex = 0;
  };

  const handleView = () => {
    router.push({
      pathname: `/users/${user.id}`,
      query: {
        user: JSON.stringify(user),
        userTasks: JSON.stringify(user.assigned_tasks),
      },
    });
  };

  if (mode === 'view') {
    return (
      <button
        onClick={handleView}
        className="inline-flex items-center rounded-md 
        border border-gray-300 bg-white px-3 py-1 ml-4 
        text-sm text-gray-700 shadow-sm hover:bg-gray-50"
      >
        View
      </button>
    );
  }
  else if(mode === 'edit')
  {
    return (
      <select
        id={`UserActionSelect${user.id}`}
        onChange={handleAction}
        defaultValue="" // This controls the initial selected value
        className="inline-flex items-center rounded-md 
        border border-transparent bg-indigo-600 px-3 py-2 
        text-sm font-medium text-white shadow-sm hover:bg-indigo-700 
        focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="" disabled hidden>
          Actions
        </option>
        <option value="change-role">Change Role</option>
        {user.assigned_tasks.length > 0 && (
          <option value="edit-tasks">Edit Tasks</option>
        )}
      </select>
    );
  }
}
