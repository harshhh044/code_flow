import api from './api';

export const grievanceService = {
  // Submit new grievance
  submitGrievance: async (grievanceData, isAnonymous = false) => {
    try {
      const response = await api.post('/grievances', {
        ...grievanceData,
        isAnonymous
      });
      return response.data.data;
    } catch (error) {
      console.error('Error submitting grievance:', error);
      throw error;
    }
  },

  // Get all grievances for the logged-in user
  getUserGrievances: async (user) => {
    try {
      const response = await api.get('/grievances/my');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user grievances:', error);
      return [];
    }
  },

  // Get grievance by code
  getGrievanceByCode: async (code) => {
    try {
      const response = await api.get(`/grievances/${code}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching grievance ${code}:`, error);
      throw error;
    }
  },

  // Get all grievances (Admin only)
  getAllGrievances: async () => {
    try {
      const response = await api.get('/grievances');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching all grievances:', error);
      return [];
    }
  },

  // Update grievance status (Admin only)
  updateStatus: async (code, updateData) => {
    try {
      // Normalize updateData if it's just a string (for backward compatibility)
      const payload = typeof updateData === 'string' ? { status: updateData } : updateData;

      const response = await api.put(`/grievances/${code}/status`, payload);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating status for ${code}:`, error);
      throw error;
    }
  },

  // Add comment to grievance
  addComment: async (code, comment, isAdmin = false) => {
    try {
      const response = await api.post(`/grievances/${code}/comment`, { text: comment });
      return response.data.data;
    } catch (error) {
      console.error(`Error adding comment to ${code}:`, error);
      throw error;
    }
  },

  // Get grievance statistics (Admin only)
  getStatistics: async () => {
    try {
      const response = await api.get('/grievances/stats');
      const stats = response.data.data;

      // Map backend stats to match frontend expectations if necessary
      return {
        total: stats.total,
        pending: stats.pending,
        inProgress: stats.inProgress,
        resolved: stats.resolved,
        rejected: stats.rejected,
        anonymous: stats.anonymous,
        byCategory: stats.byCategory.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        byMonth: stats.byMonth || {} // Fallback for now
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        rejected: 0,
        anonymous: 0,
        byCategory: {},
        byMonth: {}
      };
    }
  }
};

export default grievanceService;
