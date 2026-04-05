import { grievanceAPI, adminAPI } from './api';

export const grievanceService = {

  // Submit new grievance
  submitGrievance: async (grievanceData, isAnonymous = false) => {
    try {
      const result = await grievanceAPI.submitGrievance(grievanceData, isAnonymous);
      if (!result.success) throw new Error(result.data?.message || 'Failed to submit');
      return result.data;
    } catch (error) {
      console.error('Error submitting grievance:', error);
      throw error;
    }
  },

  // Get all grievances for the logged-in user
  getUserGrievances: async () => {
    try {
      const result = await grievanceAPI.getUserGrievances();
      if (!result.success) return [];
      return Array.isArray(result.data) ? result.data : result.data?.grievances || [];
    } catch (error) {
      console.error('Error fetching user grievances:', error);
      return [];
    }
  },

  // Get grievance by code
  getGrievanceByCode: async (code) => {
    try {
      const result = await grievanceAPI.getGrievanceByCode(code);
      if (!result.success) throw new Error(result.data?.message || 'Not found');
      return result.data;
    } catch (error) {
      console.error(`Error fetching grievance ${code}:`, error);
      throw error;
    }
  },

  // Get all grievances (Admin only)
  getAllGrievances: async () => {
    try {
      const result = await grievanceAPI.getAllGrievances();
      if (!result.success) return [];
      return Array.isArray(result.data) ? result.data : result.data?.grievances || [];
    } catch (error) {
      console.error('Error fetching all grievances:', error);
      return [];
    }
  },

  // Update grievance status (Admin only)
  updateStatus: async (id, updateData) => {
    try {
      const payload = typeof updateData === 'string' ? { status: updateData } : updateData;
      const result = await adminAPI.updateStatus(id, payload);
      if (!result.success) throw new Error(result.data?.message || 'Failed to update');
      return result.data;
    } catch (error) {
      console.error(`Error updating status for ${id}:`, error);
      throw error;
    }
  },

  // Add comment to grievance
  addComment: async (id, comment) => {
    try {
      const result = await grievanceAPI.addComment(id, comment);
      if (!result.success) throw new Error(result.data?.message || 'Failed to add comment');
      return result.data;
    } catch (error) {
      console.error(`Error adding comment to ${id}:`, error);
      throw error;
    }
  },

  // Get grievance statistics
  getStatistics: async () => {
    try {
      const result = await grievanceAPI.getStatistics();
      if (!result.success) throw new Error('Failed to fetch stats');
      const stats = result.data;
      return {
        total: stats.total || 0,
        pending: stats.pending || 0,
        inProgress: stats.inProgress || 0,
        resolved: stats.resolved || 0,
        rejected: stats.rejected || 0,
        anonymous: stats.anonymous || 0,
        byCategory: Array.isArray(stats.byCategory)
          ? stats.byCategory.reduce((acc, curr) => {
              acc[curr._id] = curr.count;
              return acc;
            }, {})
          : stats.byCategory || {},
        byMonth: stats.byMonth || {}
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return { total: 0, pending: 0, inProgress: 0, resolved: 0, rejected: 0, anonymous: 0, byCategory: {}, byMonth: {} };
    }
  }
};

export default grievanceService;
