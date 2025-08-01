import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { sidebarIcons, userIcons, taskIcons, notificationIcons } from '@/components/icons';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  const menuItems = [
    {
      icon: userIcons.list,
      label: 'Users',
      href: '/users',
      tooltip: 'Users page'
    },
    {
      icon: taskIcons.list,
      label: 'Tasks',
      href: '/tasks',
      tooltip: 'Tasks page'
    },
    {
      icon: notificationIcons.info,
      label: 'Notifications',
      href: '/notifications',
      tooltip: 'Notifications page'
    }
    /*{
      icon: faHome,
      label: 'Home',
      href: '/',
      tooltip: 'Ana sayfaya dön'
    },
    {
      icon: faPlus,
      label: 'Destek kaydı aç',
      href: '/create-ticket',
      tooltip: 'Yeni destek kaydı oluştur'
    },
    {
      icon: faHeadset,
      label: 'Formlar',
      href: '/forms',
      tooltip: 'Formları görüntüle'
    },
    {
      icon: faCircleExclamation,
      label: 'Destek kayıtları',
      href: '/tickets',
      tooltip: 'Destek kayıtlarını listele'
    }*/
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 border-r border-gray-200">
        {/* Logo/Link - Daraltıldığında sadece icon gösterir 
          <Link href="/" className={`flex items-center ${isCollapsed ? 'justify-center' : 'ps-2.5 mb-5'}`}>
            {isCollapsed ? (
                <img 
                src="/logo-G-100-white.png"
                alt="Logo"
                className="w-8 h-8"
                />
            ) : (
                <img 
                src="/logo-GLPI-100-white.png" 
                alt="Logo"
                className="h-8" // width otomatik ayarlanır
                />
            )}
          </Link>
        */}

        {/* Menü Alanı */}
        <ul className="space-y-2 font-medium">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                href={item.href}
                className={`flex items-center p-2 rounded-lg group ${router.pathname.startsWith(item.href) ? 'bg-blue-100 text-blue-600' : 'text-gray-900 hover:bg-gray-100'}`}
                title={isCollapsed ? item.tooltip : ''}
              >
                <FontAwesomeIcon 
                  icon={item.icon} 
                  className={`w-5 h-5 ${router.pathname.startsWith(item.href) ? 'text-blue-600' : 'text-gray-500'} transition duration-75 group-hover:text-gray-900`} 
                />
                {!isCollapsed && <span className="ms-3">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>

        {/* Menüyü Daraltma/Açma Butonu */}
        <div className="absolute bottom-4 left-0 right-0 px-3">
          <button 
            onClick={toggleSidebar}
            className="w-full flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100"
          >
            <FontAwesomeIcon 
              icon={isCollapsed ? sidebarIcons.expand : sidebarIcons.collapse} 
              className="w-5 h-5 text-gray-500" 
            />
            {!isCollapsed && <span className="ms-3">Collapse menu</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;