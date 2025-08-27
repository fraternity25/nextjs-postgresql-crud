import { useToast } from '@/contexts/ToastContext';
import Toast from '.';

export default function GlobalToast() {
  const { toastMessages, removeToast } = useToast();

  if (toastMessages.length === 0) return null;

  return (
    <div 
      className="fixed top-4 left-1/2 z-50 
        transform -translate-x-1/2 space-y-10"
    >
      <div className="flex flex-col items-center">
        {toastMessages.map((toast) => (
          <Toast
            key={toast.id}
            messages={toast.messages} // Each toast gets its own messages array
            time={toast.time}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}