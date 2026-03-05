// Grievance Service - Handles all grievance operations
import { STORAGE_KEYS, CATEGORIES } from '../utils/constants';

// Helper function to generate codes
const generateGrievanceCode = (isAnonymous) => {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const prefix = isAnonymous ? 'ANON' : 'GRV';
  return `${prefix}-${year}-${random}`;
};

export const grievanceService = {
  // Submit new grievance
  submitGrievance: async (grievanceData, isAnonymous = false) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const grievance = {
          id: Date.now(),
          code: generateGrievanceCode(isAnonymous),
          ...grievanceData,
          status: grievanceData.status || 'Pending',
          submissionDate: new Date().toISOString(),
          lastUpdated: Date.now(),
          isAnonymous,
          history: [{
            status: 'Pending',
            timestamp: new Date().toISOString(),
            note: 'Grievance submitted'
          }]
        };

        if (isAnonymous) {
          // Store in anonymous database
          const anonDB = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANON_GRIEVANCE_DB) || '[]');

          // Normalize category: handle case where label might be passed instead of value
          const categoryInput = grievance.category;
          const matchedCategory = CATEGORIES.find(c => c.value === categoryInput || c.label === categoryInput);
          grievance.category = matchedCategory ? matchedCategory.value : 'other';

          anonDB.push(grievance);
          localStorage.setItem(STORAGE_KEYS.ANON_GRIEVANCE_DB, JSON.stringify(anonDB));
        } else {
          // Store in regular database by category
          const db = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRIEVANCE_DB) || '{}');

          // Normalize category: handle case where label might be passed instead of value
          const categoryInput = grievance.category;
          const matchedCategory = CATEGORIES.find(c => c.value === categoryInput || c.label === categoryInput);
          const validCategory = matchedCategory ? matchedCategory.value : 'other';
          grievance.category = validCategory;

          if (!db[validCategory]) {
            db[validCategory] = [];
          }

          db[validCategory].push(grievance);
          localStorage.setItem(STORAGE_KEYS.GRIEVANCE_DB, JSON.stringify(db));
        }

        // Add to check status tracking (for legacy compatibility)
        const checkStatusData = {
          code: grievance.code,
          date: grievance.submissionDate.split('T')[0],
          email: isAnonymous ? 'anonymous@system.local' : grievance.email,
          complainant: isAnonymous ? 'Anonymous Student' : grievance.first_name || grievance.fullName,
          status: grievance.status,
          category: grievance.category,
          isAnonymous
        };

        const existingStatus = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECK_STATUS) || '[]');
        existingStatus.push(checkStatusData);
        localStorage.setItem(STORAGE_KEYS.CHECK_STATUS, JSON.stringify(existingStatus));

        // Store as recent for immediate access
        localStorage.setItem('recentGrievance', JSON.stringify(grievance));

        // ✅ ADD ADMIN NOTIFICATION
        grievanceService.addAdminNotification({
          title: 'New Grievance Submitted',
          message: `${isAnonymous ? 'Anonymous' : grievance.first_name || grievance.fullName} submitted a grievance: "${grievance.subject}"`,
          type: 'new_grievance',
          grievanceCode: grievance.code,
          category: grievance.category,
          url: `/admin/grievances/${grievance.code}`
        });

        resolve(grievance);
      }, 500);
    });
  },

  // Get all grievances for a user with robust filtering
  getUserGrievances: async (user) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const db = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRIEVANCE_DB) || '{}');
        const anonDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANON_GRIEVANCE_DB) || '[]');

        const allGrievances = [...Object.values(db).flat(), ...anonDb];

        const userGrievances = allGrievances.filter(g => g && (
          (user?.email && (g.email === user.email || g.personalEmail === user.email || g.uniEmail === user.email)) ||
          (user?.personalEmail && (g.email === user.personalEmail || g.personalEmail === user.personalEmail || g.uniEmail === user.personalEmail)) ||
          (user?.uniEmail && (g.email === user.uniEmail || g.personalEmail === user.uniEmail || g.uniEmail === user.uniEmail)) ||
          ((user?.rollNo || user?.studentId) && (g.rollNo === user?.rollNo || g.student_id === user?.studentId || g.student_id === user?.rollNo || g.rollNo === user?.studentId))
        ));

        resolve(userGrievances.sort((a, b) => b.id - a.id));
      }, 300);
    });
  },

  // Get grievance by code
  getGrievanceByCode: async (code) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check regular database
        const db = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRIEVANCE_DB) || '{}');
        for (const category in db) {
          const found = db[category].find(g => g.code === code);
          if (found) {
            resolve(found);
            return;
          }
        }

        // Check anonymous database
        const anonDB = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANON_GRIEVANCE_DB) || '[]');
        const anonFound = anonDB.find(g => g.code === code);
        if (anonFound) {
          resolve(anonFound);
          return;
        }

        reject(new Error('Grievance not found'));
      }, 300);
    });
  },

  // Get all grievances (for admin)
  getAllGrievances: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const dbStr = localStorage.getItem(STORAGE_KEYS.GRIEVANCE_DB);
          const anonDBStr = localStorage.getItem(STORAGE_KEYS.ANON_GRIEVANCE_DB);
          
          const db = dbStr ? JSON.parse(dbStr) : {};
          const anonDB = anonDBStr ? JSON.parse(anonDBStr) : [];

          // Ensure db is an object with arrays
          const regularGrievances = Object.keys(db)
            .flatMap(category => {
              const grievances = db[category];
              return Array.isArray(grievances) ? grievances : [];
            })
            .map(g => ({
              ...g,
              isAnonymous: false
            }));

          const anonymousGrievances = (Array.isArray(anonDB) ? anonDB : []).map(g => ({
            ...g,
            isAnonymous: true
          }));

          const allGrievances = [...regularGrievances, ...anonymousGrievances];
          
          // Debug logging
          console.log('[grievanceService] getAllGrievances total:', allGrievances.length, {
            regular: regularGrievances.length,
            anonymous: anonymousGrievances.length
          });
          
          resolve(allGrievances.sort((a, b) => (b.id || 0) - (a.id || 0)));
        } catch (error) {
          console.error('[grievanceService] Error in getAllGrievances:', error);
          resolve([]);
        }
      }, 300);
    });
  },

  // Update grievance status (admin)
  updateStatus: async (code, updateData) => {
    const { status, adminNotes, reviewComments, priority } = typeof updateData === 'object' ? updateData : { status: updateData, adminNotes: arguments[2] };

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let found = false;
        let updatedGrievance = null;

        // Update in regular database
        const db = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRIEVANCE_DB) || '{}');
        for (const category in db) {
          const index = db[category].findIndex(g => g.code === code);
          if (index !== -1) {
            const grievance = db[category][index];
            grievance.prevStatus = grievance.status;
            if (status) grievance.status = status;
            if (priority) grievance.priority = priority;
            grievance.lastUpdated = Date.now();
            if (adminNotes !== undefined) grievance.adminNotes = adminNotes;
            if (reviewComments !== undefined) grievance.reviewComments = reviewComments;
            grievance.reviewDate = new Date().toISOString();

            if (!grievance.history) grievance.history = [];
            grievance.history.push({
              status: status || grievance.status,
              timestamp: new Date().toISOString(),
              note: adminNotes || `Status updated to ${status}`
            });

            db[category][index] = grievance;
            localStorage.setItem(STORAGE_KEYS.GRIEVANCE_DB, JSON.stringify(db));
            found = true;
            updatedGrievance = grievance;
            break;
          }
        }

        // Update in anonymous database if not found
        if (!found) {
          const anonDB = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANON_GRIEVANCE_DB) || '[]');
          const index = anonDB.findIndex(g => g.code === code);
          if (index !== -1) {
            const grievance = anonDB[index];
            grievance.prevStatus = grievance.status;
            grievance.status = newStatus;
            grievance.lastUpdated = Date.now();
            grievance.adminNotes = adminNotes;
            grievance.reviewDate = new Date().toISOString();

            if (!grievance.history) grievance.history = [];
            grievance.history.push({
              status: newStatus,
              timestamp: new Date().toISOString(),
              note: adminNotes || `Status changed to ${newStatus}`
            });

            anonDB[index] = grievance;
            localStorage.setItem(STORAGE_KEYS.ANON_GRIEVANCE_DB, JSON.stringify(anonDB));
            found = true;
            updatedGrievance = grievance;
          }
        }

        if (!found) {
          reject(new Error('Grievance not found'));
          return;
        }

        // Update check status data
        const checkStatusData = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECK_STATUS) || '[]');
        const statusIndex = checkStatusData.findIndex(s => s.code === code);
        if (statusIndex !== -1) {
          checkStatusData[statusIndex].status = newStatus;
          localStorage.setItem(STORAGE_KEYS.CHECK_STATUS, JSON.stringify(checkStatusData));
        }

        resolve(updatedGrievance);
      }, 300);
    });
  },

  // Add comment to grievance
  addComment: async (code, comment, isAdmin = false) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const addCommentToGrievance = (grievance) => {
          if (!grievance.comments) grievance.comments = [];
          grievance.comments.push({
            id: Date.now(),
            text: comment,
            isAdmin,
            timestamp: new Date().toISOString()
          });
          grievance.lastUpdated = Date.now();
          return grievance;
        };

        // Try regular database
        const db = JSON.parse(localStorage.getItem(STORAGE_KEYS.GRIEVANCE_DB) || '{}');
        for (const category in db) {
          const index = db[category].findIndex(g => g.code === code);
          if (index !== -1) {
            db[category][index] = addCommentToGrievance(db[category][index]);
            localStorage.setItem(STORAGE_KEYS.GRIEVANCE_DB, JSON.stringify(db));
            resolve(db[category][index]);
            return;
          }
        }

        // Try anonymous database
        const anonDB = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANON_GRIEVANCE_DB) || '[]');
        const index = anonDB.findIndex(g => g.code === code);
        if (index !== -1) {
          anonDB[index] = addCommentToGrievance(anonDB[index]);
          localStorage.setItem(STORAGE_KEYS.ANON_GRIEVANCE_DB, JSON.stringify(anonDB));
          resolve(anonDB[index]);
          return;
        }

        reject(new Error('Grievance not found'));
      }, 300);
    });
  },

  // Get grievance statistics
  getStatistics: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const dbStr = localStorage.getItem(STORAGE_KEYS.GRIEVANCE_DB);
          const anonDBStr = localStorage.getItem(STORAGE_KEYS.ANON_GRIEVANCE_DB);
          
          const db = dbStr ? JSON.parse(dbStr) : {};
          const anonDB = anonDBStr ? JSON.parse(anonDBStr) : [];

          // Safely extract grievances from db
          const regularGrievances = Object.keys(db).flatMap(category => {
            const grievances = db[category];
            return Array.isArray(grievances) ? grievances : [];
          });
          
          const allGrievances = [...regularGrievances, ...(Array.isArray(anonDB) ? anonDB : [])];

          const stats = {
            total: allGrievances.length,
            pending: allGrievances.filter(g => g.status?.toLowerCase() === 'pending').length,
            inProgress: allGrievances.filter(g => g.status?.toLowerCase() === 'in progress').length,
            resolved: allGrievances.filter(g => g.status?.toLowerCase() === 'resolved').length,
            rejected: allGrievances.filter(g => g.status?.toLowerCase() === 'rejected').length,
            anonymous: allGrievances.filter(g => g.isAnonymous).length,
            byCategory: {},
            byMonth: {}
          };

          // Category breakdown
          allGrievances.forEach(g => {
            const categoryInput = g.category || 'other';
            const matchedCategory = CATEGORIES.find(c => c.value === categoryInput || c.label === categoryInput);
            const validCategory = matchedCategory ? matchedCategory.value : 'other';

            stats.byCategory[validCategory] = (stats.byCategory[validCategory] || 0) + 1;

            // Monthly breakdown
            const date = g.submissionDate || new Date().toISOString();
            const d = new Date(date);
            const monthKey = d.toLocaleString('default', { month: 'short', year: '2-digit' });

            if (!stats.byMonth[monthKey]) {
              stats.byMonth[monthKey] = { submitted: 0, resolved: 0 };
            }
            stats.byMonth[monthKey].submitted++;
            if (g.status === 'Resolved' || g.status === 'Solved') {
              stats.byMonth[monthKey].resolved++;
            }
          });

          console.log('[grievanceService] getStatistics:', stats);
          resolve(stats);
        } catch (error) {
          console.error('[grievanceService] Error in getStatistics:', error);
          resolve({
            total: 0,
            pending: 0,
            inProgress: 0,
            resolved: 0,
            rejected: 0,
            anonymous: 0,
            byCategory: {},
            byMonth: {}
          });
        }
      }, 300);
    });
  },

  // Add notification for admin users
  addAdminNotification: (notification) => {
    try {
      // Get all admin users (you can customize this based on your user storage)
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const adminUsers = users.filter(u => u.role === 'admin');

      // Add notification for each admin
      adminUsers.forEach(admin => {
        const adminNotifications = JSON.parse(localStorage.getItem(`notifications_${admin.email}`) || '[]');
        
        const newNotification = {
          id: Date.now() + Math.random(), // Ensure unique ID
          read: false,
          time: new Date().toISOString(),
          ...notification
        };

        adminNotifications.unshift(newNotification);
        localStorage.setItem(`notifications_${admin.email}`, JSON.stringify(adminNotifications));
      });

      console.log('[grievanceService] Admin notification added:', notification.title);
    } catch (error) {
      console.error('[grievanceService] Error adding admin notification:', error);
    }
  }
};

export default grievanceService;
