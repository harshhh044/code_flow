// Unit tests for DataCleanupService
// Requirements: 8.1, 8.2, 8.3, 8.6

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dataCleanupService } from './dataCleanupService';
import { storageService } from './storageService';
import { activityLogService } from './activityLogService';

// Mock the storage service
vi.mock('./storageService', () => ({
  storageService: {
    get: vi.fn(),
    set: vi.fn()
  }
}));

// Mock the activity log service
vi.mock('./activityLogService', () => ({
  activityLogService: {
    logActivity: vi.fn()
  },
  ACTIVITY_TYPES: {
    DATA_RESET: 'Data Reset'
  }
}));

describe('DataCleanupService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('completeDataCleanup', () => {
    it('should remove all users except admins', () => {
      const mockUsers = [
        { id: '1', email: 'admin@test.com', role: 'admin', fullName: 'Admin User' },
        { id: '2', email: 'student1@test.com', role: 'student', fullName: 'Student One' },
        { id: '3', email: 'student2@test.com', role: 'student', fullName: 'Student Two' }
      ];

      storageService.get.mockImplementation((key) => {
        if (key === 'users') return mockUsers;
        if (key === 'grievanceDatabase') return {};
        if (key === 'anonymousGrievanceDatabase') return [];
        if (key === 'sessions') return [];
        if (key === 'activityLogs') return [];
        return [];
      });

      const result = dataCleanupService.completeDataCleanup('admin@test.com');

      expect(result.success).toBe(true);
      expect(result.usersRemoved).toBe(2);
      expect(storageService.set).toHaveBeenCalledWith('users', [mockUsers[0]]);
    });

    it('should remove all grievances from storage', () => {
      const mockGrievanceDB = {
        'Academic': [
          { id: '1', userId: 'student1@test.com', title: 'Test Grievance 1' },
          { id: '2', userId: 'student2@test.com', title: 'Test Grievance 2' }
        ],
        'Infrastructure': [
          { id: '3', userId: 'student1@test.com', title: 'Test Grievance 3' }
        ]
      };

      storageService.get.mockImplementation((key) => {
        if (key === 'users') return [{ id: '1', email: 'admin@test.com', role: 'admin' }];
        if (key === 'grievanceDatabase') return mockGrievanceDB;
        if (key === 'anonymousGrievanceDatabase') return [];
        if (key === 'sessions') return [];
        if (key === 'activityLogs') return [];
        return [];
      });

      const result = dataCleanupService.completeDataCleanup('admin@test.com');

      expect(result.success).toBe(true);
      expect(result.grievancesRemoved).toBe(3);
      expect(storageService.set).toHaveBeenCalledWith('grievanceDatabase', {});
    });

    it('should remove all activity logs', () => {
      const mockLogs = [
        { id: '1', type: 'Login', userEmail: 'student@test.com' },
        { id: '2', type: 'Logout', userEmail: 'student@test.com' }
      ];

      storageService.get.mockImplementation((key) => {
        if (key === 'users') return [{ id: '1', email: 'admin@test.com', role: 'admin' }];
        if (key === 'grievanceDatabase') return {};
        if (key === 'anonymousGrievanceDatabase') return [];
        if (key === 'sessions') return [];
        if (key === 'activityLogs') return mockLogs;
        return [];
      });

      const result = dataCleanupService.completeDataCleanup('admin@test.com');

      expect(result.success).toBe(true);
      expect(result.logsCleared).toBe(2);
      expect(storageService.set).toHaveBeenCalledWith('activityLogs', []);
    });

    it('should invalidate all active sessions', () => {
      const mockSessions = [
        { userId: 'student1@test.com', token: 'token1' },
        { userId: 'student2@test.com', token: 'token2' }
      ];

      storageService.get.mockImplementation((key) => {
        if (key === 'users') return [{ id: '1', email: 'admin@test.com', role: 'admin' }];
        if (key === 'grievanceDatabase') return {};
        if (key === 'anonymousGrievanceDatabase') return [];
        if (key === 'sessions') return mockSessions;
        if (key === 'activityLogs') return [];
        return [];
      });

      const result = dataCleanupService.completeDataCleanup('admin@test.com');

      expect(result.success).toBe(true);
      expect(result.sessionsInvalidated).toBe(2);
      expect(storageService.set).toHaveBeenCalledWith('sessions', []);
    });

    it('should create activity log entry documenting the cleanup', () => {
      storageService.get.mockImplementation((key) => {
        if (key === 'users') return [
          { id: '1', email: 'admin@test.com', role: 'admin' },
          { id: '2', email: 'student@test.com', role: 'student' }
        ];
        if (key === 'grievanceDatabase') return { 'Academic': [{ id: '1' }] };
        if (key === 'anonymousGrievanceDatabase') return [];
        if (key === 'sessions') return [];
        if (key === 'activityLogs') return [];
        return [];
      });

      dataCleanupService.completeDataCleanup('admin@test.com');

      expect(activityLogService.logActivity).toHaveBeenCalledWith(
        'Data Reset',
        'admin@test.com',
        expect.objectContaining({
          action: 'Complete Data Cleanup',
          usersRemoved: 1,
          grievancesRemoved: 1
        })
      );
    });
  });

  describe('resetUserData', () => {
    it('should remove only that user\'s grievances', () => {
      const mockUsers = [
        { id: '1', email: 'student1@test.com', role: 'student', fullName: 'Student One' },
        { id: '2', email: 'student2@test.com', role: 'student', fullName: 'Student Two' }
      ];

      const mockGrievanceDB = {
        'Academic': [
          { id: '1', userId: 'student1@test.com', email: 'student1@test.com', title: 'Test 1' },
          { id: '2', userId: 'student2@test.com', email: 'student2@test.com', title: 'Test 2' }
        ],
        'Infrastructure': [
          { id: '3', userId: 'student1@test.com', email: 'student1@test.com', title: 'Test 3' }
        ]
      };

      storageService.get.mockImplementation((key) => {
        if (key === 'users') return mockUsers;
        if (key === 'grievanceDatabase') return mockGrievanceDB;
        return [];
      });

      const result = dataCleanupService.resetUserData('admin@test.com', 'student1@test.com');

      expect(result.success).toBe(true);
      expect(result.grievancesRemoved).toBe(2);
      expect(result.userEmail).toBe('student1@test.com');

      // Verify the grievance database was updated correctly
      const setCall = storageService.set.mock.calls.find(call => call[0] === 'grievanceDatabase');
      expect(setCall).toBeDefined();
      const updatedDB = setCall[1];
      expect(updatedDB['Academic'].length).toBe(1);
      expect(updatedDB['Academic'][0].userId).toBe('student2@test.com');
      expect(updatedDB['Infrastructure'].length).toBe(0);
    });

    it('should update user record with lastUpdated timestamp', () => {
      const mockUsers = [
        { id: '1', email: 'student@test.com', role: 'student', fullName: 'Student' }
      ];

      storageService.get.mockImplementation((key) => {
        if (key === 'users') return mockUsers;
        if (key === 'grievanceDatabase') return {};
        return [];
      });

      dataCleanupService.resetUserData('admin@test.com', 'student@test.com');

      const setCall = storageService.set.mock.calls.find(call => call[0] === 'users');
      expect(setCall).toBeDefined();
      const updatedUsers = setCall[1];
      expect(updatedUsers[0].lastUpdated).toBeDefined();
    });

    it('should return error if user not found', () => {
      storageService.get.mockImplementation((key) => {
        if (key === 'users') return [];
        return [];
      });

      const result = dataCleanupService.resetUserData('admin@test.com', 'nonexistent@test.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });

    it('should create activity log entry for the reset', () => {
      const mockUsers = [
        { id: '1', email: 'student@test.com', role: 'student', fullName: 'Student' }
      ];

      storageService.get.mockImplementation((key) => {
        if (key === 'users') return mockUsers;
        if (key === 'grievanceDatabase') return { 'Academic': [{ id: '1', email: 'student@test.com' }] };
        return [];
      });

      dataCleanupService.resetUserData('admin@test.com', 'student@test.com');

      expect(activityLogService.logActivity).toHaveBeenCalledWith(
        'Data Reset',
        'admin@test.com',
        expect.objectContaining({
          action: 'Individual User Data Reset',
          targetUser: 'student@test.com',
          grievancesRemoved: 1
        })
      );
    });
  });
});
