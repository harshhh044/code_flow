import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService, detectEmailTypo } from './authService';
import { sessionService } from './sessionService';
import { userService } from './userService';
import { storageService } from './storageService';
import { activityLogService, ACTIVITY_TYPES } from './activityLogService';

describe('authService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
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
    storageService.set('activityLogs', []);
  });

  describe('login', () => {
    it('should successfully login with valid credentials', () => {
      const result = authService.login('student@test.com', 'password123', 'student', 'STU001');
      
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('student@test.com');
      expect(result.token).toBeDefined();
      expect(result.session).toBeDefined();
      expect(result.user.lastLogin).toBeDefined();
    });

    it('should reject login with invalid email', () => {
      const result = authService.login('wrong@test.com', 'password123', 'student', 'STU001');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('UID found but email doesn\'t match');
    });

    it('should reject login with invalid password', () => {
      const result = authService.login('student@test.com', 'wrongpassword', 'student', 'STU001');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Incorrect password');
    });

    it('should reject login with wrong role', () => {
      const result = authService.login('student@test.com', 'password123', 'admin', 'STU001');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Role mismatch');
    });

    it('should reject login if account status is not active', () => {
      const result = authService.login('blocked@test.com', 'password123', 'student', 'STU002');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Account status: blocked');
      expect(result.accountStatus).toBe('blocked');
    });

    it('should reject login with missing email', () => {
      const result = authService.login('', 'password123', 'student', 'STU001');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should reject login with missing password', () => {
      const result = authService.login('student@test.com', '', 'student', 'STU001');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should reject login with missing role', () => {
      const result = authService.login('student@test.com', 'password123', '', 'STU001');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should create a session on successful login', () => {
      const result = authService.login('student@test.com', 'password123', 'student', 'STU001');
      
      expect(result.success).toBe(true);
      
      // Verify session was created
      const sessions = storageService.get('sessions', []);
      expect(sessions.length).toBe(1);
      expect(sessions[0].userId).toBe('student@test.com');
      expect(sessions[0].token).toBe(result.token);
    });

    it('should update lastLogin timestamp on successful login', () => {
      const result = authService.login('student@test.com', 'password123', 'student', 'STU001');
      
      expect(result.success).toBe(true);
      
      // Verify lastLogin was updated in storage
      const users = storageService.get('users', []);
      const user = users.find(u => u.email === 'student@test.com');
      expect(user.lastLogin).toBeDefined();
      
      // Verify lastLogin is recent (within last second)
      const lastLoginTime = new Date(user.lastLogin).getTime();
      const now = Date.now();
      expect(now - lastLoginTime).toBeLessThan(1000);
    });

    it('should log successful login to activity log', () => {
      authService.login('student@test.com', 'password123', 'student', 'STU001');
      
      const logs = activityLogService.getActivityLogs();
      expect(logs.length).toBeGreaterThan(0);
      
      const loginLog = logs.find(log => log.type === ACTIVITY_TYPES.LOGIN);
      expect(loginLog).toBeDefined();
      expect(loginLog.userEmail).toBe('student@test.com');
      expect(loginLog.details.userName).toContain('Test Student');
    });

    it('should log failed login attempts', () => {
      authService.login('student@test.com', 'wrongpassword', 'student', 'STU001');
      
      const logs = storageService.get('activityLog', []);
      expect(logs.length).toBeGreaterThan(0);
      
      const failedLog = logs.find(log => log.type === 'Failed Login');
      expect(failedLog).toBeDefined();
      expect(failedLog.user).toBe('student@test.com');
      expect(failedLog.description).toContain('Failed login attempt');
    });

    it('should log failed login for blocked account', () => {
      authService.login('blocked@test.com', 'password123', 'student', 'STU002');
      
      const logs = storageService.get('activityLog', []);
      const failedLog = logs.find(log => log.type === 'Failed Login');
      
      expect(failedLog).toBeDefined();
      expect(failedLog.description).toContain('Account status: blocked');
    });
  });

  describe('logout', () => {
    it('should successfully logout and invalidate session', () => {
      // First login
      const loginResult = authService.login('student@test.com', 'password123', 'student', 'STU001');
      expect(loginResult.success).toBe(true);
      
      // Then logout
      const logoutResult = authService.logout(loginResult.token, 'student@test.com');
      expect(logoutResult).toBe(true);
      
      // Verify session was invalidated
      const sessions = storageService.get('sessions', []);
      expect(sessions.length).toBe(0);
    });

    it('should log logout to activity log', () => {
      // First login
      const loginResult = authService.login('student@test.com', 'password123', 'student', 'STU001');
      
      // Clear activity log to isolate logout log
      storageService.set('activityLogs', []);
      
      // Then logout
      authService.logout(loginResult.token, 'student@test.com');
      
      const logs = activityLogService.getActivityLogs();
      const logoutLog = logs.find(log => log.type === ACTIVITY_TYPES.LOGOUT);
      
      expect(logoutLog).toBeDefined();
      expect(logoutLog.userEmail).toBe('student@test.com');
    });

    it('should return false for invalid token', () => {
      const result = authService.logout('invalid-token', 'student@test.com');
      expect(result).toBe(false);
    });
  });

  describe('detectEmailTypo', () => {
    it('should detect gmal.com typo and suggest gmail.com', () => {
      const result = detectEmailTypo('user@gmal.com');
      expect(result.hasTypo).toBe(true);
      expect(result.suggestion).toBe('user@gmail.com');
    });

    it('should detect yahooo.com typo and suggest yahoo.com', () => {
      const result = detectEmailTypo('user@yahooo.com');
      expect(result.hasTypo).toBe(true);
      expect(result.suggestion).toBe('user@yahoo.com');
    });

    it('should detect outlok.com typo and suggest outlook.com', () => {
      const result = detectEmailTypo('user@outlok.com');
      expect(result.hasTypo).toBe(true);
      expect(result.suggestion).toBe('user@outlook.com');
    });

    it('should return no typo for valid gmail.com domain', () => {
      const result = detectEmailTypo('user@gmail.com');
      expect(result.hasTypo).toBe(false);
      expect(result.suggestion).toBe('');
    });

    it('should return no typo for valid yahoo.com domain', () => {
      const result = detectEmailTypo('user@yahoo.com');
      expect(result.hasTypo).toBe(false);
      expect(result.suggestion).toBe('');
    });

    it('should return no typo for valid outlook.com domain', () => {
      const result = detectEmailTypo('user@outlook.com');
      expect(result.hasTypo).toBe(false);
      expect(result.suggestion).toBe('');
    });

    it('should handle email without @ symbol', () => {
      const result = detectEmailTypo('notanemail');
      expect(result.hasTypo).toBe(false);
      expect(result.suggestion).toBe('');
    });

    it('should handle null email', () => {
      const result = detectEmailTypo(null);
      expect(result.hasTypo).toBe(false);
      expect(result.suggestion).toBe('');
    });

    it('should handle undefined email', () => {
      const result = detectEmailTypo(undefined);
      expect(result.hasTypo).toBe(false);
      expect(result.suggestion).toBe('');
    });

    it('should handle empty string', () => {
      const result = detectEmailTypo('');
      expect(result.hasTypo).toBe(false);
      expect(result.suggestion).toBe('');
    });

    it('should be case-insensitive for domain matching', () => {
      const result = detectEmailTypo('user@GMAL.COM');
      expect(result.hasTypo).toBe(true);
      expect(result.suggestion).toBe('user@gmail.com');
    });

    it('should preserve local part case when suggesting correction', () => {
      const result = detectEmailTypo('User.Name@gmal.com');
      expect(result.hasTypo).toBe(true);
      expect(result.suggestion).toBe('User.Name@gmail.com');
    });
  });
});

