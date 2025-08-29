import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { sidebarIcons } from "@/components/icons";
import { stringToToastMessages } from "@/lib/utils";
import { ToastMessages } from "@/components/Toast";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

function HistoryHeader({self, user}) {
  return (
    <h2 
      className="text-sm font-semibold text-black w-full
      bg-[radial-gradient(ellipse_100%_60%_at_center,_var(--tw-gradient-stops))]
      to-gray-900/70 via-black/70 from-gray-900/80 
      p-2 border border-black rounded-md 
      shadow-sm"
    >
      <div className='flex justify-between items-center'>
        <div 
          className={`flex items-center gap-2 
            ${self ? "text-md font-bold " : ""}
          `}
        >
          {self ? "Your notification history" : `${user.name} (${user.email})`}
        </div>
        <div>{user.role}</div>
      </div>
    </h2>
  );
}

function History({user , onDelete}) {
  const isAdmin = user.role === "admin";
  const isFindNotif = user.notifications?.length > 0;

  const content = !isFindNotif ? (
      <div className="text-center py-6">
        <p className="text-gray-500">No notifications found</p>
      </div>
    ) : (
      <div className="rounded-md">
        <ul className="divide-y divide-gray-200">
          {user.notifications.map((notif) => (
            <li
              key={notif.id}
              className={`p-4 hover:bg-gray-100`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <ToastMessages 
                    messages={stringToToastMessages(notif.message)} 
                    type={notif.type} 
                  /> 
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(notif.created_at).toLocaleString("en-US", {
                      hour12: false,
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {isAdmin && 
                    <button
                      className="inline-flex items-center p-2 rounded-md cursor-pointer border border-transparent 
                                shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 
                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={() => onDelete(notif.id)}
                    >
                      Delete
                    </button>
                  }
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  return content;
}

export default function NotificationsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [allNotifications, setAllNotifications] = useState([]); // [{ id, name, email, role, notifications: [...] }, ...]
  const [expandedList, setExpandedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = session?.user?.role === "admin";
  //console.log("allNotifications", allNotifications);

  useEffect(() => {
    if (status === "unauthenticated" && !session) {
      router.push("/auth");
    }
  }, [status, session, router]);

  useEffect(() => {
    if(session) {
      if (session.user.role === "admin") {
        fetchNotifications();
      }
      else {
        fetchNotifications(session.user.id);
      }
    }
  }, [session]);

  const fetchNotifications = async (userId=null) => {
    try {
      setLoading(true);
      const response = await fetch(
        userId ? `/api/notifications/${userId}` : `/api/notifications`
      );
      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      setAllNotifications(userId ? [data] : data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete notification");

      setAllNotifications((prev) =>
        prev.map((user) => ({
          ...user,
          notifications: user.notifications.filter(
            (notif) => notif.id !== notificationId
          ),
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const toggleExpand = (id) => {
    setExpandedList((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading notifications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  const count = allNotifications.reduce(
    (sum, user) => sum + user.notifications.length,
    0
  );

  const self = allNotifications.find((u) => u.id == session?.user?.id);
  const isExpanded = expandedList.includes(self?.id);

  return (
    <div 
      className="max-w-md mx-auto mt-4 border 
      border-gray-300 rounded-lg shadow-md
      py-4 px-4"
    >
      <h1 className="text-xl font-bold text-black mb-4">
        Notifications {count > 0 && `(${count})`}
      </h1>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto rounded-lg bg-blue-100">
          <button 
            className="flex items-center w-full border-b border-gray-300
            rounded-md gap-2 p-2 hover:bg-gray-300"
            onClick={() => toggleExpand(self.id)}
          >
            <FontAwesomeIcon
              className={`w-4 h-4 text-gray-500 
                transition-transform duration-300 transform 
                ${isExpanded ? 
                  'rotate-90' : ''
                }
              `}
              icon={sidebarIcons.expand}
            />
            <HistoryHeader self={true} user={self || session?.user} />
          </button>
          <div 
            className={`transition-[max-height] ease-in-out duration-500 
            overflow-hidden ${isExpanded ? 'max-h-96' : 'max-h-0'}`}
          >
            {isExpanded && (
              <History user={self || session?.user} onDelete={deleteNotification} />
            )}
          </div>
        </div>
      </div>

      {isAdmin && 
        <div className="mt-4 flex flex-col space-y-2">
          {allNotifications
            .filter((user) => user.id != session?.user?.id)
            .map((user) => {
              const isExpanded = expandedList.includes(user.id);
              return (
                <div 
                  key={user.id} 
                  className="rounded-lg bg-blue-100"
                >
                  <button 
                    className="flex items-center w-full border-b border-gray-300
                    rounded-md gap-2 p-2 hover:bg-gray-300"
                    onClick={() => toggleExpand(user.id)}
                  >
                    <FontAwesomeIcon
                      className={`w-4 h-4 text-gray-500 
                        transition-transform duration-300 transform 
                        ${isExpanded ? 
                          'rotate-90' : ''
                        }
                      `}
                      icon={sidebarIcons.expand}
                    />
                    <HistoryHeader self={false} user={user} />
                  </button>
                  <div 
                    className={`transition-[max-height] ease-in-out duration-500 
                    overflow-hidden ${isExpanded ? 'max-h-96' : 'max-h-0'}`}
                  >
                    {isExpanded && (
                      <History user={user} onDelete={deleteNotification} />
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      }
    </div>
  );
}
