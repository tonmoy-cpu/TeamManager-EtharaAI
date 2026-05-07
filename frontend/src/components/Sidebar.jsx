import { Link, useLocation } from 'react-router-dom';
import { Home, Users, CheckSquare, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Teams', path: '/teams' },
    { icon: CheckSquare, label: 'My Tasks', path: '/tasks' },
  ];

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 hidden md:flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          TeamTask
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-xl transition-all relative ${
                isActive ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-[var(--color-primary)] opacity-20 rounded-xl"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--color-primary)] rounded-r-full" />
              )}
              <Icon className="w-5 h-5 mr-3 relative z-10" />
              <span className="font-medium relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <Link to="/settings" className={`flex items-center px-4 py-3 rounded-xl transition-colors ${location.pathname === '/settings' ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
          <Settings className="w-5 h-5 mr-3" />
          <span className="font-medium">Settings</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
