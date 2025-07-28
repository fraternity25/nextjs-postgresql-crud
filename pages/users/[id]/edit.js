import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import UserForm from '@/components/UserForm';

export default function EditUser() {
  const [user, setUser] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  const [mode, setMode] = useState('edit'); // Default mode
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status !== 'loading' && (!session || !session.user.roles.includes('admin'))) {
      router.push('/');
    }
  }, [status, session]);

  useEffect(() => {
    if (router.isReady) {
      const { mode, userTasks, user } = router.query;
      try {
        if (user && userTasks && mode) {
          setUser(JSON.parse(user));
          setUserTasks(JSON.parse(userTasks));
          setMode(mode); 
        }
      } 
      catch (err) {
        console.error("Failed to parse user, tasks or mode:", err);
        setError(err.message);
      } 
      finally {
        setLoading(false);
      }
    }
  }, [router.isReady, router.query]);

  const handleSubmit = async (userData) => {
    const response = await fetch(`/api/users/${router.query.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update user');
    }

    return response.json();
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
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/*we are not inserting TaskList component as children since we are passing tasks prop*/}
        <UserForm onSubmit={handleSubmit} user={user} tasks={userTasks} mode={mode === 'role-only' ? "view+edit:role" : "edit"} /> 
      </div>
    </div>
  );
}