import useTasksForm from "@/hooks/useTasksForm";
import UsersLayout from '@/components/layouts/UsersLayout';
import CreateForm from "@/components/forms/TasksForm/CreateForm";
import { useUsers } from "@/contexts/UsersContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from 'next-auth/react';

function EditTaskContent() {
  const router = useRouter();
  const context = useUsers(); 
  const [task, setTask] = useState(null);
  const { data: session, status } = useSession();

  const { id, userId } = router.query;

  useEffect(() => {
    if (status !== 'loading' && (!session || session.user.role !== "admin")) {
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
                    rolesMap: Array.from(updatedData.rolesMap.entries()) 
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
    states: { title, selectedRole, loading, setLoading, error, setError}, 
    controls: {isView, isEdit} 
  } = form;

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
        Error: {error}
      </div>
    );
  }

  if (!task || !title || (userId && !selectedRole)) {
    return (
      <div className="flex items-center justify-center text-gray-600">
        Loading Task info..
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-16">
      <div className="bg-white shadow rounded-lg px-4 py-2">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isView ? "View Task" : isEdit ? "Edit Task" : "Assign Task"}
        </h1>
        <CreateForm
          {...form}
        />
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
