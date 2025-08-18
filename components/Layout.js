import Sidebar from './Sidebar';
import ProfileMenu from './ProfileMenu';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Profile sağ üstte */}
        <div className="absolute top-3 right-6 z-50">
          <ProfileMenu />
        </div>

        {/* Sayfa içeriği */}
        <main className="flex-1 overflow-y-auto p-2 md:p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;