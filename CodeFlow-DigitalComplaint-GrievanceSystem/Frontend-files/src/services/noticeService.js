import api from './api';

export const noticeService = {
    // Get all active notices
    getNotices: async () => {
        try {
            const response = await api.get('/notices');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching notices:', error);
            return [];
        }
    },

    // Create a new notice (Admin only)
    createNotice: async (noticeData) => {
        try {
            const response = await api.post('/notices', noticeData);
            return response.data.data;
        } catch (error) {
            console.error('Error creating notice:', error);
            throw error;
        }
    },

    // Update a notice (Admin only)
    updateNotice: async (id, noticeData) => {
        try {
            const response = await api.put(`/notices/${id}`, noticeData);
            return response.data.data;
        } catch (error) {
            console.error(`Error updating notice ${id}:`, error);
            throw error;
        }
    },

    // Delete a notice (Admin only)
    deleteNotice: async (id) => {
        try {
            await api.delete(`/notices/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting notice ${id}:`, error);
            throw error;
        }
    }
};

export default noticeService;
