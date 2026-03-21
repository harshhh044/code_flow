// API Service - Connects to Real Backend
const API_URL = "http://localhost:5000/api";

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


  grievance: grievanceAPI,
  admin: adminAPI,
  user: userAPI,
};
