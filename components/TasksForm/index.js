import useTasksForm from '@/hooks/useTasksForm';
import UsersLayout from '@/components/UsersLayout';
import CreateForm from './CreateForm'
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function TasksForm({
  tasks = [],
  userId = "",
  onSubmit,
}) {
  const { states, handlers, renderers, controls }= useTasksForm({mode:"new", tasks:tasks, userId:userId, onSubmit:onSubmit});
  const { data: session, status} = useSession();
  const isAdmin = session?.user?.roles?.includes("admin");

  useEffect(() => {
    if (status !== 'loading' && (!session || !isAdmin)) {
      router.push('/');
    }
  }, [status, session]);

  if (status === 'loading') return <p className="p-6">Loading...</p>;

  return (
    <UsersLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white shadow rounded-lg px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Assign Task
            </h1>
            <CreateForm 
              states={states}
              handlers={handlers}
              renderers={renderers}
              controls={controls}
            />
          </div>
        </div>
      </div>
    </UsersLayout>
  );
}

