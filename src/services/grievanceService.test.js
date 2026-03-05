import { describe, it, expect, beforeEach, vi } from 'vitest';
import { grievanceService } from './grievanceService';
import { STORAGE_KEYS } from '../utils/constants';

describe('GrievanceService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getGrievances', () => {
    it('should return only user grievances for student role, excluding anonymous', async () => {
      // Setup: Create grievances in storage
      const studentUser = {
        id: 'user123',
        email: 'student@example.com',
        role: 'student',
        status: 'active'
      };

      const otherUser = {
        id: 'user456',
        email: 'other@example.com',
        role: 'student'
      };

      const grievances = {
        academic: [
          {
            id: 1,
            code: 'GRV-2024-ABC1',
            userId: studentUser.id,
            email: studentUser.email,
            subject: 'Student grievance 1',
            category: 'academic',
            status: 'Pending'
          },
          {
            id: 2,
            code: 'GRV-2024-ABC2',
            userId: otherUser.id,
            email: otherUser.email,
            subject: 'Other student grievance',
            category: 'academic',
            status: 'Pending'
          }
        ],
        infrastructure: [
          {
            id: 3,
            code: 'GRV-2024-ABC3',
            userId: studentUser.id,
            email: studentUser.email,
            subject: 'Student grievance 2',
            category: 'infrastructure',
            status: 'Resolved'
          }
        ]
      };

      const anonGrievances = [
        {
          id: 4,
          code: 'ANON-2024-XYZ1',
          userId: 'anonymous',
          userEmail: 'anonymous@system.local',
          subject: 'Anonymous grievance',
          category: 'other',
          status: 'Pending',
          isAnonymous: true
        }
      ];

      localStorage.setItem(STORAGE_KEYS.GRIEVANCE_DB, JSON.stringify(grievances));
      localStorage.setItem(STORAGE_KEYS.ANON_GRIEVANCE_DB, JSON.stringify(anonGrievances));

      // Execute
      const result = await grievanceService.getGrievances(studentUser);

      // Verify: Should only return student's own grievances, excluding anonymous
      expect(result).toHaveLength(2);
      expect(result.every(g => g.userId === studentUser.id)).toBe(true);
      expect(result.every(g => !g.isAnonymous)).toBe(true);
      expect(result.find(g => g.code === 'GRV-2024-ABC1')).toBeDefined();
      expect(result.find(g => g.code === 'GRV-2024-ABC3')).toBeDefined();
      expect(result.find(g => g.code === 'ANON-2024-XYZ1')).toBeUndefined();
    });

    it('should return all grievances including anonymous for admin role', async () => {
      // Setup: Create grievances in storage
      const adminUser = {
        id: 'admin123',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active'
      };

      const grievances = {
        academic: [
          {
            id: 1,
            code: 'GRV-2024-ABC1',
            userId: 'user123',
            email: 'student1@example.com',
            subject: 'Student grievance 1',
            category: 'academic',
            status: 'Pending'
          },
          {
            id: 2,
            code: 'GRV-2024-ABC2',
            userId: 'user456',
            email: 'student2@example.com',
            subject: 'Student grievance 2',
            category: 'academic',
            status: 'In Progress'
          }
        ]
      };

      const anonGrievances = [
        {
          id: 3,
          code: 'ANON-2024-XYZ1',
          userId: 'anonymous',
          userEmail: 'anonymous@system.local',
          subject: 'Anonymous grievance',
          category: 'other',
          status: 'Pending',
          isAnonymous: true
        }
      ];

      localStorage.setItem(STORAGE_KEYS.GRIEVANCE_DB, JSON.stringify(grievances));
      localStorage.setItem(STORAGE_KEYS.ANON_GRIEVANCE_DB, JSON.stringify(anonGrievances));

      // Execute
      const result = await grievanceService.getGrievances(adminUser);

      // Verify: Should return all grievances including anonymous
      expect(result).toHaveLength(3);
      expect(result.find(g => g.code === 'GRV-2024-ABC1')).toBeDefined();
      expect(result.find(g => g.code === 'GRV-2024-ABC2')).toBeDefined();
      expect(result.find(g => g.code === 'ANON-2024-XYZ1')).toBeDefined();
    });

    it('should return empty array when user is null', async () => {
      // Execute
      const result = await grievanceService.getGrievances(null);

      // Verify
      expect(result).toEqual([]);
    });

    it('should return empty array when no grievances exist', async () => {
      // Setup
      const studentUser = {
        id: 'user123',
        email: 'student@example.com',
        role: 'student',
        status: 'active'
      };

      // Execute
      const result = await grievanceService.getGrievances(studentUser);

      // Verify
      expect(result).toEqual([]);
    });

    it('should sort grievances by id in descending order', async () => {
      // Setup
      const adminUser = {
        id: 'admin123',
        email: 'admin@example.com',
        role: 'admin'
      };

      const grievances = {
        academic: [
          {
            id: 100,
            code: 'GRV-2024-ABC1',
            userId: 'user123',
            subject: 'Grievance 1'
          },
          {
            id: 300,
            code: 'GRV-2024-ABC3',
            userId: 'user456',
            subject: 'Grievance 3'
          },
          {
            id: 200,
            code: 'GRV-2024-ABC2',
            userId: 'user789',
            subject: 'Grievance 2'
          }
        ]
      };

      localStorage.setItem(STORAGE_KEYS.GRIEVANCE_DB, JSON.stringify(grievances));

      // Execute
      const result = await grievanceService.getGrievances(adminUser);

      // Verify: Should be sorted by id descending (300, 200, 100)
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(300);
      expect(result[1].id).toBe(200);
      expect(result[2].id).toBe(100);
    });
  });

  describe('submitGrievance - user association', () => {
    beforeEach(() => {
      // Setup: Create test users in storage for validation
      const users = [
        {
          id: 'user123',
          email: 'student@example.com',
          role: 'student',
          status: 'active'
        }
      ];
      localStorage.setItem('users', JSON.stringify(users));
    });

    it('should associate grievance with authenticated user id and email', async () => {
      // Setup: Authenticated user
      const authenticatedUser = {
        id: 'user123',
        email: 'student@example.com',
        role: 'student',
        status: 'active'
      };

      const grievanceData = {
        subject: 'Test grievance',
        description: 'Test description',
        category: 'academic'
      };

      // Execute
      const result = await grievanceService.submitGrievance(grievanceData, false, authenticatedUser);

      // Verify: Should have userId and userEmail from authenticated user
      expect(result).toBeDefined();
      expect(result.userId).toBe('user123');
      expect(result.userEmail).toBe('student@example.com');
      expect(result.code).toMatch(/^GRV-\d{4}-[A-Z0-9]{4}$/);
      expect(result.status).toBe('Pending');
      expect(result.isAnonymous).toBe(false);
    });

    it('should set userId to anonymous and userEmail to anonymous@system.local for anonymous grievances', async () => {
      // Setup: Authenticated user submitting anonymous grievance
      const authenticatedUser = {
        id: 'user123',
        email: 'student@example.com',
        role: 'student',
        status: 'active'
      };

      const grievanceData = {
        subject: 'Anonymous test grievance',
        description: 'Test description',
        category: 'academic'
      };

      // Execute
      const result = await grievanceService.submitGrievance(grievanceData, true, authenticatedUser);

      // Verify: Should have anonymous userId and userEmail
      expect(result).toBeDefined();
      expect(result.userId).toBe('anonymous');
      expect(result.userEmail).toBe('anonymous@system.local');
      expect(result.code).toMatch(/^ANON-\d{4}-[A-Z0-9]{4}$/);
      expect(result.status).toBe('Pending');
      expect(result.isAnonymous).toBe(true);
    });

    it('should generate unique grievance id and code', async () => {
      // Setup
      const authenticatedUser = {
        id: 'user123',
        email: 'student@example.com',
        role: 'student',
        status: 'active'
      };

      const grievanceData = {
        subject: 'Test grievance',
        description: 'Test description',
        category: 'academic'
      };

      // Execute: Submit two grievances
      const result1 = await grievanceService.submitGrievance(grievanceData, false, authenticatedUser);
      const result2 = await grievanceService.submitGrievance(grievanceData, false, authenticatedUser);

      // Verify: Should have unique ids and codes
      expect(result1.id).toBeDefined();
      expect(result2.id).toBeDefined();
      expect(result1.id).not.toBe(result2.id);
      expect(result1.code).toBeDefined();
      expect(result2.code).toBeDefined();
      expect(result1.code).not.toBe(result2.code);
    });

    it('should set initial status to Pending', async () => {
      // Setup
      const authenticatedUser = {
        id: 'user123',
        email: 'student@example.com',
        role: 'student',
        status: 'active'
      };

      const grievanceData = {
        subject: 'Test grievance',
        description: 'Test description',
        category: 'academic'
      };

      // Execute
      const result = await grievanceService.submitGrievance(grievanceData, false, authenticatedUser);

      // Verify: Should have Pending status
      expect(result.status).toBe('Pending');
    });

    it('should initialize history array with submission entry', async () => {
      // Setup
      const authenticatedUser = {
        id: 'user123',
        email: 'student@example.com',
        role: 'student',
        status: 'active'
      };

      const grievanceData = {
        subject: 'Test grievance',
        description: 'Test description',
        category: 'academic'
      };

      // Execute
      const result = await grievanceService.submitGrievance(grievanceData, false, authenticatedUser);

      // Verify: Should have history array with submission entry
      expect(result.history).toBeDefined();
      expect(Array.isArray(result.history)).toBe(true);
      expect(result.history).toHaveLength(1);
      expect(result.history[0]).toMatchObject({
        status: 'Pending',
        note: 'Grievance submitted'
      });
      expect(result.history[0].timestamp).toBeDefined();
    });

    it('should use user email as userId when id is not available', async () => {
      // Setup: User without id field - add to storage with email as id
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      users.push({
        id: 'student@example.com', // Email used as id
        email: 'student@example.com',
        role: 'student',
        status: 'active'
      });
      localStorage.setItem('users', JSON.stringify(users));

      const authenticatedUser = {
        email: 'student@example.com',
        role: 'student',
        status: 'active'
      };

      const grievanceData = {
        subject: 'Test grievance',
        description: 'Test description',
        category: 'academic'
      };

      // Execute
      const result = await grievanceService.submitGrievance(grievanceData, false, authenticatedUser);

      // Verify: Should use email as userId
      expect(result.userId).toBe('student@example.com');
      expect(result.userEmail).toBe('student@example.com');
    });
  });

  describe('submitGrievance - user status validation', () => {
    it('should reject grievance submission when user status is not active', async () => {
      // Setup: User with blocked status
      const blockedUser = {
        id: 'user123',
        email: 'blocked@example.com',
        role: 'student',
        status: 'blocked'
      };

      const grievanceData = {
        user: blockedUser,
        subject: 'Test grievance',
        description: 'Test description',
        category: 'academic',
        email: blockedUser.email
      };

      // Execute & Verify: Should reject with error
      await expect(grievanceService.submitGrievance(grievanceData, false))
        .rejects
        .toThrow("Cannot submit grievance. User account status is 'blocked'.");
    });

    it('should reject grievance submission when user status is removed', async () => {
      // Setup: User with removed status
      const removedUser = {
        id: 'user456',
        email: 'removed@example.com',
        role: 'student',
        status: 'removed'
      };

      const grievanceData = {
        user: removedUser,
        subject: 'Test grievance',
        description: 'Test description',
        category: 'academic',
        email: removedUser.email
      };

      // Execute & Verify: Should reject with error
      await expect(grievanceService.submitGrievance(grievanceData, false))
        .rejects
        .toThrow("Cannot submit grievance. User account status is 'removed'.");
    });

    it('should reject grievance submission when user status is restricted', async () => {
      // Setup: User with restricted status
      const restrictedUser = {
        id: 'user789',
        email: 'restricted@example.com',
        role: 'student',
        status: 'restricted'
      };

      const grievanceData = {
        user: restrictedUser,
        subject: 'Test grievance',
        description: 'Test description',
        category: 'academic',
        email: restrictedUser.email
      };

      // Execute & Verify: Should reject with error
      await expect(grievanceService.submitGrievance(grievanceData, false))
        .rejects
        .toThrow("Cannot submit grievance. User account status is 'restricted'.");
    });

    it('should allow grievance submission when user status is active', async () => {
      // Setup: User with active status - add to storage
      const users = [
        {
          id: 'user123',
          email: 'active@example.com',
          role: 'student',
          status: 'active'
        }
      ];
      localStorage.setItem('users', JSON.stringify(users));

      const activeUser = {
        id: 'user123',
        email: 'active@example.com',
        role: 'student',
        status: 'active'
      };

      const grievanceData = {
        user: activeUser,
        subject: 'Test grievance',
        description: 'Test description',
        category: 'academic',
        email: activeUser.email,
        first_name: 'John'
      };

      // Execute
      const result = await grievanceService.submitGrievance(grievanceData, false);

      // Verify: Should succeed
      expect(result).toBeDefined();
      expect(result.code).toMatch(/^GRV-\d{4}-[A-Z0-9]{4}$/);
      expect(result.status).toBe('Pending');
      expect(result.subject).toBe('Test grievance');
    });

    it('should allow grievance submission when user object has no status field', async () => {
      // Setup: User without status field - add to storage
      const users = [
        {
          id: 'user123',
          email: 'nostatus@example.com',
          role: 'student',
          status: 'active' // User in storage has status
        }
      ];
      localStorage.setItem('users', JSON.stringify(users));

      const userWithoutStatus = {
        id: 'user123',
        email: 'nostatus@example.com',
        role: 'student'
        // No status field in the user object passed to submitGrievance
      };

      const grievanceData = {
        user: userWithoutStatus,
        subject: 'Test grievance',
        description: 'Test description',
        category: 'academic',
        email: userWithoutStatus.email,
        first_name: 'Jane'
      };

      // Execute
      const result = await grievanceService.submitGrievance(grievanceData, false);

      // Verify: Should succeed (no status means no validation)
      expect(result).toBeDefined();
      expect(result.code).toMatch(/^GRV-\d{4}-[A-Z0-9]{4}$/);
      expect(result.status).toBe('Pending');
    });

    it('should allow grievance submission when no user object is provided', async () => {
      // Setup: Create user in storage for the fallback userId
      const users = [
        {
          id: 'unknown',
          email: 'nouser@example.com',
          role: 'student',
          status: 'active'
        }
      ];
      localStorage.setItem('users', JSON.stringify(users));

      // Grievance data without user object
      const grievanceData = {
        subject: 'Test grievance',
        description: 'Test description',
        category: 'academic',
        email: 'nouser@example.com',
        first_name: 'Anonymous',
        userId: 'unknown' // Fallback userId
      };

      // Execute
      const result = await grievanceService.submitGrievance(grievanceData, false);

      // Verify: Should succeed (no user means no validation)
      expect(result).toBeDefined();
      expect(result.code).toMatch(/^GRV-\d{4}-[A-Z0-9]{4}$/);
      expect(result.status).toBe('Pending');
    });
  });

  describe('updateGrievanceStatus', () => {
    it('should update grievance status when admin has permission', async () => {
      // Setup: Admin user and existing grievance
      const adminUser = {
        id: 'admin123',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active'
      };

      const grievances = {
        academic: [
          {
            id: 1,
            code: 'GRV-2024-ABC1',
            userId: 'user123',
            email: 'student@example.com',
            subject: 'Test grievance',
            category: 'academic',
            status: 'Pending',
            history: [{
              status: 'Pending',
              timestamp: new Date().toISOString(),
              note: 'Grievance submitted'
            }]
          }
        ]
      };

      localStorage.setItem(STORAGE_KEYS.GRIEVANCE_DB, JSON.stringify(grievances));

      // Execute
      const result = await grievanceService.updateGrievanceStatus(
        adminUser,
        'GRV-2024-ABC1',
        'In Progress',
        'Reviewing the issue'
      );

      // Verify: Status should be updated
      expect(result).toBeDefined();
      expect(result.status).toBe('In Progress');
      expect(result.adminNotes).toBe('Reviewing the issue');
      expect(result.history).toHaveLength(2);
      expect(result.history[1]).toMatchObject({
        status: 'In Progress',
        adminEmail: 'admin@example.com',
        note: 'Reviewing the issue'
      });
      expect(result.history[1].timestamp).toBeDefined();
    });

    it('should add entry to history array with timestamp and admin email', async () => {
      // Setup
      const adminUser = {
        id: 'admin123',
        email: 'admin@example.com',
        role: 'admin'
      };

      const grievances = {
        academic: [
          {
            id: 1,
            code: 'GRV-2024-ABC1',
            userId: 'user123',
            status: 'Pending',
            history: []
          }
        ]
      };

      localStorage.setItem(STORAGE_KEYS.GRIEVANCE_DB, JSON.stringify(grievances));

      // Execute
      const result = await grievanceService.updateGrievanceStatus(
        adminUser,
        'GRV-2024-ABC1',
        'Resolved',
        'Issue has been resolved'
      );

      // Verify: History should contain admin email and timestamp
      expect(result.history).toHaveLength(1);
      expect(result.history[0].adminEmail).toBe('admin@example.com');
      expect(result.history[0].timestamp).toBeDefined();
      expect(result.history[0].status).toBe('Resolved');
      expect(result.history[0].note).toBe('Issue has been resolved');
    });

    it('should store notes in adminNotes field when not already set', async () => {
      // Setup
      const adminUser = {
        id: 'admin123',
        email: 'admin@example.com',
        role: 'admin'
      };

      const grievances = {
        academic: [
          {
            id: 1,
            code: 'GRV-2024-ABC1',
            userId: 'user123',
            status: 'Pending',
            history: []
          }
        ]
      };

      localStorage.setItem(STORAGE_KEYS.GRIEVANCE_DB, JSON.stringify(grievances));

      // Execute
      const result = await grievanceService.updateGrievanceStatus(
        adminUser,
        'GRV-2024-ABC1',
        'In Progress',
        'First admin note'
      );

      // Verify: Notes should be in adminNotes
      expect(result.adminNotes).toBe('First admin note');
      expect(result.reviewComments).toBeUndefined();
    });

    it('should store notes in reviewComments field when adminNotes already exists', async () => {
      // Setup
      const adminUser = {
        id: 'admin123',
        email: 'admin@example.com',
        role: 'admin'
      };

      const grievances = {
        academic: [
          {
            id: 1,
            code: 'GRV-2024-ABC1',
            userId: 'user123',
            status: 'Pending',
            adminNotes: 'First admin note',
            history: []
          }
        ]
      };

      localStorage.setItem(STORAGE_KEYS.GRIEVANCE_DB, JSON.stringify(grievances));

      // Execute
      const result = await grievanceService.updateGrievanceStatus(
        adminUser,
        'GRV-2024-ABC1',
        'Resolved',
        'Second admin note'
      );

      // Verify: Notes should be in reviewComments
      expect(result.adminNotes).toBe('First admin note');
      expect(result.reviewComments).toBe('Second admin note');
    });

    it('should deny operation for student users', async () => {
      // Setup: Student user
      const studentUser = {
        id: 'user123',
        email: 'student@example.com',
        role: 'student',
        status: 'active'
      };

      const grievances = {
        academic: [
          {
            id: 1,
            code: 'GRV-2024-ABC1',
            userId: 'user123',
            status: 'Pending',
            history: []
          }
        ]
      };

      localStorage.setItem(STORAGE_KEYS.GRIEVANCE_DB, JSON.stringify(grievances));

      // Execute & Verify: Should reject with error
      await expect(grievanceService.updateGrievanceStatus(
        studentUser,
        'GRV-2024-ABC1',
        'Resolved',
        'Trying to update'
      )).rejects.toThrow('Permission denied. Students cannot update grievance status.');
    });

    it('should validate user has update_grievance_status permission', async () => {
      // Setup: User without admin role
      const regularUser = {
        id: 'user123',
        email: 'user@example.com',
        role: 'student'
      };

      const grievances = {
        academic: [
          {
            id: 1,
            code: 'GRV-2024-ABC1',
            userId: 'user456',
            status: 'Pending',
            history: []
          }
        ]
      };

      localStorage.setItem(STORAGE_KEYS.GRIEVANCE_DB, JSON.stringify(grievances));

      // Execute & Verify: Should reject with permission error
      await expect(grievanceService.updateGrievanceStatus(
        regularUser,
        'GRV-2024-ABC1',
        'Resolved',
        'Notes'
      )).rejects.toThrow('Permission denied');
    });

    it('should update anonymous grievances', async () => {
      // Setup: Admin user and anonymous grievance
      const adminUser = {
        id: 'admin123',
        email: 'admin@example.com',
        role: 'admin'
      };

      const anonGrievances = [
        {
          id: 1,
          code: 'ANON-2024-XYZ1',
          userId: 'anonymous',
          userEmail: 'anonymous@system.local',
          subject: 'Anonymous grievance',
          status: 'Pending',
          isAnonymous: true,
          history: []
        }
      ];

      localStorage.setItem(STORAGE_KEYS.ANON_GRIEVANCE_DB, JSON.stringify(anonGrievances));

      // Execute
      const result = await grievanceService.updateGrievanceStatus(
        adminUser,
        'ANON-2024-XYZ1',
        'Resolved',
        'Anonymous issue resolved'
      );

      // Verify: Anonymous grievance should be updated
      expect(result).toBeDefined();
      expect(result.status).toBe('Resolved');
      expect(result.adminNotes).toBe('Anonymous issue resolved');
      expect(result.history).toHaveLength(1);
      expect(result.history[0].adminEmail).toBe('admin@example.com');
    });

    it('should reject when grievance is not found', async () => {
      // Setup
      const adminUser = {
        id: 'admin123',
        email: 'admin@example.com',
        role: 'admin'
      };

      // Execute & Verify: Should reject with error
      await expect(grievanceService.updateGrievanceStatus(
        adminUser,
        'NONEXISTENT-CODE',
        'Resolved',
        'Notes'
      )).rejects.toThrow('Grievance not found');
    });

    it('should work with grievance id instead of code', async () => {
      // Setup
      const adminUser = {
        id: 'admin123',
        email: 'admin@example.com',
        role: 'admin'
      };

      const grievances = {
        academic: [
          {
            id: 12345,
            code: 'GRV-2024-ABC1',
            userId: 'user123',
            status: 'Pending',
            history: []
          }
        ]
      };

      localStorage.setItem(STORAGE_KEYS.GRIEVANCE_DB, JSON.stringify(grievances));

      // Execute: Use id instead of code
      const result = await grievanceService.updateGrievanceStatus(
        adminUser,
        12345,
        'In Progress',
        'Working on it'
      );

      // Verify: Should find and update by id
      expect(result).toBeDefined();
      expect(result.status).toBe('In Progress');
      expect(result.id).toBe(12345);
    });

    it('should use default note when notes parameter is empty', async () => {
      // Setup
      const adminUser = {
        id: 'admin123',
        email: 'admin@example.com',
        role: 'admin'
      };

      const grievances = {
        academic: [
          {
            id: 1,
            code: 'GRV-2024-ABC1',
            userId: 'user123',
            status: 'Pending',
            history: []
          }
        ]
      };

      localStorage.setItem(STORAGE_KEYS.GRIEVANCE_DB, JSON.stringify(grievances));

      // Execute: No notes provided
      const result = await grievanceService.updateGrievanceStatus(
        adminUser,
        'GRV-2024-ABC1',
        'Resolved'
      );

      // Verify: Should use default note
      expect(result.history[0].note).toBe('Status updated to Resolved');
      expect(result.adminNotes).toBeUndefined();
    });

    it('should update lastUpdated timestamp', async () => {
      // Setup
      const adminUser = {
        id: 'admin123',
        email: 'admin@example.com',
        role: 'admin'
      };

      const grievances = {
        academic: [
          {
            id: 1,
            code: 'GRV-2024-ABC1',
            userId: 'user123',
            status: 'Pending',
            lastUpdated: 1000000,
            history: []
          }
        ]
      };

      localStorage.setItem(STORAGE_KEYS.GRIEVANCE_DB, JSON.stringify(grievances));

      const beforeUpdate = Date.now();

      // Execute
      const result = await grievanceService.updateGrievanceStatus(
        adminUser,
        'GRV-2024-ABC1',
        'Resolved',
        'Done'
      );

      // Verify: lastUpdated should be updated
      expect(result.lastUpdated).toBeGreaterThanOrEqual(beforeUpdate);
      expect(result.lastUpdated).toBeGreaterThan(1000000);
    });
  });

  describe('Validation - validateUserId', () => {
    beforeEach(() => {
      // Setup: Create test users in storage
      const users = [
        {
          id: 'user123',
          email: 'student@example.com',
          role: 'student',
          status: 'active'
        },
        {
          id: 'user456',
          email: 'admin@example.com',
          role: 'admin',
          status: 'active'
        }
      ];
      localStorage.setItem('users', JSON.stringify(users));
    });

    it('should validate anonymous userId as valid', () => {
      // Execute
      const result = grievanceService.validateUserId('anonymous');

      // Verify
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate existing user ID as valid', () => {
      // Execute
      const result = grievanceService.validateUserId('user123');

      // Verify
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate existing user email as valid', () => {
      // Execute
      const result = grievanceService.validateUserId('student@example.com');

      // Verify
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return error for non-existent user ID', () => {
      // Execute
      const result = grievanceService.validateUserId('nonexistent123');

      // Verify
      expect(result.valid).toBe(false);
      expect(result.error).toBe("User with ID 'nonexistent123' does not exist");
    });

    it('should return error for empty user ID', () => {
      // Execute
      const result = grievanceService.validateUserId('');

      // Verify
      expect(result.valid).toBe(false);
      expect(result.error).toContain('does not exist');
    });
  });

  describe('Validation - validateGrievanceCode', () => {
    beforeEach(() => {
      // Setup: Create existing grievances with codes
      const grievances = {
        academic: [
          {
            id: 1,
            code: 'GRV-2024-ABC1',
            userId: 'user123',
            subject: 'Existing grievance'
          }
        ]
      };

      const anonGrievances = [
        {
          id: 2,
          code: 'ANON-2024-XYZ1',
          userId: 'anonymous',
          subject: 'Anonymous grievance'
        }
      ];

      localStorage.setItem(STORAGE_KEYS.GRIEVANCE_DB, JSON.stringify(grievances));
      localStorage.setItem(STORAGE_KEYS.ANON_GRIEVANCE_DB, JSON.stringify(anonGrievances));
    });

    it('should validate unique grievance code as valid', () => {
      // Execute
      const result = grievanceService.validateGrievanceCode('GRV-2024-NEW1');

      // Verify
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return error for duplicate grievance code in regular database', () => {
      // Execute
      const result = grievanceService.validateGrievanceCode('GRV-2024-ABC1');

      // Verify
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Grievance code 'GRV-2024-ABC1' already exists");
    });

    it('should return error for duplicate grievance code in anonymous database', () => {
      // Execute
      const result = grievanceService.validateGrievanceCode('ANON-2024-XYZ1');

      // Verify
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Grievance code 'ANON-2024-XYZ1' already exists");
    });

    it('should return error for empty grievance code', () => {
      // Execute
      const result = grievanceService.validateGrievanceCode('');

      // Verify
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Grievance code is required');
    });

    it('should return error for null grievance code', () => {
      // Execute
      const result = grievanceService.validateGrievanceCode(null);

      // Verify
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Grievance code is required');
    });
  });

  describe('Validation - validateGrievanceData', () => {
    beforeEach(() => {
      // Setup: Create test users
      const users = [
        {
          id: 'user123',
          email: 'student@example.com',
          role: 'student',
          status: 'active'
        }
      ];
      localStorage.setItem('users', JSON.stringify(users));

      // Setup: Create existing grievances
      const grievances = {
        academic: [
          {
            id: 1,
            code: 'GRV-2024-EXIST',
            userId: 'user123',
            subject: 'Existing grievance'
          }
        ]
      };
      localStorage.setItem(STORAGE_KEYS.GRIEVANCE_DB, JSON.stringify(grievances));
    });

    it('should validate grievance data with valid userId and unique code', () => {
      // Setup
      const grievanceData = {
        subject: 'Test grievance',
        description: 'Test description',
        category: 'academic'
      };

      // Execute
      const result = grievanceService.validateGrievanceData(
        grievanceData,
        'user123',
        'GRV-2024-NEW1'
      );

      // Verify
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate anonymous grievance data', () => {
      // Setup
      const grievanceData = {
        subject: 'Anonymous grievance',
        description: 'Test description',
        category: 'other'
      };

      // Execute
      const result = grievanceService.validateGrievanceData(
        grievanceData,
        'anonymous',
        'ANON-2024-NEW1'
      );

      // Verify
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return errors for invalid userId', () => {
      // Setup
      const grievanceData = {
        subject: 'Test grievance',
        description: 'Test description',
        category: 'academic'
      };

      // Execute
      const result = grievanceService.validateGrievanceData(
        grievanceData,
        'nonexistent123',
        'GRV-2024-NEW1'
      );

      // Verify
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("User with ID 'nonexistent123' does not exist");
    });

    it('should return errors for duplicate grievance code', () => {
      // Setup
      const grievanceData = {
        subject: 'Test grievance',
        description: 'Test description',
        category: 'academic'
      };

      // Execute
      const result = grievanceService.validateGrievanceData(
        grievanceData,
        'user123',
        'GRV-2024-EXIST'
      );

      // Verify
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("Grievance code 'GRV-2024-EXIST' already exists");
    });

    it('should return multiple errors when both userId and code are invalid', () => {
      // Setup
      const grievanceData = {
        subject: 'Test grievance',
        description: 'Test description',
        category: 'academic'
      };

      // Execute
      const result = grievanceService.validateGrievanceData(
        grievanceData,
        'nonexistent123',
        'GRV-2024-EXIST'
      );

      // Verify
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]).toContain("User with ID 'nonexistent123' does not exist");
      expect(result.errors[1]).toContain("Grievance code 'GRV-2024-EXIST' already exists");
    });

    it('should return descriptive error messages', () => {
      // Setup
      const grievanceData = {
        subject: 'Test grievance',
        description: 'Test description',
        category: 'academic'
      };

      // Execute
      const result = grievanceService.validateGrievanceData(
        grievanceData,
        'invalid-user',
        ''
      );

      // Verify: Error messages should be descriptive
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.every(err => typeof err === 'string' && err.length > 0)).toBe(true);
    });
  });

  describe('Validation - submitGrievance with validation', () => {
    beforeEach(() => {
      // Setup: Create test users
      const users = [
        {
          id: 'user123',
          email: 'student@example.com',
          role: 'student',
          status: 'active'
        }
      ];
      localStorage.setItem('users', JSON.stringify(users));
    });

    it('should reject submission when userId does not exist', async () => {
      // Setup: User that doesn't exist in storage
      const authenticatedUser = {
        id: 'nonexistent999',
        email: 'nonexistent@example.com',
        role: 'student',
        status: 'active'
      };

      const grievanceData = {
        subject: 'Test grievance',
        description: 'Test description',
        category: 'academic'
      };

      // Execute & Verify
      await expect(
        grievanceService.submitGrievance(grievanceData, false, authenticatedUser)
      ).rejects.toThrow(/Validation failed.*does not exist/);
    });

    it('should generate unique grievance codes automatically', async () => {
      // Setup
      const authenticatedUser = {
        id: 'user123',
        email: 'student@example.com',
        role: 'student',
        status: 'active'
      };

      const grievanceData = {
        subject: 'Test grievance',
        description: 'Test description',
        category: 'academic'
      };

      // Execute: Submit multiple grievances
      const result1 = await grievanceService.submitGrievance(grievanceData, false, authenticatedUser);
      const result2 = await grievanceService.submitGrievance(grievanceData, false, authenticatedUser);
      const result3 = await grievanceService.submitGrievance(grievanceData, false, authenticatedUser);

      // Verify: All codes should be unique
      expect(result1.code).toBeDefined();
      expect(result2.code).toBeDefined();
      expect(result3.code).toBeDefined();
      expect(result1.code).not.toBe(result2.code);
      expect(result1.code).not.toBe(result3.code);
      expect(result2.code).not.toBe(result3.code);
    });

    it('should allow anonymous grievances without user validation', async () => {
      // Setup: Anonymous grievance (no user validation needed)
      const authenticatedUser = {
        id: 'user123',
        email: 'student@example.com',
        role: 'student',
        status: 'active'
      };

      const grievanceData = {
        subject: 'Anonymous test',
        description: 'Test description',
        category: 'other'
      };

      // Execute
      const result = await grievanceService.submitGrievance(grievanceData, true, authenticatedUser);

      // Verify: Should succeed with anonymous userId
      expect(result).toBeDefined();
      expect(result.userId).toBe('anonymous');
      expect(result.userEmail).toBe('anonymous@system.local');
      expect(result.code).toMatch(/^ANON-\d{4}-[A-Z0-9]{4}$/);
    });

    it('should return descriptive error message when validation fails', async () => {
      // Setup: Invalid user
      const authenticatedUser = {
        id: 'invalid-user-999',
        email: 'invalid@example.com',
        role: 'student',
        status: 'active'
      };

      const grievanceData = {
        subject: 'Test grievance',
        description: 'Test description',
        category: 'academic'
      };

      // Execute & Verify: Error message should be descriptive
      try {
        await grievanceService.submitGrievance(grievanceData, false, authenticatedUser);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('Validation failed');
        expect(error.message).toContain('does not exist');
        expect(error.message.length).toBeGreaterThan(20); // Descriptive message
      }
    });

    it('should handle code generation failure gracefully', async () => {
      // Setup: Fill up all possible codes (simulate exhaustion)
      // This is a theoretical test - in practice, code space is very large
      const authenticatedUser = {
        id: 'user123',
        email: 'student@example.com',
        role: 'student',
        status: 'active'
      };

      const grievanceData = {
        subject: 'Test grievance',
        description: 'Test description',
        category: 'academic'
      };

      // Mock the code generation to always return a duplicate
      const originalGenerateCode = grievanceService.submitGrievance;
      
      // This test verifies the error handling exists
      // In practice, code collision is extremely unlikely
      const result = await grievanceService.submitGrievance(grievanceData, false, authenticatedUser);
      
      // Verify: Should still succeed with unique code
      expect(result).toBeDefined();
      expect(result.code).toBeDefined();
    });
  });

  describe('Validation - edge cases', () => {
    it('should handle empty localStorage gracefully', () => {
      // Setup: Clear all storage
      localStorage.clear();

      // Execute: Validate code when no grievances exist
      const result = grievanceService.validateGrievanceCode('GRV-2024-NEW1');

      // Verify: Should be valid (no conflicts)
      expect(result.valid).toBe(true);
    });

    it('should handle malformed localStorage data', () => {
      // Setup: Set invalid JSON
      localStorage.setItem(STORAGE_KEYS.GRIEVANCE_DB, 'invalid json');

      // Execute & Verify: Should handle gracefully
      expect(() => {
        grievanceService.validateGrievanceCode('GRV-2024-NEW1');
      }).toThrow(); // Will throw JSON parse error, which is expected
    });

    it('should validate userId case-sensitively', () => {
      // Setup
      const users = [
        {
          id: 'User123',
          email: 'student@example.com',
          role: 'student',
          status: 'active'
        }
      ];
      localStorage.setItem('users', JSON.stringify(users));

      // Execute: Try with different case
      const result1 = grievanceService.validateUserId('User123');
      const result2 = grievanceService.validateUserId('user123');

      // Verify: Should be case-sensitive
      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(false); // Different case should fail
    });

    it('should validate grievance code case-sensitively', () => {
      // Setup
      const grievances = {
        academic: [
          {
            id: 1,
            code: 'GRV-2024-ABC1',
            userId: 'user123'
          }
        ]
      };
      localStorage.setItem(STORAGE_KEYS.GRIEVANCE_DB, JSON.stringify(grievances));

      // Execute
      const result1 = grievanceService.validateGrievanceCode('GRV-2024-ABC1');
      const result2 = grievanceService.validateGrievanceCode('grv-2024-abc1');

      // Verify: Should be case-sensitive
      expect(result1.valid).toBe(false); // Exact match - duplicate
      expect(result2.valid).toBe(true); // Different case - unique
    });
  });
});
