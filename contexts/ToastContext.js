import { createContext, useContext, useState, useEffect } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  //const [toastMessages, setToastMessages] = useState([]);
  const [toastMessages, setToastMessages] = useState(() => {
    if (typeof window !== 'undefined') {
        return JSON.parse(localStorage.getItem('toasts') || '[]');
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('toasts', JSON.stringify(toastMessages));
  }, [toastMessages]);

  const addToast = (messages, time = 5000) => {
    const id = Date.now();
    setToastMessages(prev => [...prev, { id, messages, time }]);
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