import { useRouter } from 'next/router';

export default function AssignForm({ 
  mode = "edit", 
  tasks,
  states,
  handlers,
  renderers
}) 
{
  const {
    users,
    rolesMap,
    selectedUserIdList,
    loading, 
  } = states;

  const {
    handleSubmit, 
    handleUserChange,
    handleRoleChange,
  } = handlers;

  const {
    renderAssignedUsers,
    renderTasks
  } = renderers;

  const router = useRouter();

  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isNew = mode === "new";

  /* console.log("selectedUserIdList = ", selectedUserIdList);
  console.log("rolesMap = ", rolesMap);
  console.log("tasks = ", tasks); */

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {tasks.length !== 1 ? renderTasks(true, tasks, isView) : 
        <>
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-gray-700">
              Task info
            </h2>
            <div
              className="text-sm text-gray-700 border border-gray-200 rounded px-3 py-2"
            >
              <div>
                <strong>Title:</strong> {tasks[0].title}
              </div>
              <div>
                <strong>Description:</strong> {tasks[0].description}
              </div>
              <div>
                <strong>Deadline:</strong> 
                {new Date(tasks[0].deadline)
                  .toLocaleString('en-US', {
                    hour12: false,
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                }
              </div>
              <div>
                <strong>Status:</strong> {tasks[0].status}
              </div>
            </div>
          </div>
        </>
      }

      {renderAssignedUsers(isNew, tasks)}
      <div>
        <label
          htmlFor="user"
          className="block text-sm font-medium text-gray-700"
        >
          Assign To
        </label>
        <select
          id="user"
          value={selectedUserIdList.at(-1)}
          onChange={handleUserChange}
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
      </div>

      {
        /*(isNew || isEdit) && isAdmin && */ 
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700"
          >
            Role
          </label>
          <select
            disabled={isView}
            id="role"
            value={rolesMap.get(selectedUserIdList.at(-1)) || "viewer"}
            onChange={handleRoleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
      }

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.push("/tasks")}
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
            {loading ? "Saving..." : isEdit ? "Update" : "Assign"}
          </button>
        )}
      </div>
    </form>
  );
}
