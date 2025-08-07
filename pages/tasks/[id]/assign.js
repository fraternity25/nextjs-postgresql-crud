import useTasksForm from "@/hooks/useTasksForm";
import AssignForm from "@/components/TasksForm/AssignForm";
import { useRouter } from "next/router";
import { useSession } from 'next-auth/react';
import { useState, useEffect } from "react";

export default function assign() {
  const router = useRouter();
  const [task, setTask] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== 'loading' && (!session || !session.user.roles.includes('admin'))) {
      router.push('/');
    }
  }, [status, session]);

  useEffect(() => {
    if (router.isReady) {
      const { id, users } = router.query;
      if (id && users) {
        setUsers(JSON.parse(users));
        //setSelectedTaskId(id);
        fetchTask();
      }
      setLoading(false);
    }
  }, [router.isReady, router.query]);

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

  const onSubmit = async (formData) => {
    const isExistingTask = !!formData.task_id;
    const body = JSON.stringify({
                    ...formData,
                    rolesMap: Array.from(formData.rolesMap.entries()) // [[key1,val1],[key2,val2]]
                  });
    const response = await fetch(
      isExistingTask ? `/api/tasks/${formData.task_id}` : '/api/tasks',
      {
        method: isExistingTask ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to assign task');
    }

    return response.json();
  };

  const form = useTasksForm({ mode: "edit" , tasks: [task], form:"assign", onSubmit:onSubmit});
  const {states: { setUsers } } = form;

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

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Task not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow rounded-lg px-6 py-4">
          <AssignForm
            mode={"edit"}
            tasks={[task]}
            {...form}
          />
        </div>
      </div>
    </div>
  );
}
