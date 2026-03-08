// Data Isolation Service - Handles permission checking and data filtering based on user roles

// Permission constants
export const PERMISSIONS = {
  // Admin permissions
  VIEW_ALL_USERS: 'view_all_users',
  MANAGE_USERS: 'manage_users',
  VIEW_ALL_GRIEVANCES: 'view_all_grievances',
  UPDATE_GRIEVANCE_STATUS: 'update_grievance_status',
  DELETE_DATA: 'delete_data',
  
  // Student permissions
  VIEW_OWN_DATA: 'view_own_data',
  SUBMIT_GRIEVANCE: 'submit_grievance'
};

// Role-based permission mapping
const ROLE_PERMISSIONS = {
  admin: [
    PERMISSIONS.VIEW_ALL_USERS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_ALL_GRIEVANCES,
    PERMISSIONS.UPDATE_GRIEVANCE_STATUS,
    PERMISSIONS.DELETE_DATA
  ],
  student: [
    PERMISSIONS.VIEW_OWN_DATA,
    PERMISSIONS.SUBMIT_GRIEVANCE
  ]
};

export const dataIsolationService = {
  /**
   * Check if a user has a specific permission
   * @param {Object} user - User object with role property
   * @param {string} permission - Permission to check
   * @returns {boolean} - True if user has permission, false otherwise
   */
  checkPermission: (user, permission) => {
    if (!user || !user.role) {
      return false;
    }

    const userRole = user.role.toLowerCase();
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    
    return rolePermissions.includes(permission);
  },

  /**
   * Filter data based on user role and data type
   * Optimized with early returns and efficient filtering (Requirement 9.2, 9.3)
   * @param {Array} data - Array of data items to filter
   * @param {Object} user - User object with role and id/email
   * @param {string} dataType - Type of data ('grievances' or 'users')
   * @returns {Array} - Filtered data array
   */
  filterDataByUser: (data, user, dataType) => {
    // Early return for invalid inputs (Requirement 9.2)
    if (!user || !Array.isArray(data)) {
      return [];
    }

    // Early return for empty data
    if (data.length === 0) {
      return [];
    }

    const userRole = user.role?.toLowerCase();

    // Admin users see all data - early return (Requirement 9.2)
    if (userRole === 'admin') {
      return data;
    }

    // Student users see filtered data
    if (userRole === 'student') {
      if (dataType === 'grievances') {
        // Optimized filtering with early returns (Requirement 9.2, 9.3)
        const userId = user.id;
        const userEmail = user.email;
        const personalEmail = user.personalEmail;
        const uniEmail = user.uniEmail;

        return data.filter(item => {
          // Early return for anonymous grievances
          if (item.userId === 'anonymous' || item.isAnonymous) {
            return false;
          }

          // Optimized matching with early returns
          if (item.userId === userId || item.userId === userEmail) {
            return true;
          }
          if (item.email === userEmail) {
            return true;
          }
          if (item.userEmail === userEmail) {
            return true;
          }
          if (personalEmail && (item.email === personalEmail || item.personalEmail === personalEmail || item.uniEmail === personalEmail)) {
            return true;
          }
          if (uniEmail && (item.email === uniEmail || item.personalEmail === uniEmail || item.uniEmail === uniEmail)) {
            return true;
          }

          return false;
        });
      }

      if (dataType === 'users') {
        // Filter users: only show user's own profile - optimized
        const userId = user.id;
        const userEmail = user.email;
        
        return data.filter(item => 
          item.id === userId || item.email === userEmail
        );
      }
    }

    // Default: return empty array for unknown roles or data types
    return [];
  },

  /**
   * Sanitize user data by removing sensitive fields
   * @param {Object} user - User object to sanitize
   * @param {Object} requestingUser - User requesting the data
   * @returns {Object} - Sanitized user object
   */
  sanitizeUserData: (user, requestingUser) => {
    if (!user) {
      return null;
    }

    // If requesting user is the owner or an admin, return full data
    const isOwner = requestingUser && (
      user.id === requestingUser.id || 
      user.email === requestingUser.email
    );
    const isAdmin = requestingUser && requestingUser.role?.toLowerCase() === 'admin';

    if (isOwner || isAdmin) {
      return { ...user };
    }

    // For non-owners, remove sensitive fields
    const sanitized = { ...user };
    delete sanitized.password;
    delete sanitized.phone;
    delete sanitized.email;
    delete sanitized.personalEmail;
    delete sanitized.uniEmail;

    return sanitized;
  }
};

export default dataIsolationService;
