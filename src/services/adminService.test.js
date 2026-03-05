import { describe, it, expect, beforeEach, vi } from 'vitest';
import { adminService } from './adminService';
import { storageService } from './storageService';

// Mock storageService
vi.mock('./storageService', () => ({
  storageService: {
    get: vi.fn(),
    set: vi.fn()
  }
}));

describe('AdminService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users from storage', () => {
      const mockUsers = [
        { id: '1', email: 'user1@test.com', role: 'student', status: 'active' },
        { id: '2', email: 'user2@test.com', role: 'admin', status: 'active' }
      ];
      storageService.get.mockReturnValue(mockUsers);

      const result = adminService.getAllUsers();

      expect(storageService.get).toHaveBeenCalledWith('users', []);
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array when no users exist', () => {
      storageService.get.mockReturnValue([]);

      const result = adminService.getAllUsers();

      expect(result).toEqual([]);
    });

    it('should auto-patch users missing status field', () => {
      const mockUsers = [
        { id: '1', email: 'user1@test.com', role: 'student' },
        { id: '2', email: 'user2@test.com', role: 'admin', status: 'active' }
      ];
      storageService.get.mockReturnValue(mockUsers);

      const result = adminService.getAllUsers();

      expect(storageService.set).toHaveBeenCalledWith('users', expect.arrayContaining([
        expect.objectContaining({ 
          id: '1', 
          status: 'active',
          uid: expect.any(String),
          dept: expect.any(String),
          roll: expect.any(String)
        }),
        expect.objectContaining({ id: '2', status: 'active' })
      ]));
      expect(result[0].status).toBe('active');
    });

    it('should use studentId as uid if uid is missing', () => {
      const mockUsers = [
        { id: '1', email: 'user1@test.com', role: 'student', studentId: 'STU123' }
      ];
      storageService.get.mockReturnValue(mockUsers);

      const result = adminService.getAllUsers();

      expect(result[0].uid).toBe('STU123');
    });
  });

  describe('updateUserStatus', () => {
    const mockUsers = [
      { id: '1', email: 'user1@test.com', role: 'student', status: 'active', uid: 'UID1' },
      { id: '2', email: 'user2@test.com', role: 'student', status: 'active', uid: 'UID2' }
    ];

    beforeEach(() => {
      storageService.get.mockImplementation((key) => {
        if (key === 'users') return [...mockUsers];
        if (key === 'sessions') return [];
        return [];
      });
    });

    it('should update user status by id', () => {
      const result = adminService.updateUserStatus('admin@test.com', '1', 'blocked');

      expect(result).toMatchObject({
        id: '1',
        status: 'blocked',
        lastUpdated: expect.any(String)
      });
      expect(storageService.set).toHaveBeenCalledWith('users', expect.arrayContaining([
        expect.objectContaining({ id: '1', status: 'blocked' })
      ]));
    });

    it('should update user status by email', () => {
      const result = adminService.updateUserStatus('admin@test.com', 'user1@test.com', 'restricted');

      expect(result).toMatchObject({
        email: 'user1@test.com',
        status: 'restricted'
      });
    });

    it('should update user status by uid', () => {
      const result = adminService.updateUserStatus('admin@test.com', 'UID1', 'removed');

      expect(result).toMatchObject({
        uid: 'UID1',
        status: 'removed'
      });
    });

    it('should return null if user not found', () => {
      const result = adminService.updateUserStatus('admin@test.com', 'nonexistent', 'blocked');

      expect(result).toBeNull();
    });

    it('should invalidate sessions when status is blocked', () => {
      const mockSessions = [
        { userId: '1', token: 'token1' },
        { userId: '2', token: 'token2' }
      ];
      storageService.get.mockImplementation((key) => {
        if (key === 'users') return [...mockUsers];
        if (key === 'sessions') return [...mockSessions];
        return [];
      });

      adminService.updateUserStatus('admin@test.com', '1', 'blocked');

      // Should call set for both users and sessions
      expect(storageService.set).toHaveBeenCalledWith('sessions', expect.arrayContaining([
        expect.objectContaining({ userId: '2' })
      ]));
    });

    it('should invalidate sessions when status is removed', () => {
      const mockSessions = [
        { userId: '1', token: 'token1' }
      ];
      storageService.get.mockImplementation((key) => {
        if (key === 'users') return [...mockUsers];
        if (key === 'sessions') return [...mockSessions];
        return [];
      });

      adminService.updateUserStatus('admin@test.com', '1', 'removed');

      expect(storageService.set).toHaveBeenCalledWith('sessions', []);
    });

    it('should not invalidate sessions for active or restricted status', () => {
      adminService.updateUserStatus('admin@test.com', '1', 'active');

      // Should update users and log activity, but not sessions
      expect(storageService.set).toHaveBeenCalledWith('users', expect.any(Array));
      expect(storageService.set).toHaveBeenCalledWith('activityLogs', expect.any(Array));
      // Should NOT be called with 'sessions'
      const sessionsCalls = vi.mocked(storageService.set).mock.calls.filter(
        call => call[0] === 'sessions'
      );
      expect(sessionsCalls).toHaveLength(0);
    });

    it('should update lastUpdated timestamp', () => {
      const beforeUpdate = new Date().toISOString();
      const result = adminService.updateUserStatus('admin@test.com', '1', 'blocked');
      const afterUpdate = new Date().toISOString();

      expect(result.lastUpdated).toBeDefined();
      expect(result.lastUpdated >= beforeUpdate).toBe(true);
      expect(result.lastUpdated <= afterUpdate).toBe(true);
    });
  });

  describe('getUserStatistics', () => {
    it('should calculate statistics correctly', () => {
      const mockUsers = [
        { id: '1', email: 'user1@test.com', status: 'active', dept: 'CS', createdAt: new Date().toISOString() },
        { id: '2', email: 'user2@test.com', status: 'active', dept: 'CS', createdAt: new Date().toISOString() },
        { id: '3', email: 'user3@test.com', status: 'blocked', dept: 'EE', createdAt: '2020-01-01' },
        { id: '4', email: 'user4@test.com', status: 'restricted', dept: 'ME' },
        { id: '5', email: 'user5@test.com', status: 'removed', dept: 'CS' }
      ];
      storageService.get.mockReturnValue(mockUsers);

      const stats = adminService.getUserStatistics();

      expect(stats.total).toBe(5);
      expect(stats.byStatus).toEqual({
        active: 2,
        blocked: 1,
        restricted: 1,
        removed: 1
      });
      expect(stats.byDepartment).toEqual({
        CS: 3,
        EE: 1,
        ME: 1
      });
      expect(stats.recentRegistrations).toBe(2);
    });

    it('should handle users without status field', () => {
      const mockUsers = [
        { id: '1', email: 'user1@test.com', dept: 'CS' }
      ];
      storageService.get.mockReturnValue(mockUsers);

      const stats = adminService.getUserStatistics();

      expect(stats.byStatus.active).toBe(1);
    });

    it('should handle users without department field', () => {
      const mockUsers = [
        { id: '1', email: 'user1@test.com', status: 'active' },
        { id: '2', email: 'user2@test.com', status: 'active', department: 'CS' }
      ];
      storageService.get.mockReturnValue(mockUsers);

      const stats = adminService.getUserStatistics();

      expect(stats.byDepartment).toHaveProperty('Unknown');
      expect(stats.byDepartment).toHaveProperty('CS');
    });

    it('should count recent registrations within 30 days', () => {
      const now = new Date();
      const twentyDaysAgo = new Date(now);
      twentyDaysAgo.setDate(now.getDate() - 20);
      const fortyDaysAgo = new Date(now);
      fortyDaysAgo.setDate(now.getDate() - 40);

      const mockUsers = [
        { id: '1', email: 'user1@test.com', status: 'active', createdAt: twentyDaysAgo.toISOString() },
        { id: '2', email: 'user2@test.com', status: 'active', createdAt: fortyDaysAgo.toISOString() }
      ];
      storageService.get.mockReturnValue(mockUsers);

      const stats = adminService.getUserStatistics();

      expect(stats.recentRegistrations).toBe(1);
    });

    it('should return zero counts for empty user list', () => {
      storageService.get.mockReturnValue([]);

      const stats = adminService.getUserStatistics();

      expect(stats.total).toBe(0);
      expect(stats.byStatus.active).toBe(0);
      expect(stats.recentRegistrations).toBe(0);
    });
  });

  describe('invalidateUserSessions', () => {
    it('should remove sessions by userId', () => {
      const mockSessions = [
        { userId: '1', token: 'token1' },
        { userId: '2', token: 'token2' },
        { userId: '3', token: 'token3' }
      ];
      storageService.get.mockReturnValue(mockSessions);

      const count = adminService.invalidateUserSessions('1');

      expect(count).toBe(1);
      expect(storageService.set).toHaveBeenCalledWith('sessions', [
        { userId: '2', token: 'token2' },
        { userId: '3', token: 'token3' }
      ]);
    });

    it('should remove sessions by userEmail', () => {
      const mockSessions = [
        { userId: '1', userEmail: 'user1@test.com', token: 'token1' },
        { userId: '2', userEmail: 'user2@test.com', token: 'token2' }
      ];
      storageService.get.mockReturnValue(mockSessions);

      const count = adminService.invalidateUserSessions('user1@test.com');

      expect(count).toBe(1);
      expect(storageService.set).toHaveBeenCalledWith('sessions', [
        { userId: '2', userEmail: 'user2@test.com', token: 'token2' }
      ]);
    });

    it('should remove sessions by email field', () => {
      const mockSessions = [
        { userId: '1', email: 'user1@test.com', token: 'token1' },
        { userId: '2', email: 'user2@test.com', token: 'token2' }
      ];
      storageService.get.mockReturnValue(mockSessions);

      const count = adminService.invalidateUserSessions('user1@test.com');

      expect(count).toBe(1);
    });

    it('should return 0 if no sessions found for user', () => {
      const mockSessions = [
        { userId: '2', token: 'token2' }
      ];
      storageService.get.mockReturnValue(mockSessions);

      const count = adminService.invalidateUserSessions('1');

      expect(count).toBe(0);
      expect(storageService.set).not.toHaveBeenCalled();
    });

    it('should handle empty sessions array', () => {
      storageService.get.mockReturnValue([]);

      const count = adminService.invalidateUserSessions('1');

      expect(count).toBe(0);
      expect(storageService.set).not.toHaveBeenCalled();
    });

    it('should remove multiple sessions for same user', () => {
      const mockSessions = [
        { userId: '1', token: 'token1' },
        { userId: '1', token: 'token2' },
        { userId: '2', token: 'token3' }
      ];
      storageService.get.mockReturnValue(mockSessions);

      const count = adminService.invalidateUserSessions('1');

      expect(count).toBe(2);
      expect(storageService.set).toHaveBeenCalledWith('sessions', [
        { userId: '2', token: 'token3' }
      ]);
    });
  });

  describe('resetUserData', () => {
    const mockUsers = [
      { id: '1', email: 'user1@test.com', role: 'student', uid: 'UID1' },
      { id: '2', email: 'user2@test.com', role: 'student', uid: 'UID2' }
    ];

    beforeEach(() => {
      storageService.get.mockImplementation((key) => {
        if (key === 'users') return [...mockUsers];
        if (key === 'grievanceDatabase') return {
          academic: [
            { id: 'g1', userId: 'user1@test.com', subject: 'Issue 1' },
            { id: 'g2', userId: 'user2@test.com', subject: 'Issue 2' }
          ],
          infrastructure: [
            { id: 'g3', email: 'user1@test.com', subject: 'Issue 3' }
          ]
        };
        return [];
      });
    });

    it('should remove user grievances by userId', () => {
      const result = adminService.resetUserData('user1@test.com');

      expect(result.success).toBe(true);
      expect(result.grievancesRemoved).toBe(2);
      expect(storageService.set).toHaveBeenCalledWith('grievanceDatabase', {
        academic: [
          { id: 'g2', userId: 'user2@test.com', subject: 'Issue 2' }
        ],
        infrastructure: []
      });
    });

    it('should remove user grievances by email field', () => {
      storageService.get.mockImplementation((key) => {
        if (key === 'users') return [...mockUsers];
        if (key === 'grievanceDatabase') return {
          academic: [
            { id: 'g1', userEmail: 'user1@test.com', subject: 'Issue 1' }
          ]
        };
        return [];
      });

      const result = adminService.resetUserData('1');

      expect(result.success).toBe(true);
      expect(result.grievancesRemoved).toBe(1);
    });

    it('should remove user grievances by personalEmail field', () => {
      storageService.get.mockImplementation((key) => {
        if (key === 'users') return [...mockUsers];
        if (key === 'grievanceDatabase') return {
          academic: [
            { id: 'g1', personalEmail: 'user1@test.com', subject: 'Issue 1' }
          ]
        };
        return [];
      });

      const result = adminService.resetUserData('user1@test.com');

      expect(result.success).toBe(true);
      expect(result.grievancesRemoved).toBe(1);
    });

    it('should remove user grievances by uniEmail field', () => {
      storageService.get.mockImplementation((key) => {
        if (key === 'users') return [...mockUsers];
        if (key === 'grievanceDatabase') return {
          academic: [
            { id: 'g1', uniEmail: 'user1@test.com', subject: 'Issue 1' }
          ]
        };
        return [];
      });

      const result = adminService.resetUserData('user1@test.com');

      expect(result.success).toBe(true);
      expect(result.grievancesRemoved).toBe(1);
    });

    it('should return error if user not found', () => {
      const result = adminService.resetUserData('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });

    it('should update user lastUpdated timestamp', () => {
      const result = adminService.resetUserData('1');

      expect(result.success).toBe(true);
      expect(storageService.set).toHaveBeenCalledWith('users', expect.arrayContaining([
        expect.objectContaining({
          id: '1',
          lastUpdated: expect.any(String)
        })
      ]));
    });

    it('should handle empty grievance database', () => {
      storageService.get.mockImplementation((key) => {
        if (key === 'users') return [...mockUsers];
        if (key === 'grievanceDatabase') return {};
        return [];
      });

      const result = adminService.resetUserData('1');

      expect(result.success).toBe(true);
      expect(result.grievancesRemoved).toBe(0);
    });

    it('should handle grievance categories with non-array values', () => {
      storageService.get.mockImplementation((key) => {
        if (key === 'users') return [...mockUsers];
        if (key === 'grievanceDatabase') return {
          academic: [{ id: 'g1', userId: 'user1@test.com' }],
          invalid: 'not an array'
        };
        return [];
      });

      const result = adminService.resetUserData('1');

      expect(result.success).toBe(true);
      expect(result.grievancesRemoved).toBe(1);
    });

    it('should return userId in result', () => {
      const result = adminService.resetUserData('1');

      expect(result.userId).toBe('1');
    });
  });

  describe('Access Control', () => {
    it('should allow admin operations for admin users', () => {
      const mockUsers = [
        { id: '1', email: 'admin@test.com', role: 'admin', status: 'active' }
      ];
      storageService.get.mockReturnValue(mockUsers);

      const users = adminService.getAllUsers();
      expect(users).toHaveLength(1);
    });

    it('should handle operations when storage is empty', () => {
      storageService.get.mockReturnValue([]);

      const users = adminService.getAllUsers();
      const stats = adminService.getUserStatistics();

      expect(users).toEqual([]);
      expect(stats.total).toBe(0);
    });
  });
});
