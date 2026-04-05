import api from './api';

export const notificationService = {
    // Get all notifications for current user
    getNotifications: async () => {
        try {
            const response = await api.get('/notifications');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    },

    // Mark a single notification as read
    markAsRead: async (id) => {
        try {
            const response = await api.put(`/notifications/${id}/read`);
            return response.data.data;
        } catch (error) {
            console.error(`Error marking notification ${id} as read:`, error);
            throw error;
        }
    },

    // Mark all notifications as read
    markAllRead: async () => {
        try {
            const response = await api.put('/notifications/read-all');
            return response.data;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }
};

export default notificationService;
