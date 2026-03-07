import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = ({
  isOpen,
  onClose,
  notifications = [],
  onMarkAllRead,
  unreadCount = 0,
}) => {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleNotificationClick = (notif) => {
    if (!notif.read) {
      // Mark as read logic
    }
    if (notif.link || notif.url) {
      navigate(notif.link || notif.url);
    }
    onClose();
  };

  const getIconForType = (type) => {
    const icons = {
      success: 'fa-check-circle',
      progress: 'fa-spinner',
      notice: 'fa-bullhorn',
      guideline: 'fa-book',
      resolved: 'fa-check-circle',
      default: 'fa-bell',
    };
    return icons[type] || icons.default;
  };

  const getColorForType = (type) => {
    const colors = {
      success: 'bg-emerald-100 text-emerald-600',
      progress: 'bg-blue-100 text-blue-600',
      notice: 'bg-amber-100 text-amber-600',
      guideline: 'bg-violet-100 text-violet-600',
      resolved: 'bg-emerald-100 text-emerald-600',
      default: 'bg-blue-100 text-blue-600',
    };
    return colors[type] || colors.default;
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-[slideDown_0.2s_ease]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h3 className="font-bold text-gray-800">Notifications</h3>
        {unreadCount > 0 && (
          <button 
            onClick={onMarkAllRead}
            className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-800"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="overflow-y-auto max-h-96">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <i className="block mb-3 text-4xl fas fa-bell-slash opacity-30"></i>
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          notifications.slice(0, 10).map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-blue-50 transition-colors ${
                !notif.read ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getColorForType(notif.type)}`}>
                  <i className={`fas ${getIconForType(notif.type)}`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{notif.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {notif.time ? new Date(notif.time).toLocaleDateString() : 'Just now'}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Notification Bell Button with Badge
export const NotificationBell = ({ count, onClick, isActive }) => (
  <button
    onClick={onClick}
    className="relative flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 transition-all bg-gray-100 rounded-xl hover:bg-blue-900 hover:text-white"
  >
    <i className="fas fa-bell"></i>
    <span className="hidden sm:inline">Notifications</span>
    {count > 0 && (
      <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full -top-1 -right-1 animate-pulse">
        {count > 9 ? '9+' : count}
      </span>
    )}
  </button>
);

export default NotificationDropdown;