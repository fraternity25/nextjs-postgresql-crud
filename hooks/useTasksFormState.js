import { useState } from 'react';

export default function useTasksFormState({
  mode = "edit",
  userId = null,
}) {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState({});
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState('pending');
  const [selectedUserIdList, setSelectedUserIdList] = useState([userId] || "");
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [showTasks, setShowTasks] = useState(mode === "edit");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return {
    users, setUsers,
    roles, setRoles,
    title, setTitle,
    description, setDescription,
    deadline, setDeadline,
    status, setStatus,
    selectedUserIdList, setSelectedUserIdList,
    selectedTaskId, setSelectedTaskId,
    showTasks, setShowTasks,
    loading, setLoading,
    error, setError
  };
}