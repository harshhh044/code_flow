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
