import UsersContext from '@/contexts/UsersContext';
import useTasksForm from '@/hooks/useTasksForm';
import CreateForm from './CreateForm'
import { useSession } from 'next-auth/react';
import { useEffect, useContext } from 'react';
import { useRouter } from 'next/router';

export default function TasksForm({
  tasks = [],
  userId = "",
  onSubmit,
}) {
  const context = useContext(UsersContext); 
  const { states, handlers, renderers, controls }= useTasksForm({mode:"new", context, tasks:tasks, userId:userId, onSubmit:onSubmit});
  const { data: session, status} = useSession();
  const router = useRouter();

  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    if (status !== 'loading' && (!session || !isAdmin)) {
      router.push('/');
    }
  }, [status, session]);

  if (status === 'loading') return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-white shadow rounded-lg px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {tasks.length > 0 ? "Assign Task" : "Create first Task"}
        </h1>
        <CreateForm 
          states={states}
          handlers={handlers}
          renderers={renderers}
          controls={controls}
        />
      </div>
    </div>
  );
}

