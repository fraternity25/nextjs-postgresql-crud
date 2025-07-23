// components/UserActionSelect.js
import { useRouter } from 'next/router';

export default function UserActionSelect({ user, tasks = [] }) {
  const router = useRouter();

  const handleAction = (e) => {
    const value = e.target.value;
    if (!value) return;

    if (value.startsWith('edit-task')) {
      const taskId = value.split(':')[1];
      router.push(`/tasks/${taskId}/edit`);
    } else if (value === 'change-role') {
      router.push(`/users/${user.id}/edit`);
    }

    e.target.selectedIndex = 0; // reset dropdown
  };

  const userTasks = tasks.filter((task) =>
    task.assigned_users?.some((u) => u.user_id === user.id)
  );

  return (
    <select
      onChange={handleAction}
      className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="">Actions</option>
      {userTasks.map((task) => (
        <option key={task.id} value={`edit-task:${task.id}`}>
          Edit Task #{task.id}
        </option>
      ))}
      <option value="change-role">Change Role</option>
    </select>
  );
}
