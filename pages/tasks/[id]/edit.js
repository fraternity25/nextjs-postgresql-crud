import UsersContext from "@/contexts/UsersContext";
import useTasksForm from "@/hooks/useTasksForm";
import UsersLayout from '@/components/UsersLayout';
import CreateForm from "@/components/TasksForm/CreateForm";
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { useSession } from 'next-auth/react';

function EditTaskContent() {
  const router = useRouter();
  const context = useContext(UsersContext); 
  const [task, setTask] = useState(null);
  const { data: session, status } = useSession();

  const { id, userId } = router.query;

  useEffect(() => {
    if (status !== 'loading' && (!session || !session.user.roles.includes('admin'))) {
      router.push('/');
    }
  }, [status, session]);

  useEffect(() => {
    if (id) {
      fetchTask();
    }
  }, [id]);

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

  const onSubmit = async (updatedData) => {
    const body = JSON.stringify({
                    ...updatedData,
                    rolesMap: Array.from(updatedData.rolesMap.entries()) // [[key1,val1],[key2,val2]]
                  });
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update task');
    }

    return await res.json();
  };

  const form = useTasksForm({
    mode: "edit",
    context,
    tasks: task ? [task] : [],
    userId,
    form: "create",
    onSubmit:onSubmit
  });

  const { 
    states: { title, selectedRoleId, loading, setLoading, error, setError}, 
    controls: {isView, isEdit} 
  } = form;

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

  if (!task || !title || (userId && !selectedRoleId)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading Task info..</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow rounded-lg px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {isView ? "View Task" : isEdit ? "Edit Task" : "Assign Task"}
          </h1>
          <CreateForm
            {...form}
          />
        </div>
      </div>
    </div>
  );
}

export default function EditTask() {
  return (
    <UsersLayout>
      <EditTaskContent />
    </UsersLayout>
  );
}
