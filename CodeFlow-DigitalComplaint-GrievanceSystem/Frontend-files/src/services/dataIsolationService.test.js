import { describe, it, expect } from 'vitest';
import { dataIsolationService, PERMISSIONS } from './dataIsolationService';

describe('DataIsolationService', () => {
  describe('checkPermission', () => {
    it('should grant admin permissions to admin users', () => {
      const adminUser = { id: '1', email: 'admin@test.com', role: 'admin' };
      
      expect(dataIsolationService.checkPermission(adminUser, PERMISSIONS.VIEW_ALL_USERS)).toBe(true);
      expect(dataIsolationService.checkPermission(adminUser, PERMISSIONS.MANAGE_USERS)).toBe(true);
      expect(dataIsolationService.checkPermission(adminUser, PERMISSIONS.VIEW_ALL_GRIEVANCES)).toBe(true);
      expect(dataIsolationService.checkPermission(adminUser, PERMISSIONS.UPDATE_GRIEVANCE_STATUS)).toBe(true);
      expect(dataIsolationService.checkPermission(adminUser, PERMISSIONS.DELETE_DATA)).toBe(true);
    });

    it('should grant student permissions to student users', () => {
      const studentUser = { id: '2', email: 'student@test.com', role: 'student' };
      
      expect(dataIsolationService.checkPermission(studentUser, PERMISSIONS.VIEW_OWN_DATA)).toBe(true);
      expect(dataIsolationService.checkPermission(studentUser, PERMISSIONS.SUBMIT_GRIEVANCE)).toBe(true);
    });

    it('should deny admin permissions to student users', () => {
      const studentUser = { id: '2', email: 'student@test.com', role: 'student' };
      
      expect(dataIsolationService.checkPermission(studentUser, PERMISSIONS.VIEW_ALL_USERS)).toBe(false);
      expect(dataIsolationService.checkPermission(studentUser, PERMISSIONS.MANAGE_USERS)).toBe(false);
      expect(dataIsolationService.checkPermission(studentUser, PERMISSIONS.UPDATE_GRIEVANCE_STATUS)).toBe(false);
    });

    it('should handle case-insensitive role names', () => {
      const adminUser = { id: '1', email: 'admin@test.com', role: 'Admin' };
      const studentUser = { id: '2', email: 'student@test.com', role: 'Student' };
      
      expect(dataIsolationService.checkPermission(adminUser, PERMISSIONS.VIEW_ALL_USERS)).toBe(true);
      expect(dataIsolationService.checkPermission(studentUser, PERMISSIONS.VIEW_OWN_DATA)).toBe(true);
    });

    it('should return false for null or undefined user', () => {
      expect(dataIsolationService.checkPermission(null, PERMISSIONS.VIEW_ALL_USERS)).toBe(false);
      expect(dataIsolationService.checkPermission(undefined, PERMISSIONS.VIEW_ALL_USERS)).toBe(false);
    });

    it('should return false for user without role', () => {
      const userWithoutRole = { id: '1', email: 'test@test.com' };
      expect(dataIsolationService.checkPermission(userWithoutRole, PERMISSIONS.VIEW_ALL_USERS)).toBe(false);
    });
  });

  describe('filterDataByUser - grievances', () => {
    const grievances = [
      { id: 1, userId: 'student1@test.com', email: 'student1@test.com', subject: 'Issue 1' },
      { id: 2, userId: 'student2@test.com', email: 'student2@test.com', subject: 'Issue 2' },
      { id: 3, userId: 'anonymous', email: 'anonymous@system.local', subject: 'Anonymous Issue', isAnonymous: true },
      { id: 4, userId: 'student1@test.com', userEmail: 'student1@test.com', subject: 'Issue 3' }
    ];

    it('should return all grievances for admin users', () => {
      const adminUser = { id: 'admin1', email: 'admin@test.com', role: 'admin' };
      const filtered = dataIsolationService.filterDataByUser(grievances, adminUser, 'grievances');
      
      expect(filtered).toHaveLength(4);
      expect(filtered).toEqual(grievances);
    });

    it('should return only user own grievances for student users', () => {
      const studentUser = { id: 'student1', email: 'student1@test.com', role: 'student' };
      const filtered = dataIsolationService.filterDataByUser(grievances, studentUser, 'grievances');
      
      expect(filtered).toHaveLength(2);
      expect(filtered.every(g => g.userId === 'student1@test.com' || g.userEmail === 'student1@test.com')).toBe(true);
    });

    it('should exclude anonymous grievances from student view', () => {
      const studentUser = { id: 'student1', email: 'student1@test.com', role: 'student' };
      const filtered = dataIsolationService.filterDataByUser(grievances, studentUser, 'grievances');
      
      expect(filtered.some(g => g.userId === 'anonymous' || g.isAnonymous)).toBe(false);
    });

    it('should match grievances by multiple email fields', () => {
      const grievancesWithMultipleEmails = [
        { id: 1, userId: 'user1', email: 'personal@test.com', subject: 'Issue 1' },
        { id: 2, userId: 'user2', personalEmail: 'personal@test.com', subject: 'Issue 2' },
        { id: 3, userId: 'user3', uniEmail: 'personal@test.com', subject: 'Issue 3' }
      ];

      const studentUser = { id: 'user1', email: 'personal@test.com', role: 'student' };
      const filtered = dataIsolationService.filterDataByUser(grievancesWithMultipleEmails, studentUser, 'grievances');
      
      expect(filtered).toHaveLength(3);
    });

    it('should return empty array for null or undefined user', () => {
      expect(dataIsolationService.filterDataByUser(grievances, null, 'grievances')).toEqual([]);
      expect(dataIsolationService.filterDataByUser(grievances, undefined, 'grievances')).toEqual([]);
    });

    it('should return empty array for non-array data', () => {
      const studentUser = { id: 'student1', email: 'student1@test.com', role: 'student' };
      expect(dataIsolationService.filterDataByUser(null, studentUser, 'grievances')).toEqual([]);
      expect(dataIsolationService.filterDataByUser({}, studentUser, 'grievances')).toEqual([]);
    });
  });

  describe('filterDataByUser - users', () => {
    const users = [
      { id: '1', email: 'student1@test.com', name: 'Student 1', role: 'student' },
      { id: '2', email: 'student2@test.com', name: 'Student 2', role: 'student' },
      { id: '3', email: 'admin@test.com', name: 'Admin', role: 'admin' }
    ];

    it('should return all users for admin users', () => {
      const adminUser = { id: '3', email: 'admin@test.com', role: 'admin' };
      const filtered = dataIsolationService.filterDataByUser(users, adminUser, 'users');
      
      expect(filtered).toHaveLength(3);
      expect(filtered).toEqual(users);
    });

    it('should return only own profile for student users', () => {
      const studentUser = { id: '1', email: 'student1@test.com', role: 'student' };
      const filtered = dataIsolationService.filterDataByUser(users, studentUser, 'users');
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
      expect(filtered[0].email).toBe('student1@test.com');
    });

    it('should return empty array for unknown data type', () => {
      const studentUser = { id: '1', email: 'student1@test.com', role: 'student' };
      const filtered = dataIsolationService.filterDataByUser(users, studentUser, 'unknown');
      
      expect(filtered).toEqual([]);
    });
  });

  describe('sanitizeUserData', () => {
    const userData = {
      id: '1',
      email: 'user@test.com',
      personalEmail: 'personal@test.com',
      uniEmail: 'uni@test.com',
      phone: '1234567890',
      password: 'hashedpassword',
      name: 'Test User',
      role: 'student',
      department: 'CS'
    };

    it('should return full data for owner', () => {
      const owner = { id: '1', email: 'user@test.com', role: 'student' };
      const sanitized = dataIsolationService.sanitizeUserData(userData, owner);
      
      expect(sanitized).toHaveProperty('password');
      expect(sanitized).toHaveProperty('phone');
      expect(sanitized).toHaveProperty('email');
      expect(sanitized).toEqual(userData);
    });

    it('should return full data for admin users', () => {
      const admin = { id: 'admin1', email: 'admin@test.com', role: 'admin' };
      const sanitized = dataIsolationService.sanitizeUserData(userData, admin);
      
      expect(sanitized).toHaveProperty('password');
      expect(sanitized).toHaveProperty('phone');
      expect(sanitized).toHaveProperty('email');
    });

    it('should remove sensitive fields for non-owners', () => {
      const otherUser = { id: '2', email: 'other@test.com', role: 'student' };
      const sanitized = dataIsolationService.sanitizeUserData(userData, otherUser);
      
      expect(sanitized).not.toHaveProperty('password');
      expect(sanitized).not.toHaveProperty('phone');
      expect(sanitized).not.toHaveProperty('email');
      expect(sanitized).not.toHaveProperty('personalEmail');
      expect(sanitized).not.toHaveProperty('uniEmail');
      
      // Should keep non-sensitive fields
      expect(sanitized).toHaveProperty('name');
      expect(sanitized).toHaveProperty('role');
      expect(sanitized).toHaveProperty('department');
    });

    it('should return null for null user', () => {
      const requestingUser = { id: '1', email: 'user@test.com', role: 'student' };
      expect(dataIsolationService.sanitizeUserData(null, requestingUser)).toBeNull();
    });

    it('should not mutate original user object', () => {
      const otherUser = { id: '2', email: 'other@test.com', role: 'student' };
      const originalData = { ...userData };
      
      dataIsolationService.sanitizeUserData(userData, otherUser);
      
      expect(userData).toEqual(originalData);
    });
  });
});
