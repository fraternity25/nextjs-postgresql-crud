import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import UserForm from '@/components/UserForm';

//const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function UserDetailPage() {
  const [user, setUser] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (router.isReady) {
      const { id, userTasks, user } = router.query;
      try {
        if (user && userTasks) {
          setUser(JSON.parse(user));
          setUserTasks(JSON.parse(userTasks));
        }
      } 
      catch (err) {
        console.error("Failed to parse user or tasks:", err);
        setError(err.message);
      } 
      finally {
        setLoading(false);
      }
    }
  }, [router.isReady, router.query]);

  const isAdmin = session?.user?.roles?.includes('admin');

  if (loading) {
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
        <UserForm user={user} tasks={userTasks} mode="view" /> 
      </div>
    </div>
  );
}
