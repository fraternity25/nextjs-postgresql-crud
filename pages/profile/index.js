import ToastLayout from "@/components/layouts/ToastLayout";
import UserForm from '@/components/forms/UserForm';
import { useToast } from '@/contexts/ToastContext';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

//const fetcher = (...args) => fetch(...args).then((res) => res.json());

function UserDetailContent() {
  const { addToast } = useToast(); 
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

  const onSubmit = async (userData) => {
    const response = await fetch(`/api/users/${session.user.id}`, {
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

    const toastMessages = [
      {
        type: "h1",
        content: "Profile updated successfully!",
      }
    ];

    if(user.name != userData.name) {
      toastMessages.push({
        type: "p",
        content: `Name changed from ${user.name} to ${userData.name}`,
      });
    }

    if(user.email != userData.email) {
      toastMessages.push({
        type: "p",
        content: `Email changed from ${user.email} to ${userData.email}`,
      });
    }

    addToast(toastMessages);
    

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
        Eror while loading user: {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/*we are not inserting TaskList component as children since we are passing tasks prop*/}
      <UserForm onSubmit={onSubmit} user={user} mode="edit:exclude:role" />
    </div>
  );
}

export default function UserDetailPage() {
  return (
    <ToastLayout>
      <UserDetailContent />
    </ToastLayout>
  );
}