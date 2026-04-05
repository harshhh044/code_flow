import { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications from localStorage
  const loadNotifications = useCallback(() => {
    if (!user?.email) return;

    try {
      const stored = localStorage.getItem(`notifications_${user.email}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setNotifications(parsed);
          setUnreadCount(parsed.filter(n => !n.read).length);
        }
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // ✅ AUTO-REFRESH NOTIFICATIONS EVERY 5 SECONDS FOR ADMINS
  useEffect(() => {
    if (!user?.email || user?.role !== 'admin') return;

    const interval = setInterval(() => {
      loadNotifications();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [user, loadNotifications]);

  // Add new notification
  const addNotification = useCallback((notification) => {
    if (!user?.email) return;

    const newNotification = {
      id: Date.now(),
      read: false,
      time: new Date().toISOString(),
      ...notification
    };

    const updated = [newNotification, ...notifications];
    setNotifications(updated);
    setUnreadCount(prev => prev + 1);
    localStorage.setItem(`notifications_${user.email}`, JSON.stringify(updated));
  }, [notifications, user]);

  // Mark single notification as read
  const markAsRead = useCallback((notificationId) => {
    if (!user?.email) return;

    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );

    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
    localStorage.setItem(`notifications_${user.email}`, JSON.stringify(updated));
  }, [notifications, user]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    if (!user?.email) return;

    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    setUnreadCount(0);
    localStorage.setItem(`notifications_${user.email}`, JSON.stringify(updated));
  }, [notifications, user]);

  // Delete notification
  const deleteNotification = useCallback((notificationId) => {
    if (!user?.email) return;

    const updated = notifications.filter(n => n.id !== notificationId);
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
    localStorage.setItem(`notifications_${user.email}`, JSON.stringify(updated));
  }, [notifications, user]);

  // Check for new grievance updates, notices, and guidelines
  const checkUpdates = useCallback(() => {
    if (!user?.email) return;

    const lastCheck = parseInt(localStorage.getItem(`lastCheck_${user.email}`)) || 0;
    const now = Date.now();

    // 1. Check for grievance updates
    const database = JSON.parse(localStorage.getItem('grievanceDatabase') || '{}');
    const allGrievances = Object.values(database).flat();
    const userGrievances = allGrievances.filter(g =>
      g.email === user.email || g.personalEmail === user.email
    );

    userGrievances.forEach(g => {
      if (g.lastUpdated > lastCheck) {
        const exists = notifications.some(n =>
          n.grievanceId === g.id && n.time > lastCheck
        );

        if (!exists) {
          let title, message, type = 'info';

          if (g.status === 'Resolved' && g.prevStatus !== 'Resolved') {
            title = 'Grievance Resolved';
            message = `Your grievance "${g.subject}" has been resolved`;
            type = 'resolved';
          } else if (g.status === 'In Progress' && g.prevStatus === 'Pending') {
            title = 'Grievance In Progress';
            message = `Your grievance "${g.subject}" is now being processed`;
            type = 'progress';
          } else if (g.adminNotes && g.adminNotes !== g.prevAdminNotes) {
            title = 'Update on Your Grievance';
            message = `New comment on "${g.subject}"`;
            type = 'info';
          }

          if (title) {
            addNotification({
              title,
              message,
              type,
              grievanceId: g.id,
              grievanceCode: g.code,
              url: `/user/grievance/${g.code}`
            });
          }
        }
      }
    });

    // 2. Check for new notices
    const notices = JSON.parse(localStorage.getItem('notices') || '[]');
    notices.forEach(n => {
      const noticeTime = new Date(n.date).getTime();
      if (noticeTime > lastCheck) {
        const exists = notifications.some(notif =>
          notif.type === 'notice' && notif.relatedId === n.id
        );
        if (!exists) {
          addNotification({
            title: 'New Notice Published',
            message: n.title,
            type: 'notice',
            relatedId: n.id,
            url: '/user/notices'
          });
        }
      }
    });

    // 3. Check for new guidelines (if they have a timestamp)
    const guidelines = JSON.parse(localStorage.getItem('guidelines_db') || '[]');
    guidelines.forEach(g => {
      const guidelineTime = g.date ? new Date(g.date).getTime() : 0;
      if (guidelineTime > lastCheck) {
        const exists = notifications.some(notif =>
          notif.type === 'guideline' && notif.relatedId === g.id
        );
        if (!exists) {
          addNotification({
            title: 'Guidelines Updated',
            message: g.title,
            type: 'guideline',
            relatedId: g.id,
            url: '/user/guidelines'
          });
        }
      }
    });

    localStorage.setItem(`lastCheck_${user.email}`, now.toString());
  }, [user, notifications, addNotification]);

  const value = {
    notifications,
    unreadCount,
    loadNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    checkGrievanceUpdates: checkUpdates
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;