import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { authService } from './authService';
import { storageService } from './storageService';
import { activityLogService, ACTIVITY_TYPES } from './activityLogService';

/**
 * Preservation Property Tests for Login Bug Fix
 * 
 * These tests verify that successful login behavior remains unchanged
 * after implementing the fix for invalid credentials error messages.
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 */

describe('authService - Preservation Property Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Setup test users with various statuses
    const testUsers = [
      {
        id: '1',
        email: 'student1@test.com',
        password: 'password123',
        role: 'student',
        status: 'active',
        fullName: 'Active Student',
        uid: 'STU001'
      },
      {
        id: '2',
        email: 'admin1@test.com',
        password: 'admin123',
        role: 'admin',
        status: 'active',
        fullName: 'Active Admin',
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
      },
      {
        id: '4',
        email: 'restricted@test.com',
        password: 'password123',
        role: 'student',
        status: 'restricted',
        fullName: 'Restricted User',
        uid: 'STU003'
      },
      {
        id: '5',
        email: 'removed@test.com',
        password: 'password123',
        role: 'student',
        status: 'removed',
        fullName: 'Removed User',
        uid: 'STU004'
      }
    ];
    
    storageService.set('users', testUsers);
    storageService.set('sessions', []);
    storageService.set('activityLogs', []);
  });

  /**
   * Property 2: Preservation - Successful Login Behavior
   * 
   * For any login attempt where all credentials are correct (Role, UID, Email, Password all matching)
   * and account status is 'active', the authService.login function SHALL produce exactly the same result,
   * successfully authenticating the user, creating a session token, storing user data in localStorage,
   * and logging the activity.
   */
  describe('Property 2: Successful Login Preservation', () => {

    it('should successfully authenticate users with all correct credentials', () => {
      // Generator for valid active user credentials
      const validCredentialsArb = fc.constantFrom(
        { email: 'student1@test.com', password: 'password123', role: 'student', uid: 'STU001' },
        { email: 'admin1@test.com', password: 'admin123', role: 'admin', uid: 'ADM001' }
      );

      fc.assert(
        fc.property(validCredentialsArb, (credentials) => {
          // Clear sessions before each property test iteration
          storageService.set('sessions', []);
          storageService.set('activityLogs', []);

          // Attempt login with correct credentials
          const result = authService.login(
            credentials.email,
            credentials.password,
            credentials.role
          );

          // Verify successful authentication
          expect(result.success).toBe(true);
          expect(result.user).toBeDefined();
          expect(result.user.email).toBe(credentials.email);
          expect(result.user.role).toBe(credentials.role);
          expect(result.token).toBeDefined();
          expect(result.session).toBeDefined();
          expect(result.user.lastLogin).toBeDefined();

          // Verify session was created
          const sessions = storageService.get('sessions', []);
          expect(sessions.length).toBe(1);
          expect(sessions[0].userId).toBe(credentials.email);
          expect(sessions[0].token).toBe(result.token);

          // Verify activity log entry
          const logs = activityLogService.getActivityLogs();
          const loginLog = logs.find(log => log.type === ACTIVITY_TYPES.LOGIN);
          expect(loginLog).toBeDefined();
          expect(loginLog.userEmail).toBe(credentials.email);

          // Verify lastLogin was updated in storage
          const users = storageService.get('users', []);
          const user = users.find(u => u.email === credentials.email);
          expect(user.lastLogin).toBeDefined();
        }),
        { numRuns: 50 }
      );
    });

    it('should maintain session token structure and localStorage keys', () => {
      // Test that session data structure remains unchanged
      const result = authService.login('student1@test.com', 'password123', 'student');

      expect(result.success).toBe(true);
      
      // Verify session structure
      expect(result.session).toHaveProperty('token');
      expect(result.session).toHaveProperty('userId');
      expect(result.session).toHaveProperty('loginTime');
      expect(result.session).toHaveProperty('expiresAt');

      // Verify localStorage keys
      const sessions = storageService.get('sessions', []);
      expect(sessions).toBeDefined();
      expect(Array.isArray(sessions)).toBe(true);
    });

    it('should maintain activity log entry format for successful logins', () => {
      const result = authService.login('student1@test.com', 'password123', 'student');

      expect(result.success).toBe(true);

      // Verify activity log format
      const logs = activityLogService.getActivityLogs();
      const loginLog = logs.find(log => log.type === ACTIVITY_TYPES.LOGIN);

      expect(loginLog).toBeDefined();
      expect(loginLog).toHaveProperty('type');
      expect(loginLog).toHaveProperty('userEmail');
      expect(loginLog).toHaveProperty('details');
      expect(loginLog.details).toHaveProperty('userName');
      expect(loginLog.details).toHaveProperty('role');
      expect(loginLog.details).toHaveProperty('timestamp');
    });
  });

  /**
   * Account Status Preservation Tests
   * 
   * For any login attempt where account status is not 'active',
   * the system SHALL deny login with an appropriate status message.
   */
  describe('Property 2: Account Status Checking Preservation', () => {
    it('should deny login for all non-active account statuses', () => {
      // Generator for non-active account credentials
      const nonActiveAccountsArb = fc.constantFrom(
        { email: 'blocked@test.com', password: 'password123', role: 'student', status: 'blocked' },
        { email: 'restricted@test.com', password: 'password123', role: 'student', status: 'restricted' },
        { email: 'removed@test.com', password: 'password123', role: 'student', status: 'removed' }
      );

      fc.assert(
        fc.property(nonActiveAccountsArb, (credentials) => {
          // Attempt login with non-active account
          const result = authService.login(
            credentials.email,
            credentials.password,
            credentials.role
          );

          // Verify login is denied
          expect(result.success).toBe(false);
          expect(result.error).toContain('Account status');
          expect(result.error).toContain(credentials.status);
          expect(result.accountStatus).toBe(credentials.status);

          // Verify no session was created
          const sessions = storageService.get('sessions', []);
          expect(sessions.length).toBe(0);

          // Verify failed login was logged
          const logs = storageService.get('activityLog', []);
          const failedLog = logs.find(log => log.type === 'Failed Login');
          expect(failedLog).toBeDefined();
          expect(failedLog.description).toContain('Account status');
        }),
        { numRuns: 30 }
      );
    });

    it('should provide specific status message for blocked accounts', () => {
      const result = authService.login('blocked@test.com', 'password123', 'student');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Login denied. Account status: blocked');
      expect(result.accountStatus).toBe('blocked');
    });

    it('should provide specific status message for restricted accounts', () => {
      const result = authService.login('restricted@test.com', 'password123', 'student');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Login denied. Account status: restricted');
      expect(result.accountStatus).toBe('restricted');
    });

    it('should provide specific status message for removed accounts', () => {
      const result = authService.login('removed@test.com', 'password123', 'student');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Login denied. Account status: removed');
      expect(result.accountStatus).toBe('removed');
    });
  });

  /**
   * Failed Login Logging Preservation
   * 
   * When authentication fails, the system SHALL continue to log
   * the failed login attempt for security monitoring.
   */
  describe('Property 2: Failed Login Logging Preservation', () => {
    it('should log failed login attempts for invalid credentials', () => {
      // Generator for invalid credentials
      const invalidCredentialsArb = fc.record({
        email: fc.constantFrom('student1@test.com', 'admin1@test.com', 'wrong@test.com'),
        password: fc.constantFrom('wrongpassword', 'incorrect123'),
        role: fc.constantFrom('student', 'admin')
      });

      fc.assert(
        fc.property(invalidCredentialsArb, (credentials) => {
          // Clear activity log before test
          storageService.set('activityLog', []);

          // Attempt login with invalid credentials
          const result = authService.login(
            credentials.email,
            credentials.password,
            credentials.role
          );

          // If login failed (which it should for wrong credentials)
          if (!result.success && !result.accountStatus) {
            // Verify failed login was logged
            const logs = storageService.get('activityLog', []);
            const failedLog = logs.find(log => log.type === 'Failed Login');
            expect(failedLog).toBeDefined();
            expect(failedLog.user).toBe(credentials.email);
            expect(failedLog.description).toContain('Failed login attempt');
          }
        }),
        { numRuns: 30 }
      );
    });

    it('should maintain failed login log format', () => {
      authService.login('student1@test.com', 'wrongpassword', 'student');

      const logs = storageService.get('activityLog', []);
      const failedLog = logs.find(log => log.type === 'Failed Login');

      expect(failedLog).toBeDefined();
      expect(failedLog).toHaveProperty('id');
      expect(failedLog).toHaveProperty('type');
      expect(failedLog).toHaveProperty('user');
      expect(failedLog).toHaveProperty('description');
      expect(failedLog).toHaveProperty('date');
    });
  });
});
