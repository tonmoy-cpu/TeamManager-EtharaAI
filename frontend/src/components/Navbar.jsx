import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, Bell, Menu, CheckCircle2, Circle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { useSocketStore } from '../store/useSocketStore';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const socket = useSocketStore(state => state.socket);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      if (error.code !== 'ERR_NETWORK') {
        console.error("Failed to fetch notifications:", error);
      }
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (socket) {
      const handleNewNotification = () => fetchNotifications();
      socket.on('new_notification', handleNewNotification);

      return () => {
        socket.off('new_notification', handleNewNotification);
      };
    } else {
      const interval = setInterval(fetchNotifications, 10000); // poll every 10s if no socket
      return () => clearInterval(interval);
    }
  }, [socket]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await api.put(`/notifications/${notif._id}/read`);
        setNotifications(notifications.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      }
      if (notif.link) {
        navigate(notif.link);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="h-16 bg-gray-900/50 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center md:hidden">
        <button className="text-gray-400 hover:text-white">
          <Menu className="w-6 h-6" />
        </button>
        <span className="ml-4 font-bold text-lg text-white">TeamTask</span>
      </div>
      
      <div className="hidden md:flex flex-1"></div>

      <div className="flex items-center space-x-6 relative" ref={dropdownRef}>
        
        {/* Notification Bell */}
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          className="relative text-gray-400 hover:text-white transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-bold border-2 border-gray-900">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-12 right-12 w-80 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50"
            >
              <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
                <h3 className="text-white font-bold">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-800">
                    {notifications.map(notif => (
                      <div 
                        key={notif._id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 cursor-pointer hover:bg-gray-800/50 transition-colors flex items-start space-x-3 ${!notif.isRead ? 'bg-[var(--color-primary)]/5' : ''}`}
                      >
                        <div className="mt-1 flex-shrink-0">
                          {!notif.isRead ? <Circle className="w-3 h-3 text-[var(--color-primary)] fill-current" /> : <CheckCircle2 className="w-4 h-4 text-gray-600" />}
                        </div>
                        <div>
                          <p className={`text-sm ${!notif.isRead ? 'text-white font-medium' : 'text-gray-400'}`}>{notif.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* User Profile */}
        <div className="flex items-center space-x-3">
          <Link to="/settings" className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-pink-500 flex items-center justify-center text-white font-bold cursor-pointer hover:opacity-80 transition-opacity">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Link>
          <div className="hidden md:block text-sm">
            <p className="text-white font-medium">{user?.name || 'User'}</p>
            <p className="text-gray-400 text-xs">{user?.role || 'Member'}</p>
          </div>
          <button 
            onClick={logout}
            className="text-gray-400 hover:text-red-400 ml-2 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
