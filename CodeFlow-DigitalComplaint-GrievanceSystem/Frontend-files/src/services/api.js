// API Service - Connects to Real Backend
const API_URL = "https://code-flow-863n.onrender.com/api";

// Helper: Get JWT token from localStorage
const getToken = () => localStorage.getItem("token");

// Helper: Get auth headers
const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ================= AUTH API =================
export const authAPI = {
  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
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

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
  },
};

// ================= GRIEVANCE API =================
export const grievanceAPI = {
  submitGrievance: async (grievanceData, isAnonymous = false) => {
    try {
      const response = await fetch(`${API_URL}/grievance`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: grievanceData.subject,
          subject: grievanceData.subject,
          description: grievanceData.description,
          category: grievanceData.category,
          priority: grievanceData.priority || "medium",
          isAnonymous,
        }),
      });

      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getUserGrievances: async () => {
    try {
      const response = await fetch(`${API_URL}/grievance`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getGrievanceById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/grievance/${id}`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  getGrievanceByCode: async (code) => {
    try {
      const response = await fetch(`${API_URL}/grievance/code/${code}`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  deleteGrievance: async (id) => {
    try {
      const response = await fetch(`${API_URL}/grievance/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  addComment: async (id, comment) => {
    try {
      const response = await fetch(`${API_URL}/grievance/${id}/comment`, {
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
};

// ================= ADMIN API =================
export const adminAPI = {
  updateStatus: async (id, updateData) => {
    try {
      const response = await fetch(`${API_URL}/admin/grievance/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

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
};

// ================= EXPORT =================
export default {
  auth: authAPI,
  grievance: grievanceAPI,
  admin: adminAPI,
};
