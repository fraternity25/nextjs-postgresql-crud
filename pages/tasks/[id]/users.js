import { useRouter } from "next/router";
import { useSession } from 'next-auth/react';
import { useEffect, useState } from "react";
import UserList from "@/components/UserList";

export default function TaskUsersPage() {
  const router = useRouter();
  const [task, setTask] = useState(null);
  const [rolesMap, setRolesMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { data: session, status } = useSession();

  const { id } = router.query;

  useEffect(() => {
    if (id){
      fetchTask();
    }
  }, [id]);

  useEffect(() => {
    if(task){
      const map = new Map();
      task.assigned_users.forEach(u => {
        map.set(u.user_id, u.role);
      });
      setRolesMap(map);
    }
  }, [task]);

  const fetchTask = async () => {
    try {
        const res = await fetch(`/api/tasks/${id}`);
        if (!res.ok) {
        throw new Error('Failed to fetch task');
        }
        const data = await res.json();
        setTask(data);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!task || !rolesMap) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-gray-600">Loading Task info..</div>
      </div>
    );
  }
  

  return (
    <UserList task={task} mode="edit" rolesMap={rolesMap} />
  );
}
