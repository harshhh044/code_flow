// authService.js — REAL BACKEND VERSION
// Replaces localStorage fake auth with real JWT-based auth

import { authAPI } from './api';

export const authService = {

  // ─── Register new user ───────────────────────────────────────────
  register: async (userData) => {
    const result = await authAPI.register(userData);
    if (!result.success) {
      throw new Error(result.data?.message || result.error || 'Registration failed');
    }
    return result.data;
  },

  // ─── Login ───────────────────────────────────────────────────────
  login: async (email, password) => {
    const result = await authAPI.login(email, password);
    if (!result.success) {
      throw new Error(result.data?.message || result.error || 'Invalid email or password');
    }
    return result.data;
  },

  // ─── Logout ──────────────────────────────────────────────────────
  logout: () => {
    authAPI.logout();
  },

  // ─── Get currently logged-in user (from localStorage cache) ──────
  getCurrentUser: () => {
    return authAPI.getCurrentUser();
  },

  // ─── Verify token with backend & get fresh user data ─────────────
  getMe: async () => {
    const result = await authAPI.getMe();
    if (!result.success) {
      // Token is invalid or expired — clear storage
      authAPI.logout();
      throw new Error('Session expired. Please log in again.');
    }
    // Refresh the cached user with fresh data from DB
    localStorage.setItem('currentUser', JSON.stringify(result.data));
    return result.data;
  },

  // ─── Check if user is authenticated ──────────────────────────────
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = authService.getCurrentUser();
    return !!(token && user);
  },

  // ─── Get user role ────────────────────────────────────────────────
  getUserRole: () => {
    const user = authService.getCurrentUser();
    return user?.role || null;
  },

  // ─── Check if user is admin ───────────────────────────────────────
  isAdmin: () => {
    return authService.getUserRole() === 'admin';
  },
};

export default authService;
