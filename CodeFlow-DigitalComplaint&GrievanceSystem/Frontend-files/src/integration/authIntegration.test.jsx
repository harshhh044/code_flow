import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { sessionService } from '../services/sessionService';
import { storageService } from '../services/storageService';

/**
 * Integration Tests for AuthContext and authService
 * 
 * These tests verify the complete flow between AuthContext and authService,
 * including session management, login/logout flows, and session persistence.
 * 
 * **Validates: Requirements 1.1, 1.2, 1.5, 1.6**
 */
describe('AuthContext and authService Integration', () => {
  beforeEach(() => {
    // Clear all storage before each test
    localStorage.clear();
    
    // Setup test users
    const testUsers = [
      {
        id: '1',
        email: 'student@test.com',
        password: 'password123',
        role: 'student',
        status: 'active',
        fullName: 'Test Student',
        uid: 'STU001'
      },
      {
        id: '2',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin',
        status: 'active',
        fullName: 'Test Admin',
        uid: 'ADM001'
      },
      {
        id: '3',
        email: 'blocked@test.com',
        password: 'password123',
        role: 'student',
        status: 'blocked',
        fullName: 'Blocked User',
        uid: 'STU002'
      }
    ];
    
    storageService.set('users', testUsers);
    storageService.set('sessions', []);
    storageService.set('activityLog', []);
  });

  describe('Login Flow with Session Creation', () => {
    /**
     * **Validates: Requirement 1.1**
     * WHEN a user provides valid email and password, THE System SHALL authenticate 
     * the user and create a session with a unique token
     */
    it('should complete full login flow with session creation', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      // Perform login through authService
      const loginResult = authService.login('student@test.com', 'password123', 'student', 'STU001');
      
      expect(loginResult.success).toBe(true);
      expect(loginResult.token).toBeDefined();
      expect(loginResult.session).toBeDefined();
      
      // Verify session was created in storage
      const sessions = storageService.get('sessions', []);
      expect(sessions.length).toBe(1);
      expect(sessions[0].token).toBe(loginResult.token);
      expect(sessions[0].userId).toBe('student@test.com');
      
      // Update AuthContext with login result
      act(() => {
        result.current.login(loginResult.user, loginResult.token);
      });
      
      // Verify AuthContext state
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user.email).toBe('student@test.com');
      expect(result.current.user.role).toBe('student');
      
      // Verify localStorage was updated
      expect(localStorage.getItem('authToken')).toBe(loginResult.token);
      expect(localStorage.getItem('currentUser')).toBeTruthy();
    });

    /**
     * **Validates: Requirement 1.1**
     * Verify that session token is cryptographically secure
     */
    it('should create session with cryptographically secure token', () => {
      const loginResult = authService.login('student@test.com', 'password123', 'student', 'STU001');
      
      expect(loginResult.success).toBe(true);
      expect(loginResult.token).toBeDefined();
      expect(loginResult.token.length).toBeGreaterThan(32); // Secure tokens should be long
      expect(typeof loginResult.token).toBe('string');
      
      // Verify session structure
      expect(loginResult.session.userId).toBe('student@test.com');
      expect(loginResult.session.loginTime).toBeDefined();
      expect(loginResult.session.expiresAt).toBeDefined();
    });

    /**
     * **Validates: Requirement 1.1**
     * Verify lastLogin timestamp is updated on successful login
     */
    it('should update lastLogin timestamp on successful login', () => {
      const loginResult = authService.login('student@test.com', 'password123', 'student', 'STU001');
      
      expect(loginResult.success).toBe(true);
      expect(loginResult.user.lastLogin).toBeDefined();
      
      // Verify lastLogin is recent
      const lastLoginTime = new Date(loginResult.user.lastLogin).getTime();
      const now = Date.now();
      expect(now - lastLoginTime).toBeLessThan(1000);
      
      // Verify it's persisted in storage
      const users = storageService.get('users', []);
      const user = users.find(u => u.email === 'student@test.com');
      expect(user.lastLogin).toBeDefined();
    });
  });

  describe('Logout Invalidates Session', () => {
    /**
     * **Validates: Requirement 1.6**
     * WHEN a user logs out, THE System SHALL invalidate the session token 
     * and clear authentication state
     */
    it('should invalidate session on logout', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      // Login first
      const loginResult = authService.login('student@test.com', 'password123', 'student', 'STU001');
      expect(loginResult.success).toBe(true);
      
      act(() => {
        result.current.login(loginResult.user, loginResult.token);
      });
      
      expect(result.current.isAuthenticated).toBe(true);
      
      // Verify session exists
      let sessions = storageService.get('sessions', []);
      expect(sessions.length).toBe(1);
      
      // Logout
      act(() => {
        result.current.logout();
      });
      
      // Verify AuthContext state is cleared
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      
      // Verify session was invalidated
      sessions = storageService.get('sessions', []);
      expect(sessions.length).toBe(0);
      
      // Verify localStorage was cleared
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
    });

    /**
     * **Validates: Requirement 1.6**
     * Verify logout logs activity
     */
    it('should log logout activity', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      // Login first
      const loginResult = authService.login('student@test.com', 'password123', 'student', 'STU001');
      
      act(() => {
        result.current.login(loginResult.user, loginResult.token);
      });
      
      // Clear activity log to isolate logout log
      storageService.set('activityLogs', []);
      
      // Logout
      act(() => {
        result.current.logout();
      });
      
      // Verify logout was logged
      const logs = storageService.get('activityLogs', []);
      const logoutLog = logs.find(log => log.type === 'Logout');
      
      expect(logoutLog).toBeDefined();
      expect(logoutLog.userEmail).toBe('student@test.com');
    });

    /**
     * **Validates: Requirement 1.6**
     * Verify session validation fails after logout
     */
    it('should fail session validation after logout', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      // Login
      const loginResult = authService.login('student@test.com', 'password123', 'student', 'STU001');
      const token = loginResult.token;
      
      act(() => {
        result.current.login(loginResult.user, token);
      });
      
      // Verify session is valid
      let validSession = sessionService.validateSession(token);
      expect(validSession).toBeTruthy();
      
      // Logout
      act(() => {
        result.current.logout();
      });
      
      // Verify session is no longer valid
      validSession = sessionService.validateSession(token);
      expect(validSession).toBeNull();
    });
  });

  describe('Blocked User Cannot Login', () => {
    /**
     * **Validates: Requirement 1.2**
     * WHEN a user's account status is not 'active', THE System SHALL reject 
     * the login attempt and display the account status
     */
    it('should reject login for blocked user', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      // Attempt login with blocked account
      const loginResult = authService.login('blocked@test.com', 'password123', 'student', 'STU002');
      
      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toContain('Account status: blocked');
      expect(loginResult.accountStatus).toBe('blocked');
      
      // Verify no session was created
      const sessions = storageService.get('sessions', []);
      expect(sessions.length).toBe(0);
      
      // Verify AuthContext remains unauthenticated
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    /**
     * **Validates: Requirement 1.2**
     * Verify failed login attempt is logged for blocked user
     */
    it('should log failed login attempt for blocked user', () => {
      authService.login('blocked@test.com', 'password123', 'student', 'STU002');
      
      const logs = storageService.get('activityLog', []);
      const failedLog = logs.find(log => log.type === 'Failed Login');
      
      expect(failedLog).toBeDefined();
      expect(failedLog.user).toBe('blocked@test.com');
      expect(failedLog.description).toContain('Account status: blocked');
    });

    /**
     * **Validates: Requirement 1.2**
     * Verify session validation fails for blocked user
     */
    it('should invalidate existing session when user is blocked', () => {
      // Login with active account
      const loginResult = authService.login('student@test.com', 'password123', 'student', 'STU001');
      expect(loginResult.success).toBe(true);
      const token = loginResult.token;
      
      // Verify session is valid
      let validSession = sessionService.validateSession(token);
      expect(validSession).toBeTruthy();
      
      // Change user status to blocked
      const users = storageService.get('users', []);
      const userIndex = users.findIndex(u => u.email === 'student@test.com');
      users[userIndex].status = 'blocked';
      storageService.set('users', users);
      
      // Verify session is now invalid
      validSession = sessionService.validateSession(token);
      expect(validSession).toBeNull();
    });
  });

  describe('Session Persistence Across Page Refresh', () => {
    /**
     * **Validates: Requirement 1.5**
     * WHEN a user's session is active, THE System SHALL persist the authentication 
     * state across page refreshes
     */
    it('should restore session from localStorage on page refresh', async () => {
      // Simulate initial login
      const loginResult = authService.login('student@test.com', 'password123', 'student', 'STU001');
      expect(loginResult.success).toBe(true);
      
      // Store user and token in localStorage (simulating AuthContext.login)
      const userWithPermissions = {
        ...loginResult.user,
        role: 'student',
        permissions: ['view_own_data', 'submit_grievance']
      };
      localStorage.setItem('currentUser', JSON.stringify(userWithPermissions));
      localStorage.setItem('authToken', loginResult.token);
      
      // Create new AuthContext instance (simulating page refresh)
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      // Wait for initialization to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      // Verify session was restored
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toBeTruthy();
      expect(result.current.user.email).toBe('student@test.com');
      expect(result.current.user.role).toBe('student');
    });

    /**
     * **Validates: Requirement 1.5**
     * Verify expired session is not restored on page refresh
     */
    it('should not restore expired session on page refresh', async () => {
      // Create an expired session manually
      const expiredToken = 'expired-token-123';
      const expiredSession = {
        userId: 'student@test.com',
        token: expiredToken,
        loginTime: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
        expiresAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
      };
      
      storageService.set('sessions', [expiredSession]);
      
      const userData = {
        id: '1',
        email: 'student@test.com',
        role: 'student',
        permissions: ['view_own_data', 'submit_grievance']
      };
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('authToken', expiredToken);
      
      // Create new AuthContext instance (simulating page refresh)
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      // Wait for initialization to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      // Verify session was not restored
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      
      // Verify localStorage was cleared
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
    });

    /**
     * **Validates: Requirement 1.5**
     * Verify session with missing user data is not restored
     */
    it('should not restore session if user data is missing', async () => {
      const loginResult = authService.login('student@test.com', 'password123', 'student', 'STU001');
      
      // Only store token, not user data
      localStorage.setItem('authToken', loginResult.token);
      
      // Create new AuthContext instance
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      // Verify session was not restored
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    /**
     * **Validates: Requirement 1.5**
     * Verify permissions are restored correctly on page refresh
     */
    it('should restore user permissions on page refresh', async () => {
      // Login as admin
      const loginResult = authService.login('admin@test.com', 'admin123', 'admin', 'ADM001');
      expect(loginResult.success).toBe(true);
      
      const adminWithPermissions = {
        ...loginResult.user,
        role: 'admin',
        permissions: [
          'view_all_users',
          'manage_users',
          'view_all_grievances',
          'update_grievance_status',
          'delete_data'
        ]
      };
      localStorage.setItem('currentUser', JSON.stringify(adminWithPermissions));
      localStorage.setItem('authToken', loginResult.token);
      
      // Create new AuthContext instance
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      // Verify admin permissions were restored
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.user.permissions).toContain('manage_users');
      expect(result.current.user.permissions).toContain('view_all_grievances');
    });
  });

  describe('Complete Authentication Flow', () => {
    /**
     * Integration test covering the complete authentication lifecycle
     * **Validates: Requirements 1.1, 1.5, 1.6**
     */
    it('should handle complete login -> persist -> logout flow', async () => {
      // Step 1: Initial login
      const { result: result1 } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      const loginResult = authService.login('student@test.com', 'password123', 'student', 'STU001');
      expect(loginResult.success).toBe(true);
      
      act(() => {
        result1.current.login(loginResult.user, loginResult.token);
      });
      
      expect(result1.current.isAuthenticated).toBe(true);
      
      // Step 2: Simulate page refresh by creating new context
      const { result: result2 } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      await waitFor(() => {
        expect(result2.current.loading).toBe(false);
      });
      
      // Verify session persisted
      expect(result2.current.isAuthenticated).toBe(true);
      expect(result2.current.user.email).toBe('student@test.com');
      
      // Step 3: Logout
      act(() => {
        result2.current.logout();
      });
      
      expect(result2.current.isAuthenticated).toBe(false);
      
      // Step 4: Simulate another page refresh
      const { result: result3 } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      await waitFor(() => {
        expect(result3.current.loading).toBe(false);
      });
      
      // Verify session is not restored after logout
      expect(result3.current.isAuthenticated).toBe(false);
      expect(result3.current.user).toBeNull();
    });
  });
});
