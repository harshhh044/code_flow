import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { sessionService } from '../services/sessionService';
import { PERMISSIONS } from '../services/dataIsolationService';

// Mock the services
vi.mock('../services/sessionService', () => ({
  sessionService: {
    validateSession: vi.fn(),
    invalidateSession: vi.fn()
  }
}));

vi.mock('../services/dataIsolationService', () => ({
  dataIsolationService: {
    checkPermission: vi.fn((user, permission) => {
      // Simple mock implementation based on role
      if (!user || !user.role) return false;
      
      const adminPermissions = ['view_all_users', 'manage_users', 'view_all_grievances', 'update_grievance_status', 'delete_data'];
      const studentPermissions = ['view_own_data', 'submit_grievance'];
      
      if (user.role === 'admin') {
        return adminPermissions.includes(permission);
      }
      if (user.role === 'student') {
        return studentPermissions.includes(permission);
      }
      return false;
    })
  },
  PERMISSIONS: {
    VIEW_ALL_USERS: 'view_all_users',
    MANAGE_USERS: 'manage_users',
    VIEW_ALL_GRIEVANCES: 'view_all_grievances',
    UPDATE_GRIEVANCE_STATUS: 'update_grievance_status',
    DELETE_DATA: 'delete_data',
    VIEW_OWN_DATA: 'view_own_data',
    SUBMIT_GRIEVANCE: 'submit_grievance'
  }
}));

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with no user and not authenticated', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isStudent).toBe(false);
    });

    it('should set loading to false after initialization', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Login', () => {
    it('should set user with role and permissions on login', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      const userData = {
        id: 'user1',
        email: 'student@test.com',
        name: 'Test Student'
      };
      const token = 'test-token-123';

      act(() => {
        result.current.login(userData, token);
      });

      expect(result.current.user).toEqual({
        ...userData,
        role: 'student',
        permissions: [PERMISSIONS.VIEW_OWN_DATA, PERMISSIONS.SUBMIT_GRIEVANCE]
      });
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isStudent).toBe(true);
      expect(localStorage.getItem('currentUser')).toBeTruthy();
      expect(localStorage.getItem('authToken')).toBe(token);
    });

    it('should set admin role and permissions for admin user', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      const adminData = {
        id: 'admin1',
        email: 'admin@test.com',
        name: 'Test Admin',
        role: 'admin'
      };
      const token = 'admin-token-123';

      act(() => {
        result.current.login(adminData, token);
      });

      expect(result.current.user.role).toBe('admin');
      expect(result.current.user.permissions).toEqual([
        PERMISSIONS.VIEW_ALL_USERS,
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.VIEW_ALL_GRIEVANCES,
        PERMISSIONS.UPDATE_GRIEVANCE_STATUS,
        PERMISSIONS.DELETE_DATA
      ]);
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isStudent).toBe(false);
    });

    it('should default to student role if no role provided', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      const userData = {
        id: 'user1',
        email: 'user@test.com'
      };

      act(() => {
        result.current.login(userData, 'token');
      });

      expect(result.current.user.role).toBe('student');
      expect(result.current.user.permissions).toEqual([
        PERMISSIONS.VIEW_OWN_DATA,
        PERMISSIONS.SUBMIT_GRIEVANCE
      ]);
    });
  });

  describe('Logout', () => {
    it('should clear user state and call sessionService.invalidateSession', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      const token = 'test-token-123';
      
      act(() => {
        result.current.login({ id: 'user1', email: 'test@test.com' }, token);
      });

      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(sessionService.invalidateSession).toHaveBeenCalledWith(token);
      expect(localStorage.getItem('currentUser')).toBeNull();
      expect(localStorage.getItem('authToken')).toBeNull();
    });

    it('should not call invalidateSession if no token exists', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      act(() => {
        result.current.logout();
      });

      expect(sessionService.invalidateSession).not.toHaveBeenCalled();
    });
  });

  describe('Session Validation on Load', () => {
    it('should restore session if valid token exists', async () => {
      const userData = {
        id: 'user1',
        email: 'test@test.com',
        role: 'student',
        permissions: [PERMISSIONS.VIEW_OWN_DATA, PERMISSIONS.SUBMIT_GRIEVANCE]
      };
      const token = 'valid-token';

      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('authToken', token);

      sessionService.validateSession.mockReturnValue({ userId: 'user1', token });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(sessionService.validateSession).toHaveBeenCalledWith(token);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(userData);
    });

    it('should clear session if token is invalid', async () => {
      const userData = {
        id: 'user1',
        email: 'test@test.com',
        role: 'student'
      };
      const token = 'invalid-token';

      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('authToken', token);

      sessionService.validateSession.mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(sessionService.validateSession).toHaveBeenCalledWith(token);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
    });

    it('should add permissions if missing from stored user', async () => {
      const userData = {
        id: 'user1',
        email: 'test@test.com',
        role: 'admin'
        // No permissions field
      };
      const token = 'valid-token';

      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('authToken', token);

      sessionService.validateSession.mockReturnValue({ userId: 'user1', token });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user.permissions).toEqual([
        PERMISSIONS.VIEW_ALL_USERS,
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.VIEW_ALL_GRIEVANCES,
        PERMISSIONS.UPDATE_GRIEVANCE_STATUS,
        PERMISSIONS.DELETE_DATA
      ]);
    });
  });

  describe('UpdateUser', () => {
    it('should update user data in state and localStorage', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      act(() => {
        result.current.login({ id: 'user1', email: 'test@test.com', name: 'Old Name' }, 'token');
      });

      act(() => {
        result.current.updateUser({ name: 'New Name' });
      });

      expect(result.current.user.name).toBe('New Name');
      expect(result.current.user.email).toBe('test@test.com');
      
      const storedUser = JSON.parse(localStorage.getItem('currentUser'));
      expect(storedUser.name).toBe('New Name');
    });

    it('should update permissions when role changes', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      act(() => {
        result.current.login({ id: 'user1', email: 'test@test.com', role: 'student' }, 'token');
      });

      expect(result.current.user.permissions).toEqual([
        PERMISSIONS.VIEW_OWN_DATA,
        PERMISSIONS.SUBMIT_GRIEVANCE
      ]);

      act(() => {
        result.current.updateUser({ role: 'admin' });
      });

      expect(result.current.user.permissions).toEqual([
        PERMISSIONS.VIEW_ALL_USERS,
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.VIEW_ALL_GRIEVANCES,
        PERMISSIONS.UPDATE_GRIEVANCE_STATUS,
        PERMISSIONS.DELETE_DATA
      ]);
    });
  });

  describe('hasPermission', () => {
    it('should return false when no user is logged in', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      expect(result.current.hasPermission(PERMISSIONS.VIEW_OWN_DATA)).toBe(false);
    });

    it('should return true for admin user with admin permission', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      const userData = { id: 'user1', email: 'test@test.com', role: 'admin' };
      
      act(() => {
        result.current.login(userData, 'token');
      });

      const hasPermission = result.current.hasPermission(PERMISSIONS.MANAGE_USERS);
      expect(hasPermission).toBe(true);
    });

    it('should return false for student user with admin permission', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      const userData = { id: 'user1', email: 'test@test.com', role: 'student' };
      
      act(() => {
        result.current.login(userData, 'token');
      });

      const hasPermission = result.current.hasPermission(PERMISSIONS.MANAGE_USERS);
      expect(hasPermission).toBe(false);
    });
  });

  describe('Role Helpers', () => {
    it('should correctly identify admin users', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      act(() => {
        result.current.login({ id: 'admin1', email: 'admin@test.com', role: 'admin' }, 'token');
      });

      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isStudent).toBe(false);
    });

    it('should correctly identify student users', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      act(() => {
        result.current.login({ id: 'user1', email: 'student@test.com', role: 'student' }, 'token');
      });

      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isStudent).toBe(true);
    });
  });
});
