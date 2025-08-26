import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { taskIcons, generalIcons } from '@/components/icons';
import { useRouter } from "next/router";
import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function TaskList({ user, mode }) {
  const router = useRouter();
  const [isDelete, setIsDelete] = useState(false);
  const [selectedTaskIdList, setSelectedTaskIdList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { data: session, status } = useSession();

  const isAdmin = session?.user?.role === 'admin';
  const isView = mode === "view";
  const isEdit = mode === "edit";

  console.log("selectedTaskIdList = ", selectedTaskIdList);

  const toggleTaskSelection = (id) => {
    setSelectedTaskIdList(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await onSubmit(selectedTaskIdList);
      router.push("/users");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData) => {
    const response = await fetch(`/api/users/${user.id}/tasks`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedTaskIdList: formData })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete task');
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
  //let calcRem = isDelete ? "calc(46rem)" : "calc(45rem)";

  return (
    <div className="space-y-2">
    {
      user.assigned_tasks.length > 0 ? (
        <>
          <div className={`${isDelete ? "max-w-[calc(46rem)]" : "max-w-[calc(45rem)]"} flex justify-between items-center`}>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Assigned Tasks for {user.name}
            </h2>

            {isView && (
              <Link
                href={`/users/${user.id}/tasks`}
                className="flex items-center rounded-lg hover:bg-gray-100 mr-4"
                title="Edit assigned tasks"
              >
                <FontAwesomeIcon
                  icon={taskIcons.edit}
                  className="text-2xl text-gray-700 hover:text-black transition duration-75"
                />
              </Link>
            )}

            {isAdmin && isEdit && (
              <button
                className="inline-flex items-center rounded-lg 
                border border-gray-300 bg-gray-400 gap-1 
                pr-1 text-sm shadow-sm 
                hover:bg-gray-100"
                onClick={() => setIsDelete(!isDelete)}
              >
                <FontAwesomeIcon 
                  icon={generalIcons.select}
                  className="cursor-pointer text-2xl 
                  rounded-lg bg-gray-600 hover:text-gray-700 
                  transition duration-75 w-4 h-4" 
                />
                Select
              </button>
            )}
          </div>
          <ol className="@container">
            {user.assigned_tasks.map((task) => (
              <li 
                key={task.task_id}
                className={`inline-flex justify-between items-center text-sm text-gray-700 
                  ${isDelete && selectedTaskIdList.includes(task.task_id)?
                    'bg-red-500 hover:bg-red-300' : isDelete ? 
                    'hover:bg-red-300' : 'hover:bg-green-300'
                  } 
                  border border-gray-300 rounded-md shadow-sm`}  
              >
                <div 
                  className="flex items-center 
                  rounded-md shadow-sm "
                >
                  {isDelete && (
                    <input
                      type="checkbox"
                      className='ml-1'
                      checked={selectedTaskIdList.includes(task.task_id)}
                      onChange={() => toggleTaskSelection(task.task_id)}
                    />
                  )}
                  <Link
                    href={{
                      pathname: isAdmin ? `/tasks/${task.task_id}/edit` : '#',
                      query: isAdmin ? { userId: user.id } : null
                    }}
                    className={`flex flex-col @md:flex-row @md:justify-between @md:items-center 
                      shadow-sm py-2 px-2 w-full
                      focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 @sm:text-sm 
                      ${!isAdmin &&
                        'pointer-events-none opacity-50 cursor-not-allowed' 
                      }
                    `}
                    aria-disabled={!isAdmin || isDelete}
                    onClick={(e) => {
                      if (isAdmin && isDelete) {
                        e.preventDefault();
                        toggleTaskSelection(task.task_id);
                      }
                    }}
                    tabIndex={!isAdmin ? -1 : undefined}
                  >
                    <div className="flex flex-row @md:items-center space-x-8 @md:space-x-2">
                      <div className="mb-2 @md:mb-0">
                        <span className="text-sm font-medium text-gray-900">
                          Title: {task.title}
                        </span>
                      </div>

                      <div className="flex flex-row @md:items-center space-x-8">
                        <span className="text-sm font-medium text-gray-700">
                          Status: {task.status}
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          Created by: {task.creater_name}
                        </span>
                      </div>
                    </div>
                    
                    {/* Second "row" for small screens, becomes part of one flex row on larger screens */}
                    <div className="flex flex-row @md:items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">
                        Created at: {new Date(task.created_at).toLocaleString("en-US", {
                          hour12: false,
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        Deadline: {new Date(task.deadline).toLocaleString("en-US", {
                          hour12: false,
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </Link>
                </div>
              </li>
            ))}
          </ol>

          <div className="max-w-[calc(46rem)] flex justify-end">
            {isDelete && (
              <button
                className={`mt-4 px-4 py-2 rounded ${
                  selectedTaskIdList.length > 0 ? 'bg-red-600' : 'bg-red-400 opacity-90'
                } text-white`}
                disabled={selectedTaskIdList.length === 0}
                onClick={handleSubmit}
              >
                Delete
              </button>
            )}
          </div>
        </>
      ) : (
        <h2 className="text-sm font-medium text-gray-700">
          There is no assigned tasks for {user.name}
        </h2>
      )
    }
    </div>
  );
}