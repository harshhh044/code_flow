import api from './api';

export const userService = {
    // Get all users (Admin only)
    getUsers: async () => {
        try {
            const response = await api.get('/users');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    },

    // Get user by ID (Admin only)
    getUserById: async (id) => {
        try {
            const response = await api.get(`/users/${id}`);
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching user ${id}:`, error);
            return null;
        }
    },

    // Update user status (Admin only)
    updateUserStatus: async (id, status) => {
        try {
            const response = await api.put(`/users/${id}/status`, { status });
            return response.data.data;
        } catch (error) {
            console.error(`Error updating status for ${id}:`, error);
            throw error;
        }
    },

    // Update own profile
    updateProfile: async (userData) => {
        try {
            const response = await api.put('/users/profile', userData);

            // Update local storage too to keep UI in sync
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const updatedUser = { ...currentUser, ...response.data.data };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));

            return updatedUser;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    },

    // Get complaint count for a user (Admin only)
    getUserComplaints: async (email) => {
        try {
            const response = await api.get(`/grievances`);
            return response.data.data.filter(g => g.userEmail === email).length;
        } catch (error) {
            console.error('Error fetching user complaints:', error);
            return 0;
        }
    },

    // Get user stats (Admin)
    getStats: async () => {
        try {
            const users = await userService.getUsers();
            return {
                total: users.length,
                active: users.filter(u => u.status === 'active').length,
                blocked: users.filter(u => u.status === 'blocked').length,
                restricted: users.filter(u => u.status === 'restricted').length,
                removed: users.filter(u => u.status === 'removed').length
            };
        } catch (error) {
            return { total: 0, active: 0, blocked: 0, restricted: 0, removed: 0 };
        }
    }
};

export default userService;
