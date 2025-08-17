import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { userIcons } from '@/components/icons';
import { useState  } from 'react';

export default function UserList({ task, mode, rolesMap }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isRoleChange, setIsRoleChange] = useState(false);
  const [selectedUserIdList, setSelectedUserIdList] = useState([]);
  const [changedRolesMap, setChangedRolesMap] = useState(new Map());

  const isView = mode === "view";
  const isEdit = mode === "edit";

  console.log("selectedUserIdList = ", selectedUserIdList);
  console.log("changedRolesMap = ", changedRolesMap);

  const toggleUserSelection = (id) => {
    setSelectedUserIdList(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const toggleRoleChange = (id, newRole) => {
    setChangedRolesMap(prev => {
      const newMap = new Map(prev);
      const originalRole = rolesMap.get(id);

      if (newRole !== originalRole) {
        newMap.set(id, newRole);
      }
      else {
        newMap.delete(id);
      }

      return newMap;
    });
  };

  return (
    task.assigned_users.length > 0 ? (
      <div className={isEdit ? `max-w-lg p-6 mx-auto` : ''}>
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-medium text-gray-700">
            Assigned users for {task.title}
          </h2>

          {isView && (
            <Link
              href={`/tasks/${task.id}/users`}
              className="flex items-center rounded-lg hover:bg-gray-100"
              title="Edit assigned users"
            >
              <FontAwesomeIcon
                icon={userIcons.edit}
                className="text-2xl text-gray-700 hover:text-black transition duration-75"
              />
            </Link>
          )}

          {isEdit && (
            <div className="relative">
              <FontAwesomeIcon
                icon={userIcons.settings}
                className="cursor-pointer text-2xl bg-gray-100 rounded-full hover:text-gray-700 transition duration-75"
                onClick={() => setMenuOpen(!menuOpen)}
              />
              {menuOpen && (
                <div 
                  className="absolute top-2 left-6 rounded-md 
                  border border-gray-300 bg-indigo-600
                  text-sm z-10 font-medium text-white shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <div
                    className="inline-flex items-center p-1 rounded-md cursor-pointer border border-transparent 
                              shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-800
                              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => { setIsRoleChange(true); setIsDelete(false); setMenuOpen(false); }}
                  >
                    Change Roles
                  </div>
                  <div
                    className="inline-flex items-center p-2 rounded-md cursor-pointer border border-transparent 
                              shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 
                              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    onClick={() => { setIsDelete(true); setIsRoleChange(false); setMenuOpen(false); }}
                  >
                    Delete
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <ol key={task.id}>
          {/* User list */}
          {task.assigned_users.map((au) => (
            <li
              key={au.user_id}
              className={`w-full text-sm text-gray-700 ${isDelete && selectedUserIdList.includes(au.user_id) ? 'bg-red-500' : ''} border border-gray-300 rounded-md shadow-sm mt-1 py-2 px-3`}
            >
              <div className='flex justify-between items-center'>
                <div className="flex items-center gap-2">
                  {isDelete && (
                    <input
                      type="checkbox"
                      checked={selectedUserIdList.includes(au.user_id)}
                      onChange={() => toggleUserSelection(au.user_id)}
                    />
                  )}
                  {au.user_name} ({au.user_email})
                </div>

                {isRoleChange ? (
                  <select
                    id={au.user_id}
                    value={changedRolesMap.get(au.user_id) ?? rolesMap.get(au.user_id)}
                    onChange={(e) => toggleRoleChange(au.user_id, e.target.value)}
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                ) : (
                  <div>{au.role}</div>
                )}
              </div>
            </li>
          ))}
        </ol>
        
        <div className="flex justify-end">
          {/* Action buttons */}
          {isDelete && (
            <button
              className={`mt-4 px-4 py-2 rounded ${
                selectedUserIdList.length > 0 ? 'bg-red-600' : 'bg-red-400 opacity-90'
              } text-white`}
              disabled={selectedUserIdList.length === 0}
              onClick={() => {/* call deleteAssignedUsers here */}}
            >
              Delete
            </button>
          )}

          {isRoleChange && (
            <button
              className={`mt-4 px-4 py-2 rounded ${
                changedRolesMap.size > 0 ? 'bg-indigo-600' : 'bg-indigo-400 opacity-90'
              } text-white`}
              disabled={changedRolesMap.size === 0}
              onClick={() => {/* call role update here */}}
            >
              Update
            </button>
          )}
        </div>
      </div>
    ) : (
      <div className="flex items-center justify-center h-full w-full">
        <div className="max-w-lg w-full p-6">
          <div className={`@container flex items-center justify-center`}>
            <div
              key={task.id}
              className="p-2 bg-blue-100 rounded-md shadow-sm"
            >
              <h2 className="text-xl @md:text-6xl font-semibold text-gray-700 text-center">
                There are no assigned users for {task.title}
              </h2>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
