import { useRouter } from 'next/router';

export default function UserActionSelect({ user, tasks = [], mode = 'edit' }) {
  const router = useRouter();

  const userTasks = tasks.filter((task) =>
    task.assigned_users?.some((u) => u.user_id === user.id)
  );

  const handleAction = (e) => {
    const value = e.target.value;
    if (!value) return;

    if (value === 'edit-tasks') {
      router.push({
        pathname: `/users/${user.id}/tasks`,
        query: {
          userTasks: JSON.stringify(userTasks),
        },
      });
    } else if (value === 'change-role') {
      router.push({
        pathname: `/users/${user.id}/edit`,
        query: {
          mode: 'role-only',
          userTasks: JSON.stringify(userTasks),
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
        userTasks: JSON.stringify(userTasks),
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
        {userTasks.length > 0 && (
          <option value="edit-tasks">Edit Tasks</option>
        )}
      </select>
    );
  }
}
