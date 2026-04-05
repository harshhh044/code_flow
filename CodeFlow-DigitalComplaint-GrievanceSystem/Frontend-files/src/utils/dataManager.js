// Data Manager - Utility for managing persistent data
import { STORAGE_KEYS } from './constants';

export const dataManager = {
  // Export all application data
  exportAllData: () => {
    const data = {
      users: JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'null'),
      allUsers: JSON.parse(localStorage.getItem('users') || '[]'),
      grievances: JSON.parse(localStorage.getItem(STORAGE_KEYS.GRIEVANCE_DB) || '{}'),
      anonymousGrievances: JSON.parse(localStorage.getItem(STORAGE_KEYS.ANON_GRIEVANCE_DB) || '[]'),
      checkStatus: JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECK_STATUS) || '[]'),
      timestamp: new Date().toISOString()
    };
    return data;
  },

  // Clear only user session (on logout)
  clearUserSession: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem('loginTime');
    console.log('[dataManager] User session cleared. Grievances and user data remain intact.');
  },

  // Clear all data (for testing/reset)
  clearAllData: () => {
    localStorage.clear();
    console.log('[dataManager] All data cleared');
  },

  // Verify data integrity
  verifyDataIntegrity: () => {
    const grievanceDB = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRIEVANCE_DB) || '{}');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    let grievanceCount = 0;
    Object.values(grievanceDB).forEach(categoryGrievances => {
      if (Array.isArray(categoryGrievances)) {
        grievanceCount += categoryGrievances.length;
      }
    });

    const anonCount = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANON_GRIEVANCE_DB) || '[]').length;

    return {
      totalUsers: users.length,
      totalGrievances: grievanceCount,
      anonymousGrievances: anonCount,
      byCategory: Object.keys(grievanceDB).reduce((acc, cat) => {
        acc[cat] = Array.isArray(grievanceDB[cat]) ? grievanceDB[cat].length : 0;
        return acc;
      }, {})
    };
  },

  // Log all storage to console
  debugStorage: () => {
    console.table({
      'Current User': JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'null'),
      'All Users': JSON.parse(localStorage.getItem('users') || '[]').length + ' users',
      'Grievances DB': dataManager.verifyDataIntegrity().totalGrievances + ' grievances',
      'Integrity': dataManager.verifyDataIntegrity()
    });
  }
};

export default dataManager;
