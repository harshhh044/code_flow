// API Service - Connects to Real Backend
const API_URL = "https://code-flow-863n.onrender.com/api";

// Helper: Get JWT token from localStorage
const getToken = () => localStorage.getItem("token");

// Helper: Get auth headers
const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ═══════════════════════════════════════════════════════════════════
// AUTH API
// ═══════════════════════════════════════════════════════════════════

export const authAPI = {
  // Register
  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userData.fullName || userData.name,
          fullName: userData.fullName || userData.name,
          email: userData.email || userData.uniEmail || userData.personalEmail,
          uniEmail: userData.uniEmail || userData.email,
          personalEmail: userData.personalEmail || userData.email,
          password: userData.password,
          role: userData.role || "student",
          department: userData.dept || userData.department,
          dept: userData.dept || userData.department,
          rollNumber: userData.roll || userData.rollNo || userData.studentId,
          rollNo: userData.roll || userData.rollNo,
          studentId: userData.studentId || userData.rollNo,
          uid: userData.uid || userData.studentId,
          phone: userData.phone,
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("currentUser", JSON.stringify(data));
      }

      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Login
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("currentUser", JSON.stringify(data));
      }

      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get current user
  getMe: async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
  },

  // Get current user from localStorage (sync)
  getCurrentUser: () => {
    const user = localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  },
};

// ═══════════════════════════════════════════════════════════════════
// GRIEVANCE API
// ═══════════════════════════════════════════════════════════════════

export const grievanceAPI = {
  // Submit grievance
  submitGrievance: async (grievanceData, isAnonymous = false) => {
    try {
      const response = await fetch(`${API_URL}/grievances`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: grievanceData.subject || grievanceData.title,
          subject: grievanceData.subject || grievanceData.title,
          description: grievanceData.description || grievanceData.details,
          details: grievanceData.details || grievanceData.description,
          category: grievanceData.category,
          priority: grievanceData.priority || "medium",
          isAnonymous: isAnonymous,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("recentGrievance", JSON.stringify(data));
      }

      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get user's grievances
  getUserGrievances: async () => {
    try {
      const response = await fetch(`${API_URL}/grievances`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get all grievances (admin)
  getAllGrievances: async () => {
    try {
      const response = await fetch(`${API_URL}/grievances`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get single grievance by ID
  getGrievanceById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/grievances/${id}`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get by code
  getGrievanceByCode: async (code) => {
    try {
      const response = await fetch(`${API_URL}/grievances/code/${code}`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Delete grievance
  deleteGrievance: async (id) => {
    try {
      const response = await fetch(`${API_URL}/grievances/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Add comment
  addComment: async (id, comment) => {
    try {
      const response = await fetch(`${API_URL}/grievances/${id}/comment`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ comment }),
      });

      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get statistics
  getStatistics: async () => {
    try {
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// ═══════════════════════════════════════════════════════════════════
// ADMIN API
// ═══════════════════════════════════════════════════════════════════

export const adminAPI = {
  // Update grievance status
  updateStatus: async (id, updateData) => {
    try {
      const response = await fetch(`${API_URL}/admin/grievances/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: updateData.status,
          adminResponse: updateData.adminNotes || updateData.reviewComments || updateData.adminResponse,
          adminNotes: updateData.adminNotes,
          reviewComments: updateData.reviewComments,
          priority: updateData.priority,
        }),
      });

      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get dashboard stats
  getStats: async () => {
    try {
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get all users
  getAllUsers: async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update user status
  updateUserStatus: async (id, status) => {
    try {
      const response = await fetch(`${API_URL}/admin/users/${id}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get admin notifications
  getNotifications: async () => {
    try {
      const response = await fetch(`${API_URL}/admin/notifications`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Mark notification as read
  markNotificationRead: async (id) => {
    try {
      const response = await fetch(`${API_URL}/admin/notifications/${id}/read`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// ═══════════════════════════════════════════════════════════════════
// USER API
// ═══════════════════════════════════════════════════════════════════

export const userAPI = {
  // Get all users (admin)
  getUsers: async () => {
    return adminAPI.getAllUsers();
  },

  // Get user by ID
  getUserById: async (id) => {
    const result = await userAPI.getUsers();
    if (result.success) {
      const user = result.data.find((u) => u._id === id || u.email === id);
      return { success: !!user, data: user };
    }
    return result;
  },

  // Update user status
  updateUserStatus: async (id, status) => {
    return adminAPI.updateUserStatus(id, status);
  },

  // Get user's complaint count
  getUserComplaints: async (userEmail) => {
    const result = await grievanceAPI.getAllGrievances();
    if (result.success) {
      const count = result.data.filter(
        (g) =>
          g.submittedBy?.email === userEmail ||
          g.submittedBy?.uniEmail === userEmail ||
          g.submittedBy?.personalEmail === userEmail
      ).length;
      return { success: true, data: count };
    }
    return { success: false, data: 0 };
  },

  // Get stats
  getStats: async () => {
    const result = await userAPI.getUsers();
    if (result.success) {
      const users = result.data;
      return {
        success: true,
        data: {
          total: users.length,
          active: users.filter((u) => u.status === "active").length,
          blocked: users.filter((u) => u.status === "blocked").length,
          restricted: users.filter((u) => u.status === "restricted").length,
          removed: users.filter((u) => u.status === "removed").length,
        },
      };
    }
    return result;
  },

  // Activity logs
  logActivity: (log) => {
    const logs = JSON.parse(localStorage.getItem("activityLog") || "[]");
    logs.unshift({ id: Date.now(), ...log });
    localStorage.setItem("activityLog", JSON.stringify(logs.slice(0, 100)));
  },

  getActivityLogs: () => {
    return JSON.parse(localStorage.getItem("activityLog") || "[]");
  },
};

// Export default object
export default {
  auth: authAPI,
  grievance: grievanceAPI,
  admin: adminAPI,
  user: userAPI,
};
