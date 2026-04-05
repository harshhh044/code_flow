// Activity Log Service Tests
// Requirements: 7.6, 7.7

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { activityLogService, ACTIVITY_TYPES } from './activityLogService';
import { storageService } from './storageService';

describe('ActivityLogService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('logActivity', () => {
    it('should create activity log with correct structure', () => {
      // Requirement 7.1, 7.2, 7.3, 7.4, 7.5
      const type = ACTIVITY_TYPES.LOGIN;
      const userEmail = 'test@example.com';
      const details = { userName: 'Test User', role: 'student' };

      const logEntry = activityLogService.logActivity(type, userEmail, details);

      expect(logEntry).toHaveProperty('id');
      expect(logEntry).toHaveProperty('timestamp');
      expect(logEntry.type).toBe(type);
      expect(logEntry.userEmail).toBe(userEmail);
      expect(logEntry.details).toEqual(details);
      expect(new Date(logEntry.timestamp)).toBeInstanceOf(Date);
    });

    it('should store log in localStorage', () => {
      const type = ACTIVITY_TYPES.LOGOUT;
      const userEmail = 'user@example.com';
      const details = { timestamp: new Date().toISOString() };

      activityLogService.logActivity(type, userEmail, details);

      const logs = storageService.get('activityLogs', []);
      expect(logs).toHaveLength(1);
      expect(logs[0].type).toBe(type);
      expect(logs[0].userEmail).toBe(userEmail);
    });

    it('should support all activity types', () => {
      const userEmail = 'admin@example.com';
      
      // Test each activity type
      Object.values(ACTIVITY_TYPES).forEach(type => {
        const logEntry = activityLogService.logActivity(type, userEmail, {});
        expect(logEntry.type).toBe(type);
      });

      const logs = storageService.get('activityLogs', []);
      expect(logs).toHaveLength(Object.keys(ACTIVITY_TYPES).length);
    });

    it('should handle empty details object', () => {
      const logEntry = activityLogService.logActivity(
        ACTIVITY_TYPES.LOGIN,
        'test@example.com'
      );

      expect(logEntry.details).toEqual({});
    });

    it('should create unique IDs for each log entry', () => {
      activityLogService.logActivity(ACTIVITY_TYPES.LOGIN, 'user1@example.com', {});
      activityLogService.logActivity(ACTIVITY_TYPES.LOGIN, 'user2@example.com', {});

      const logs = storageService.get('activityLogs', []);
      expect(logs[0].id).not.toBe(logs[1].id);
    });
  });

  describe('getActivityLogs', () => {
    beforeEach(() => {
      // Create sample logs
      activityLogService.logActivity(ACTIVITY_TYPES.LOGIN, 'user1@example.com', { role: 'student' });
      activityLogService.logActivity(ACTIVITY_TYPES.LOGOUT, 'user1@example.com', {});
      activityLogService.logActivity(ACTIVITY_TYPES.LOGIN, 'user2@example.com', { role: 'admin' });
      activityLogService.logActivity(ACTIVITY_TYPES.GRIEVANCE_SUBMIT, 'user1@example.com', { code: 'GRV-001' });
      activityLogService.logActivity(ACTIVITY_TYPES.STATUS_CHANGE, 'admin@example.com', { targetUser: 'user1@example.com' });
    });

    it('should return all logs sorted by timestamp descending', () => {
      // Requirement 7.6
      const logs = activityLogService.getActivityLogs();

      expect(logs).toHaveLength(5);
      
      // Verify descending order (most recent first)
      for (let i = 0; i < logs.length - 1; i++) {
        const currentTime = new Date(logs[i].timestamp).getTime();
        const nextTime = new Date(logs[i + 1].timestamp).getTime();
        expect(currentTime).toBeGreaterThanOrEqual(nextTime);
      }
    });

    it('should filter logs by type', () => {
      // Requirement 7.7
      const loginLogs = activityLogService.getActivityLogs({ type: ACTIVITY_TYPES.LOGIN });

      expect(loginLogs).toHaveLength(2);
      loginLogs.forEach(log => {
        expect(log.type).toBe(ACTIVITY_TYPES.LOGIN);
      });
    });

    it('should filter logs by userEmail', () => {
      // Requirement 7.7
      const user1Logs = activityLogService.getActivityLogs({ userEmail: 'user1@example.com' });

      expect(user1Logs).toHaveLength(3);
      user1Logs.forEach(log => {
        expect(log.userEmail).toBe('user1@example.com');
      });
    });

    it('should filter logs by date range', () => {
      // Requirement 7.7
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      const logs = activityLogService.getActivityLogs({
        startDate: oneHourAgo.toISOString(),
        endDate: oneHourFromNow.toISOString()
      });

      expect(logs.length).toBeGreaterThan(0);
      logs.forEach(log => {
        const logTime = new Date(log.timestamp);
        expect(logTime.getTime()).toBeGreaterThanOrEqual(oneHourAgo.getTime());
        expect(logTime.getTime()).toBeLessThanOrEqual(oneHourFromNow.getTime());
      });
    });

    it('should filter logs by startDate only', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const logs = activityLogService.getActivityLogs({
        startDate: oneHourAgo.toISOString()
      });

      expect(logs.length).toBeGreaterThan(0);
      logs.forEach(log => {
        const logTime = new Date(log.timestamp);
        expect(logTime.getTime()).toBeGreaterThanOrEqual(oneHourAgo.getTime());
      });
    });

    it('should filter logs by endDate only', () => {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      const logs = activityLogService.getActivityLogs({
        endDate: oneHourFromNow.toISOString()
      });

      expect(logs.length).toBeGreaterThan(0);
      logs.forEach(log => {
        const logTime = new Date(log.timestamp);
        expect(logTime.getTime()).toBeLessThanOrEqual(oneHourFromNow.getTime());
      });
    });

    it('should combine multiple filters', () => {
      // Requirement 7.7
      const logs = activityLogService.getActivityLogs({
        type: ACTIVITY_TYPES.LOGIN,
        userEmail: 'user1@example.com'
      });

      expect(logs).toHaveLength(1);
      expect(logs[0].type).toBe(ACTIVITY_TYPES.LOGIN);
      expect(logs[0].userEmail).toBe('user1@example.com');
    });

    it('should return empty array when no logs match filters', () => {
      const logs = activityLogService.getActivityLogs({
        userEmail: 'nonexistent@example.com'
      });

      expect(logs).toEqual([]);
    });

    it('should return empty array when no logs exist', () => {
      localStorage.clear();
      const logs = activityLogService.getActivityLogs();

      expect(logs).toEqual([]);
    });
  });

  describe('clearAllLogs', () => {
    it('should clear all activity logs', () => {
      // Create some logs
      activityLogService.logActivity(ACTIVITY_TYPES.LOGIN, 'user1@example.com', {});
      activityLogService.logActivity(ACTIVITY_TYPES.LOGOUT, 'user2@example.com', {});

      const countBefore = storageService.get('activityLogs', []).length;
      expect(countBefore).toBe(2);

      const clearedCount = activityLogService.clearAllLogs();

      expect(clearedCount).toBe(2);
      const logsAfter = storageService.get('activityLogs', []);
      expect(logsAfter).toEqual([]);
    });

    it('should return 0 when no logs exist', () => {
      const clearedCount = activityLogService.clearAllLogs();
      expect(clearedCount).toBe(0);
    });
  });

  describe('Integration with other services', () => {
    it('should log Login activity type', () => {
      activityLogService.logActivity(
        ACTIVITY_TYPES.LOGIN,
        'student@example.com',
        { userName: 'John Doe', role: 'student' }
      );

      const logs = activityLogService.getActivityLogs({ type: ACTIVITY_TYPES.LOGIN });
      expect(logs).toHaveLength(1);
      expect(logs[0].details.userName).toBe('John Doe');
    });

    it('should log Logout activity type', () => {
      activityLogService.logActivity(
        ACTIVITY_TYPES.LOGOUT,
        'student@example.com',
        { timestamp: new Date().toISOString() }
      );

      const logs = activityLogService.getActivityLogs({ type: ACTIVITY_TYPES.LOGOUT });
      expect(logs).toHaveLength(1);
    });

    it('should log Grievance Submit activity type', () => {
      activityLogService.logActivity(
        ACTIVITY_TYPES.GRIEVANCE_SUBMIT,
        'student@example.com',
        { grievanceCode: 'GRV-2024-ABC1', category: 'academic', isAnonymous: false }
      );

      const logs = activityLogService.getActivityLogs({ type: ACTIVITY_TYPES.GRIEVANCE_SUBMIT });
      expect(logs).toHaveLength(1);
      expect(logs[0].details.grievanceCode).toBe('GRV-2024-ABC1');
    });

    it('should log Status Change activity type', () => {
      activityLogService.logActivity(
        ACTIVITY_TYPES.STATUS_CHANGE,
        'admin@example.com',
        { targetUser: 'student@example.com', newStatus: 'blocked' }
      );

      const logs = activityLogService.getActivityLogs({ type: ACTIVITY_TYPES.STATUS_CHANGE });
      expect(logs).toHaveLength(1);
      expect(logs[0].details.newStatus).toBe('blocked');
    });

    it('should log Data Reset activity type', () => {
      activityLogService.logActivity(
        ACTIVITY_TYPES.DATA_RESET,
        'admin@example.com',
        { targetUser: 'student@example.com', grievancesRemoved: 5 }
      );

      const logs = activityLogService.getActivityLogs({ type: ACTIVITY_TYPES.DATA_RESET });
      expect(logs).toHaveLength(1);
      expect(logs[0].details.grievancesRemoved).toBe(5);
    });
  });
});
