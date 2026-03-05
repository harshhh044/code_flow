// Activity Log Service - Handles audit trail and activity logging
// Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7

import { storageService } from './storageService';

const ACTIVITY_LOGS_KEY = 'activityLogs';

// Activity types supported by the system
export const ACTIVITY_TYPES = {
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  GRIEVANCE_SUBMIT: 'Grievance Submit',
  STATUS_CHANGE: 'Status Change',
  DATA_RESET: 'Data Reset'
};

export const activityLogService = {
  /**
   * Log an activity in the system
   * @param {string} type - Activity type (Login, Logout, Grievance Submit, Status Change, Data Reset)
   * @param {string} userEmail - Email of the user performing the action
   * @param {Object} details - Additional details about the activity
   * @returns {Object} - Created activity log entry
   */
  logActivity: (type, userEmail, details = {}) => {
    const logs = storageService.get(ACTIVITY_LOGS_KEY, []);
    
    const logEntry = {
      id: Date.now() + Math.random(), // Ensure unique ID
      timestamp: new Date().toISOString(),
      type,
      userEmail,
      details
    };

    logs.push(logEntry);
    storageService.set(ACTIVITY_LOGS_KEY, logs);

    return logEntry;
  },

  /**
   * Get activity logs with optional filtering
   * @param {Object} filters - Optional filters { type, userEmail, startDate, endDate }
   * @returns {Array} - Array of activity logs sorted by timestamp descending
   */
  getActivityLogs: (filters = {}) => {
    let logs = storageService.get(ACTIVITY_LOGS_KEY, []);

    // Apply filters if provided
    if (filters.type) {
      logs = logs.filter(log => log.type === filters.type);
    }

    if (filters.userEmail) {
      logs = logs.filter(log => log.userEmail === filters.userEmail);
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      logs = logs.filter(log => new Date(log.timestamp) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      logs = logs.filter(log => new Date(log.timestamp) <= endDate);
    }

    // Sort by timestamp descending (most recent first)
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  /**
   * Clear all activity logs (admin only, used for data cleanup)
   * @returns {number} - Number of logs cleared
   */
  clearAllLogs: () => {
    const logs = storageService.get(ACTIVITY_LOGS_KEY, []);
    const count = logs.length;
    storageService.set(ACTIVITY_LOGS_KEY, []);
    return count;
  }
};

export default activityLogService;
