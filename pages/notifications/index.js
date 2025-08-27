import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function NotificationsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Giriş yapılmamışsa auth sayfasına yönlendir
  useEffect(() => {
    if (status === "unauthenticated" && !session) {
      router.push("/auth");
    }
  }, [status]);

  // Bildirimleri yükle
  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notifications/${session.user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_read: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }

      // Yerel state'i güncelle
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, is_read: true }
          : notif
      ));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`/api/notifications/user/${session.user.id}/mark-all-read`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to mark all as read');
      }

      // Yerel state'i güncelle
      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      // Yerel state'ten kaldır
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
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

  const unreadCount = notifications.filter(notif => !notif.is_read).length;

  return (
    <div className="max-w-7xl py-4 mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-bold text-black">Notifications</h1>
          <p className="mt-2 text-md font-semibold text-gray-800">
            Your notification history {unreadCount > 0 && `(${unreadCount} unread)`}
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center px-4 py-2 border border-transparent 
              rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              {notifications.length === 0 ? (
                <div className="text-center py-12 bg-white">
                  <p className="text-gray-500">No notifications found</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 bg-white">
                  {notifications.map((notification) => (
                    <li
                      key={notification.id}
                      className={`p-6 hover:bg-gray-50 ${
                        !notification.is_read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.message}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(notification.created_at).toLocaleString("en-US", {
                              hour12: false,
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          {!notification.is_read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}