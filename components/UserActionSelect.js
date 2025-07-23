import { useRouter } from 'next/router';

export default function UserActionSelect({ user, tasks = [] }) {
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
          user: JSON.stringify(user),
          userTasks: JSON.stringify(userTasks),
        },
      });
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

  return (
    <select
      onChange={handleAction}
      className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="" disabled selected hidden>
        Actions
      </option>
      <option value="change-role">Change Role</option>
      {userTasks.length > 0 && (
        <option value="edit-tasks">Edit Tasks</option>
      )}
    </select>
  );
}
