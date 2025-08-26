import { UsersProvider } from "@/contexts/UsersContext";

export default function UsersLayout({ children }) {
  return (
    <UsersProvider>
      {children}
    </UsersProvider>
  );
}