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

      return newMap;
    });
  };

  return (
    task.assigned_users.length > 0 ? (
      <>
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-medium text-gray-700">
            Assigned users for {task.title}
          </h2>

          {mode === 'view' && (
            <Link
              href={`/tasks/${task.id}/users`}
              className="flex items-center p-1 rounded-lg hover:bg-gray-100"
              title="Edit assigned users"
            >
              <FontAwesomeIcon
                icon={userIcons.edit}
                className="w-4 h-4 text-gray-500 hover:text-gray-700 transition duration-75"
              />
            </Link>
          )}

          {mode === 'edit' && (
            <div className="relative">
              <FontAwesomeIcon
                icon={userIcons.settings}
                className="w-4 h-4 cursor-pointer"
                onClick={() => setMenuOpen(!menuOpen)}
              />
              {menuOpen && (
                <div 
                  className="absolute top-2 left-4 rounded-md 
                  border border-transparent bg-indigo-600 p-2 
                  text-sm z-10 font-medium text-white shadow-lg hover:bg-indigo-700 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <div
                    className="cursor-pointer hover:bg-blue-100 p-1"
                    onClick={() => { setIsDelete(true); setIsRoleChange(false); setMenuOpen(false); }}
                  >
                    Delete
                  </div>
                  <div
                    className="cursor-pointer hover:bg-blue-100 p-1"
                    onClick={() => { setIsRoleChange(true); setIsDelete(false); setMenuOpen(false); }}
                  >
                    Change Roles
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
              className="w-full text-sm text-gray-700 border border-gray-300 rounded-md shadow-sm mt-1 py-2 px-3"
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
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
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
                selectedUserIdList.length > 0 ? 'bg-red-500' : 'bg-red-300'
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
                changedRolesMap.size > 0 ? 'bg-purple-500' : 'bg-purple-300'
              } text-white`}
              disabled={changedRolesMap.size === 0}
              onClick={() => {/* call role update here */}}
            >
              Update
            </button>
          )}
        </div>
      </>
    ) : (
      <h2 key={task.id} className="text-sm font-medium text-gray-700">
        There is no assigned users for {task.title}
      </h2>
    )
  );
}
