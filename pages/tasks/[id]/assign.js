import useTasksForm from "@/hooks/useTasksForm";
import AssignForm from "@/components/TasksForm/AssignForm";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export default function assign() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const onSubmit = async (formData) => {
    const isExistingTask = !!formData.task_id;

    console.log("formData.roleMap= ");
    console.log(formData.roleMap);
    console.log(Object.prototype.toString.call(formData.rolesMap));
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

  const form = useTasksForm({ mode: "edit" , tasks: tasks, form:"assign", onSubmit:onSubmit});
  const {states: { setUsers } } = form;

  useEffect(() => {
    if (router.isReady) {
      const { id, task, users } = router.query;
      if (task && users) {
        setUsers(JSON.parse(users));
        //setSelectedTaskId(id);
        setTasks([JSON.parse(task)]);
      }
      setIsLoading(false);
    }
  }, [router.isReady, router.query]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow rounded-lg px-6 py-4">
          <AssignForm
            mode={"edit"}
            tasks={tasks}
            {...form}
          />
        </div>
      </div>
    </div>
  );
}
