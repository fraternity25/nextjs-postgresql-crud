import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { userIcons } from '@/components/icons';
import { useSession } from 'next-auth/react';
import { useRouter } from "next/router";
import { useState, useEffect  } from 'react';

export default function UserList({ task, mode, rolesMap }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isRoleChange, setIsRoleChange] = useState(false);
  const [selectedUserIdList, setSelectedUserIdList] = useState([]);
  const [changedRolesMap, setChangedRolesMap] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { data: session, status } = useSession();

  const isView = mode === "view";
  const isEdit = mode === "edit";
  const owner = { ...task.owner, role:"owner"};
  const reviewer = { ...task.reviewer, role:"reviewer"};

  useEffect(() => {
    if (status !== 'loading' && (!session || session.user.role !== "admin")) {
      router.push('/');
    }
  }, [status, session]);

  console.log("selectedUserIdList = ", selectedUserIdList);
  console.log("changedRolesMap = ", changedRolesMap);

  const toggleUserSelection = (id) => {
    setSelectedUserIdList(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const toggleRoleChange = (id, otherId, newRole) => {
    setChangedRolesMap(prev => {
      const newMap = new Map(prev);
      const originalRole = rolesMap.get(id);

      if (newRole !== originalRole) {
        newMap.set(id, newRole);
        newMap.set(otherId, originalRole);
      }
      else {
        newMap.delete(id);
        newMap.delete(otherId);
      }

      return newMap;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if(isRoleChange) {
        await onSubmit({
          rolesMap: changedRolesMap,
        });
      }
      else if(isDelete) {
        await onSubmit({
          deleteUserIds: selectedUserIdList
        });
      }
      router.push("/tasks");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData) => {
    let url = "";
    let options = {
      headers: { 'Content-Type': 'application/json' },
    };

    if (isRoleChange) {
      url = `/api/tasks/${task.id}`;
      options.method = "PATCH";
      options.body = JSON.stringify({
        ...formData,
        rolesMap: Array.from(formData.rolesMap.entries()), 
      });
    } 
    else if (isDelete) {
      url = `/api/tasks/${task.id}/users`;
      options.method = "DELETE";
      options.body = JSON.stringify({
        userIdList: formData.deleteUserIds
      });
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to assign task');
    }

    return response.json();
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    owner.id && reviewer.id ? (
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
        
        {/* User list */}
        <ol key={task.id}>
          {[owner, reviewer].map((user, i, array) => {
            const otherId = array[i === 0 ? 1 : 0].id;
            return (
              <li
                key={user.id}
                className={`w-full text-sm text-gray-700 ${isDelete && selectedUserIdList.includes(user.id) ? 'bg-red-500' : ''} border border-gray-300 rounded-md shadow-sm mt-1 py-2 px-3`}
              >
                <div className='flex justify-between items-center'>
                  <div className="flex items-center gap-2">
                    {isDelete && (
                      <input
                        type="checkbox"
                        checked={selectedUserIdList.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                      />
                    )}
                    {user.name} ({user.email})
                  </div>

                  {isRoleChange ? (
                    <select
                      id={user.id}
                      value={changedRolesMap.get(user.id) ?? rolesMap.get(user.id)}
                      onChange={(e) => toggleRoleChange(user.id, otherId, e.target.value)}
                    >
                      <option value="owner">Owner</option>
                      <option value="reviewer">Reviewer</option>
                    </select>
                  ) : (
                    <div>{user.role}</div>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
        
        <div className="flex justify-end">
          {/* Action buttons */}
          {isDelete && (
            <button
              className={`mt-4 px-4 py-2 rounded ${
                selectedUserIdList.length > 0 ? 'bg-red-600' : 'bg-red-400 opacity-90'
              } text-white`}
              disabled={selectedUserIdList.length === 0}
              onClick={handleSubmit}
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
              onClick={handleSubmit}
            >
              Update
            </button>
          )}
        </div>
      </div>
    ) : (
      <div className="flex items-center justify-center h-full w-full">
        <div className="max-w-lg w-full">
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
