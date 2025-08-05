import { useRouter } from 'next/router';

export default function AssignForm({ 
  mode = "edit", 
  tasks,
  handleSubmit, 
  handleUserChange,
  handleRoleChange,
  renderDeadlineAndStatus,
  renderTasks,
  states
}) 
{
  const {
    users,
    roles,
    selectedUserIdList,
    loading, 
  } = states;

  const router = useRouter();

  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isNew = mode === "new";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        {renderTasks()}
        {renderDeadlineAndStatus()}
      </div>

      {!isNew && tasks?.length > 0 && (
        <div className="space-y-2">
          {tasks.map((task) => (
            <ul key={task.id}>
              <h2 className="text-sm font-medium text-gray-700">
                Assigned Users for {task.title}
              </h2>
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
            value={roles[selectedUserIdList] || "viewer"}
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
