import { useRouter } from 'next/router';

export default function TaskActionSelect({ task, users = [] }) {
  const router = useRouter();

  const handleAction = (e) => {
    const value = e.target.value;
    if (!value) return;

    if (value === 'edit') {
      router.push(`/tasks/${task.id}/edit`);
    } else if (value === 'edit-users') {
      router.push({
        pathname: `/tasks/${task.id}/users`,
        query: {
          task: JSON.stringify(task),
        },
      });
    }

    e.target.selectedIndex = 0;
  };

  return (
    <select
      id={`TaskActionSelect${task.id}`}
      onChange={handleAction}
      defaultValue=""
      className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="" disabled hidden>
        Actions
      </option>
      <option value="edit">Edit</option>
      <option value="edit-users">Edit Users</option>
    </select>
  );
}
