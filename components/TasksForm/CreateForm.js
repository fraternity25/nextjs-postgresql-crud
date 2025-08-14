import UsersContext from '@/contexts/UsersContext';
import { useRouter } from 'next/router';
import { useContext } from 'react';

export default function CreateForm({ 
  states,
  handlers,
  renderers,
  controls
})
{
  const { users, error, loading } = useContext(UsersContext); 
  const {
    rolesMap, 
    title,
    description,
    selectedUserIdList,
    showTasks,
  } = states;

  const {
    handleSubmit,
    handleUserChange,
    handleTitleChange,
    handleDescriptionChange,
    handleShowTasksChange,
    handleRoleChange
  } = handlers;

  const {
    renderAssignedUsers,
    renderDeadlineAndStatus,
    renderTasks
  } = renderers;

  const {
    isView,
    isEdit,
    isNew
   } = controls;

  const router = useRouter();

  console.log("selectedUserIdList = ", selectedUserIdList);
  console.log("rolesMap = ", rolesMap);
  /*required if assigned*/

  if(error) {
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <div className="text-sm text-red-600">{error}</div>
    </div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isNew && (
        <div className="flex space-x-3 mb-4">
          <button
              type="button"
              onClick={handleShowTasksChange}
              className={`px-3 py-1 border rounded bg-indigo-600 text-white`}
          >
            {!showTasks ? "Assign Existing Task" : "Assign New Task"}
          </button>
        </div>
      )}

      {renderAssignedUsers()}
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
          required={showTasks}
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

      {showTasks ? 
        renderTasks() :
        <>
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={handleTitleChange}
              disabled={isView}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={handleDescriptionChange}
              disabled={isView}
              rows={4}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            />
          </div>
        </>
      }

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
            {loading ? "Saving..." : isEdit ? "Update" : "Create"}
          </button>
        )}
      </div>
    </form>
  );
}