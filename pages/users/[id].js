import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import UserForm from '@/components/UserForm';

//const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function UserDetailPage() {
  const [user, setUser] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();
  const router = useRouter();
  
  const isAdmin = session?.user?.roles?.includes('admin');

  const { id, userTasks:tasksQuery } = router.query;

  useEffect(() => {
    try {
      if (id && tasksQuery) {
        fetchUser();
        setUserTasks(JSON.parse(tasksQuery));
      }
    } 
    catch (err) {
      console.error("Failed to parse user, tasks or mode:", err);
      setError(err.message);
    } 
  }, [id, tasksQuery]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
