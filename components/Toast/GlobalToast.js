import { useToast } from '@/contexts/ToastContext';
import Toast from '.';

export default function GlobalToast() {
  const { toastMessages, removeToast } = useToast();

  if (toastMessages.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toastMessages.map((toast) => (
        <Toast
          key={toast.id}
          messages={toast.messages} // Each toast gets its own messages array
          time={toast.time}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}