import { TasksProvider } from '@/contexts/TasksContext';

export default function TasksLayout({ children }) {
  return (
    <TasksProvider>
      {children}
    </TasksProvider>
  );
}