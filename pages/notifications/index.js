import { stringToToastMessages } from "@/lib/utils";
import { ToastMessages } from "@/components/Toast";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function NotificationsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [allNotifications, setAllNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated" && !session) {
      router.push("/auth");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notifications`);
      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      setAllNotifications(data); // artık [{ user_id, notifications: [...] }, ...]
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
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
  const unreadCount = allNotifications.reduce(
    (sum, user) => sum + user.notifications.filter((n) => !n.is_read).length,
    0
  );

  return (
    <div className="max-w-7xl py-4 mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-bold text-black">Notifications</h1>
          <p className="mt-2 text-md font-semibold text-gray-800">
            Your notification history{" "}
            {unreadCount > 0 && `(${unreadCount} unread)`}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col space-y-4">
        {allNotifications.map((user) =>
          user.notifications.length === 0 ? (
            <div className="text-center py-12 bg-white">
              <p className="text-gray-500">No notifications found</p>
            </div>
          ) : (
            <div key={user.user_id} className="bg-gray-50 rounded-md p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">
                User ID: {user.user_id}
              </h2>
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
                        <ToastMessages messages={stringToToastMessages(notif.message)} /> 
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
                        {!notif.is_read && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
      </div>
    </div>
  );
}
