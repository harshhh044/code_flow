// Data Cleanup Service - Handles data reset and cleanup operations
// Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6

import { storageService } from './storageService';
import { activityLogService, ACTIVITY_TYPES } from './activityLogService';

const USERS_KEY = 'users';
const SESSIONS_KEY = 'sessions';
const GRIEVANCES_KEY = 'grievanceDatabase';
const ANONYMOUS_GRIEVANCES_KEY = 'anonymousGrievanceDatabase';
const ACTIVITY_LOGS_KEY = 'activityLogs';

export const dataCleanupService = {
  /**
   * Complete data cleanup - removes all users except admins, all grievances, and all activity logs
   * @param {string} adminEmail - Email of the admin performing the cleanup
   * @returns {Object} - Result object with counts of removed items
   */
  completeDataCleanup: (adminEmail) => {
    const users = storageService.get(USERS_KEY, []);
    const grievanceDB = storageService.get(GRIEVANCES_KEY, {});
    const anonymousDB = storageService.get(ANONYMOUS_GRIEVANCES_KEY, []);
    const sessions = storageService.get(SESSIONS_KEY, []);
    const activityLogs = storageService.get(ACTIVITY_LOGS_KEY, []);

    // Count items before cleanup
    const counts = {
      usersRemoved: 0,
      grievancesRemoved: 0,
      anonymousGrievancesRemoved: anonymousDB.length,
      sessionsInvalidated: sessions.length,
      logsCleared: activityLogs.length
    };

    // Keep only admin users
    const adminUsers = users.filter(user => user.role === 'admin');
    counts.usersRemoved = users.length - adminUsers.length;

    // Count grievances
    Object.values(grievanceDB).forEach(categoryGrievances => {
      if (Array.isArray(categoryGrievances)) {
        counts.grievancesRemoved += categoryGrievances.length;
      }
    });

    // Perform cleanup
    storageService.set(USERS_KEY, adminUsers);
    storageService.set(GRIEVANCES_KEY, {});
    storageService.set(ANONYMOUS_GRIEVANCES_KEY, []);
    storageService.set(SESSIONS_KEY, []);
    storageService.set(ACTIVITY_LOGS_KEY, []);

    // Log the cleanup action (this will be the first entry in the new log)
    activityLogService.logActivity(
      ACTIVITY_TYPES.DATA_RESET,
      adminEmail,
      {
        action: 'Complete Data Cleanup',
        usersRemoved: counts.usersRemoved,
        grievancesRemoved: counts.grievancesRemoved,
        anonymousGrievancesRemoved: counts.anonymousGrievancesRemoved,
        sessionsInvalidated: counts.sessionsInvalidated,
        logsCleared: counts.logsCleared,
        timestamp: new Date().toISOString()
      }
    );

    return {
      success: true,
      ...counts
    };
  },

  /**
   * Reset individual user's data - removes only that user's grievances
   * @param {string} adminEmail - Email of the admin performing the reset
   * @param {string} userId - ID or email of the user whose data to reset
   * @returns {Object} - Result object with counts of removed items
   */
  resetUserData: (adminEmail, userId) => {
    const users = storageService.get(USERS_KEY, []);
    const user = users.find(u => 
      u.id === userId || 
      u.email === userId || 
      u.uid === userId
    );

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const userEmail = user.email;
    let grievancesRemoved = 0;

    // Remove grievances from regular database
    const grievanceDB = storageService.get(GRIEVANCES_KEY, {});
    let dbModified = false;

    Object.keys(grievanceDB).forEach(category => {
      if (Array.isArray(grievanceDB[category])) {
        const originalLength = grievanceDB[category].length;
        grievanceDB[category] = grievanceDB[category].filter(g => {
          const isUserGrievance = (
            g.userId === userId ||
            g.userId === userEmail ||
            g.email === userEmail ||
            g.userEmail === userEmail ||
            g.personalEmail === userEmail ||
            g.uniEmail === userEmail
          );
          if (isUserGrievance) {
            grievancesRemoved++;
          }
          return !isUserGrievance;
        });
        if (grievanceDB[category].length !== originalLength) {
          dbModified = true;
        }
      }
    });

    if (dbModified) {
      storageService.set(GRIEVANCES_KEY, grievanceDB);
    }

    // Update user's lastUpdated timestamp
    const userIndex = users.findIndex(u => u.email === userEmail);
    if (userIndex !== -1) {
      users[userIndex].lastUpdated = new Date().toISOString();
      storageService.set(USERS_KEY, users);
    }

    // Log the user data reset
    activityLogService.logActivity(
      ACTIVITY_TYPES.DATA_RESET,
      adminEmail,
      {
        action: 'Individual User Data Reset',
        targetUser: userEmail,
        targetUserId: userId,
        grievancesRemoved,
        timestamp: new Date().toISOString()
      }
    );

    return {
      success: true,
      grievancesRemoved,
      userId: user.id || user.email,
      userEmail
    };
  }
};

export default dataCleanupService;
