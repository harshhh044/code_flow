import { useNotifications as useNotificationsContext } from '../context/NotificationContext';

// Re-export from context
export const useNotifications = useNotificationsContext;

// Additional notification hooks
export const useUnreadCount = () => {
  const { unreadCount } = useNotificationsContext();
  return unreadCount;
};

export const useNotificationActions = () => {
  const { 
    addNotification, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotificationsContext();

  return {
    notify: addNotification,
    markRead: markAsRead,
    markAllRead: markAllAsRead,
    remove: deleteNotification
  };
};

export default useNotificationsContext;