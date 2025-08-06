import useTasksForm from "@/hooks/useTasksForm";
import AssignForm from "@/components/TasksForm/AssignForm";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export default function assign() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const form = useTasksForm({ mode: "edit" , tasks: tasks, form:"assign"});
  const {states: { setUsers } } = form;

  useEffect(() => {
    if (router.isReady) {
      const { id, task, users } = router.query;
      if (task && users) {
        setUsers(JSON.parse(users));
        //setSelectedTaskId(id);
        setTasks([JSON.parse(task)]);
      }
    }
  }, [router.isReady, router.query]);

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
