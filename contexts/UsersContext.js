import { createContext, useState, useEffect } from 'react';

const UsersContext = createContext();

export function UsersProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const value = { users, setUsers, error, setError, fetchUsers };
  return (
    <UsersContext.Provider value={value}>
      {children}
    </UsersContext.Provider>
  );
}

export default UsersContext;