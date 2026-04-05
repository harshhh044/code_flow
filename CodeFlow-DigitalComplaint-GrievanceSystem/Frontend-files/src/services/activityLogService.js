// Activity Log Service - Handles audit trail and activity logging
// Now uses backend API for persistent storage

import api from './api';

// Activity types supported by the system
export const ACTIVITY_TYPES = {
  LOGIN: 'user_login',
  LOGOUT: 'user_logout',
  GRIEVANCE_SUBMIT: 'grievance_submitted',
  STATUS_CHANGE: 'grievance_status_updated',
  DATA_RESET: 'data_reset',
  PROFILE_UPDATE: 'profile_updated',
  USER_REGISTERED: 'user_registered'
};

export const activityLogService = {
  /**
   * Get activity logs from backend (Admin only)
   * @param {Object} params - Query parameters { limit, page }
   * @returns {Promise<Object>} - Activity logs with pagination info
   */
  getActivityLogs: async (params = {}) => {
    try {
      const { limit = 50, page = 1 } = params;
      const response = await api.get(`/activity-logs?limit=${limit}&page=${page}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      return { data: [], count: 0, total: 0, page: 1, pages: 0 };
    }
  },

  /**
   * Get activity logs for a specific user (Admin only)
   * @param {string} email - User email
   * @returns {Promise<Array>} - Array of activity logs
   */
  getUserActivityLogs: async (email) => {
    try {
      const response = await api.get(`/activity-logs/user/${email}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching activity logs for ${email}:`, error);
      return [];
    }
  },

  /**
   * Get user activity summary (Admin only)
   * @param {string} email - User email
   * @returns {Promise<Object>} - Activity summary with grievance count
   */
  getUserActivitySummary: async (email) => {
    try {
      const response = await api.get(`/activity-logs/summary/${email}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching activity summary for ${email}:`, error);
      return {
        userEmail: email,
        grievanceCount: 0,
        totalActivities: 0,
        activityBreakdown: [],
        recentActivities: []
      };
    }
  },

  /**
   * Cleanup old activity logs (Admin only)
   * @param {number} days - Delete logs older than this many days
   * @returns {Promise<Object>} - Cleanup result
   */
  cleanupOldLogs: async (days = 90) => {
    try {
      const response = await api.delete(`/activity-logs/cleanup?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error cleaning up old logs:', error);
      throw error;
    }
  }
};

export default activityLogService;
