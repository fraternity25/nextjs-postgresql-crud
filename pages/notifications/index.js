import { stringToToastMessages } from "@/lib/utils";
import { ToastMessages } from "@/components/Toast";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

function HistoryHeader({self, user}) {
  return (
    <h2 className="text-sm font-semibold text-gray-700">
      <div className='flex justify-between items-center'>
        <div 
          className={`flex items-center gap-2 
            ${self ? "text-md font-bold text-gray-800" : ""}
          `}
        >
          {self ? "Your notification history" : `${user.name} (${user.email})`}
          {/*unreadCount > 0 && `(${unreadCount} unread)`*/}
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
      <div className="text-center py-6 bg-white">
        <p className="text-gray-500">No notifications found</p>
      </div>
    ) : (
      <div className="bg-gray-50 rounded-md py-2">
        <ul className="divide-y divide-gray-200">
          {user.notifications.map((notif) => (
            <li
              key={notif.id}
              className={`p-4 hover:bg-gray-100 ${
                !notif.is_read ? "bg-blue-50" : ""
              }`}
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
                  {/*!notif.is_read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Mark as read
                    </button>
                  )*/}

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

  /* const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PUT",
      });
      if (!response.ok) throw new Error("Failed to mark as read");

      setAllNotifications((prev) =>
        prev.map((user) => ({
          ...user,
          notifications: user.notifications.map((notif) =>
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          ),
        }))
      );
    } catch (err) {
      console.error(err);
    }
  }; */

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

  // tüm kullanıcılar için unreadCount
  /* const unreadCount = allNotifications.reduce(
    (sum, user) => sum + user.notifications.filter((n) => !n.is_read).length,
    0
  ); */

  const self = allNotifications.find((u) => u.id == session?.user?.id);
  console.log("self = ", self);

  return (
    <div className="max-w-7xl py-4 mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-bold text-black mb-4">Notifications</h1>
          <HistoryHeader self={true} user={self || session?.user} />
          <History user={self || session?.user} onDelete={deleteNotification} />
        </div>
      </div>

      {isAdmin && 
        <div className="mt-4 flex flex-col space-y-2">
          {allNotifications
            .filter((user) => user.id != session?.user?.id)
            .map((user) =>
            <div key={user.id} >
              <HistoryHeader self={false} user={user} />
              <History user={user} onDelete={deleteNotification}/>
            </div>
          )}
        </div>
      }
    </div>
  );
}
