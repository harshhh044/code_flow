// Admin Service - Handles admin-specific operations for user management

import { storageService } from './storageService';
import { dataIsolationService, PERMISSIONS } from './dataIsolationService';
import { activityLogService, ACTIVITY_TYPES } from './activityLogService';

const USERS_KEY = 'users';
const SESSIONS_KEY = 'sessions';
const GRIEVANCES_KEY = 'grievanceDatabase';
const ANONYMOUS_GRIEVANCES_KEY = 'anonymousGrievanceDatabase';

export const adminService = {
  /**
   * Get all users in the system
   * @returns {Array} - Array of all users
   */
  getAllUsers: () => {
    const users = storageService.get(USERS_KEY, []);
    
    // Auto-patch users with status if missing
    let needsUpdate = false;
    const patchedUsers = users.map(user => {
      if (!user.status) {
        needsUpdate = true;
        return {
          ...user,
          status: 'active',
          uid: user.uid || user.studentId || 'N/A',
          dept: user.dept || 'Department Not Set',
          roll: user.roll || 'N/A'
        };
      }
      return user;
    });

    if (needsUpdate) {
      storageService.set(USERS_KEY, patchedUsers);
    }

    return patchedUsers;
  },

  /**
   * Update user status (admin only)
   * @param {string} adminEmail - Email of the admin performing the action
   * @param {string} userId - ID or email of the user to update
   * @param {string} newStatus - New status (active, blocked, restricted, removed)
   * @returns {Object|null} - Updated user object or null if not found
   */
  updateUserStatus: (adminEmail, userId, newStatus) => {
    const users = adminService.getAllUsers();
    const index = users.findIndex(u => 
      u.id === userId || 
      u.email === userId || 
      u.uid === userId
    );

    if (index === -1) {
      return null;
    }

    // Update user status
    users[index].status = newStatus;
    users[index].lastUpdated = new Date().toISOString();
    storageService.set(USERS_KEY, users);

    // Log status change using ActivityLogService (Requirement 7.4)
    activityLogService.logActivity(
      ACTIVITY_TYPES.STATUS_CHANGE,
      adminEmail,
      {
        targetUser: users[index].email,
        targetUserId: userId,
        newStatus,
        timestamp: new Date().toISOString()
      }
    );

    // If status is blocked or removed, invalidate sessions
    if (newStatus === 'blocked' || newStatus === 'removed') {
      adminService.invalidateUserSessions(userId);
    }

    return users[index];
  },

  /**
   * Get user statistics
   * @returns {Object} - Statistics object with counts by status and department
   */
  getUserStatistics: () => {
    const users = adminService.getAllUsers();
    
    // Count by status
    const statusCounts = {
      active: 0,
      blocked: 0,
      restricted: 0,
      removed: 0
    };

    // Count by department
    const departmentCounts = {};

    // Count recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    let recentRegistrations = 0;

    users.forEach(user => {
      // Count by status
      const status = user.status || 'active';
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }

      // Count by department
      const dept = user.dept || user.department || 'Unknown';
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;

      // Count recent registrations
      if (user.createdAt) {
        const createdDate = new Date(user.createdAt);
        if (createdDate >= thirtyDaysAgo) {
          recentRegistrations++;
        }
      }
    });

    return {
      total: users.length,
      byStatus: statusCounts,
      byDepartment: departmentCounts,
      recentRegistrations
    };
  },

  /**
   * Invalidate all sessions for a specific user
   * @param {string} userId - ID or email of the user
   * @returns {number} - Number of sessions invalidated
   */
  invalidateUserSessions: (userId) => {
    const sessions = storageService.get(SESSIONS_KEY, []);
    
    // Filter out sessions for the specified user
    const remainingSessions = sessions.filter(session => {
      return session.userId !== userId && 
             session.userEmail !== userId &&
             session.email !== userId;
    });

    const invalidatedCount = sessions.length - remainingSessions.length;
    
    if (invalidatedCount > 0) {
      storageService.set(SESSIONS_KEY, remainingSessions);
    }

    return invalidatedCount;
  },

  /**
   * Reset user data (remove user's grievances)
   * @param {string} userId - ID or email of the user
   * @returns {Object} - Result object with counts of removed items
   */
  resetUserData: (userId) => {
    const users = adminService.getAllUsers();
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

    // Remove from anonymous database if user submitted anonymous grievances
    // Note: We can't definitively identify anonymous grievances by user,
    // so we skip this to preserve anonymity

    // Update user's lastUpdated timestamp
    const userIndex = users.findIndex(u => u.email === userEmail);
    if (userIndex !== -1) {
      users[userIndex].lastUpdated = new Date().toISOString();
      storageService.set(USERS_KEY, users);
    }

    // Log data reset using ActivityLogService (Requirement 7.5)
    activityLogService.logActivity(
      ACTIVITY_TYPES.DATA_RESET,
      'admin', // Admin email should be passed as parameter in future enhancement
      {
        targetUser: userEmail,
        targetUserId: userId,
        grievancesRemoved,
        timestamp: new Date().toISOString()
      }
    );

    return {
      success: true,
      grievancesRemoved,
      userId: user.id || user.email
    };
  }
};

export default adminService;
