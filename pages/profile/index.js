import UserForm from '@/components/UserForm';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

//const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function UserDetailPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== 'loading' && session) {
      fetchUserInfo();
    }
  }, [status, session]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch(`/api/users/${session.user.id}?fields=created_at,updated_at,assigned_tasks`);
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      const data = { ...session.user , ...await response.json() };
      setUser(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Eror while loading user: {error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/*we are not inserting TaskList component as children since we are passing tasks prop*/}
        <UserForm user={user} mode="edit:exclude:role+view:role" />
      </div>
    </div>
  );
}
