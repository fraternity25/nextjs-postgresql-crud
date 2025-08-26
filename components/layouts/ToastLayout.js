import { ToastProvider } from "@/contexts/ToastContext";
import GlobalToast from "@/components/Toast/GlobalToast";

export default function ToastLayout({ children }) {
  return (
    <ToastProvider>
      {children}
      <GlobalToast />
    </ToastProvider>
  );
}