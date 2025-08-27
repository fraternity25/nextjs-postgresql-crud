import { toastMessagesToString } from '@/lib/utils';
import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  //const [toastMessages, setToastMessages] = useState([]);
  const [toastMessages, setToastMessages] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    setIsMounted(true);
    const savedToasts = JSON.parse(localStorage.getItem('toasts') || '[]');
    setToastMessages(savedToasts);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('toasts', JSON.stringify(toastMessages));
    }
  }, [toastMessages, isMounted]);

  const addToast = ({messages, time = 5000, type = "default"}) => {
    const res = fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: session?.user?.id, message: toastMessagesToString(messages) }),
    });
    setToastMessages(prev => [...prev, { messages, time, type }]);
  };

  const removeToast = (id) => {
    setToastMessages(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToastMessages([]);
  };

  return (
    <ToastContext.Provider value={{ toastMessages, addToast, removeToast, clearAllToasts }}>
      {children}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};