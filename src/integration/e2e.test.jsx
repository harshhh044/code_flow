import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../services/authService';
import { grievanceService } from '../services/grievanceService';
import { adminService } from '../services/adminService';
import { dataIsolationService, PERMISSIONS } from '../services/dataIsolationService';
import { storageService } from '../services/storageService';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * End-to-End Integration Tests
 * 
 * These tests verify complete user flows through the system, including:
 * - Complete user flow: login, submit grievance, view own data
 * - Admin flow: login, view all users, change user status, view all grievances
 * - Data isolation: student cannot see other users' data
 * - Anonymous grievance submission and visibility
 * 
 * **Validates: Requirements 1.1, 3.1, 3.2, 4.1, 5.1, 6.1, 12.1, 12.2, 12.3, 12.4**
 */
describe('End-to-End Integration Tests', () => {
  beforeEach(() => {
    // Clear all storage before each test
    localStorage.clear();
    
    // Setup test users
    const testUsers = [
      {
        id: 'student1@test.com',
        email: 'student1@test.com',
        password: 'password123',
        role: 'student',
        status: 'active',
        name: 'Student One',
        department: 'Computer Science',
        uid: 'STU001'
      },
      {
        id: 'student2@test.com',
        email: 'student2@test.com',
        password: 'password123',
        role: 'student',
        status: 'active',
        name: 'Student Two',
        department: 'Electrical Engineering',
        uid: 'STU002'
      },
      {
        id: 'admin@test.com',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin',
        status: 'active',
        name: 'Admin User',
        department: 'Administration',
        uid: 'ADM001'
      }
    ];
    
    storageService.set('users', testUsers);
    storageService.set('sessions', []);
    storageService.set('activityLogs', []);
    storageService.set(STORAGE_KEYS.GRIEVANCE_DB, {});
    storageService.set(STORAGE_KEYS.ANON_GRIEVANCE_DB, []);
  });

  describe('Complete User Flow', () => {
    /**
     * Test complete user flow: login, submit grievance, view own data
     * **Validates: Requirements 1.1, 3.1, 4.1**
     */
    it('should complete full user flow: login -> submit grievance -> view own data', async () => {
      // Step 1: User logs in
      const loginResult = authService.login('student1@test.com', 'password123', 'student', 'STU001');
      
      expect(loginResult.success).toBe(true);
      expect(loginResult.user.email).toBe('student1@test.com');
      expect(loginResult.user.role).toBe('student');
      expect(loginResult.token).toBeDefined();
      
      const user = loginResult.user;
      
      // Step 2: User submits a grievance
      const grievanceData = {
        category: 'academic',
        subject: 'Grade Issue',
        description: 'Need clarification on exam grades',
        priority: 'medium',
        user: user
      };
      
      const grievance = await grievanceService.submitGrievance(
        grievanceData,
        false, // not anonymous
        user
      );
      
      expect(grievance).toBeDefined();
      expect(grievance.userId).toBe(user.id);
      expect(grievance.userEmail).toBe(user.email);
      expect(grievance.status).toBe('Pending');
      expect(grievance.code).toBeDefined();
      expect(grievance.history).toBeDefined();
      expect(grievance.history.length).toBe(1);
      
      // Step 3: User views their own grievances
      const userGrievances = await grievanceService.getGrievances(user);
      
      expect(userGrievances.length).toBe(1);
      expect(userGrievances[0].code).toBe(grievance.code);
      expect(userGrievances[0].userId).toBe(user.id);
      
      // Step 4: Verify user can only see their own data
      const filteredData = dataIsolationService.filterDataByUser(
        userGrievances,
        user,
        'grievances'
      );
      
      expect(filteredData.length).toBe(1);
      expect(filteredData[0].userId).toBe(user.id);
    });

    /**
     * Test user can submit multiple grievances
     * **Validates: Requirement 4.1**
     */
    it('should allow user to submit multiple grievances', async () => {
      const loginResult = authService.login('student1@test.com', 'password123', 'student', 'STU001');
      const user = loginResult.user;
      
      // Submit first grievance
      const grievance1 = await grievanceService.submitGrievance(
        {
          category: 'academic',
          subject: 'First Issue',
          description: 'Description 1',
          user: user
        },
        false,
        user
      );
      
      // Submit second grievance
      const grievance2 = await grievanceService.submitGrievance(
        {
          category: 'infrastructure',
          subject: 'Second Issue',
          description: 'Description 2',
          user: user
        },
        false,
        user
      );
      
      expect(grievance1.code).not.toBe(grievance2.code);
      
      // Verify user can see both grievances
      const userGrievances = await grievanceService.getGrievances(user);
      expect(userGrievances.length).toBe(2);
    });
  });

  describe('Complete Admin Flow', () => {
    /**
     * Test complete admin flow: login, view all users, change user status, view all grievances
     * **Validates: Requirements 1.1, 5.1, 5.2, 6.1**
     */
    it('should complete full admin flow: login -> view users -> change status -> view grievances', async () => {
      // Setup: Create some test grievances from different users
      const student1Login = authService.login('student1@test.com', 'password123', 'student', 'STU001');
      const student1 = student1Login.user;
      
      await grievanceService.submitGrievance(
        {
          category: 'academic',
          subject: 'Student 1 Issue',
          description: 'Issue from student 1',
          user: student1
        },
        false,
        student1
      );
      
      const student2Login = authService.login('student2@test.com', 'password123', 'student', 'STU002');
      const student2 = student2Login.user;
      
      await grievanceService.submitGrievance(
        {
          category: 'infrastructure',
          subject: 'Student 2 Issue',
          description: 'Issue from student 2',
          user: student2
        },
        false,
        student2
      );
      
      // Step 1: Admin logs in
      const adminLogin = authService.login('admin@test.com', 'admin123', 'admin', 'ADM001');
      
      expect(adminLogin.success).toBe(true);
      expect(adminLogin.user.role).toBe('admin');
      
      const admin = adminLogin.user;
      
      // Step 2: Admin views all users
      const allUsers = adminService.getAllUsers(admin);
      
      expect(allUsers.length).toBe(3); // 2 students + 1 admin
      expect(allUsers.some(u => u.email === 'student1@test.com')).toBe(true);
      expect(allUsers.some(u => u.email === 'student2@test.com')).toBe(true);
      
      // Step 3: Admin changes user status
      const updatedUser = adminService.updateUserStatus(
        admin.email,
        'student1@test.com',
        'blocked'
      );
      
      expect(updatedUser).toBeDefined();
      expect(updatedUser.status).toBe('blocked');
      
      // Verify status change persisted
      const users = storageService.get('users', []);
      const persistedUser = users.find(u => u.email === 'student1@test.com');
      expect(persistedUser.status).toBe('blocked');
      
      // Step 4: Admin views all grievances
      const allGrievances = await grievanceService.getGrievances(admin);
      
      expect(allGrievances.length).toBe(2); // Both students' grievances
      expect(allGrievances.some(g => g.userId === student1.id)).toBe(true);
      expect(allGrievances.some(g => g.userId === student2.id)).toBe(true);
      
      // Step 5: Admin updates grievance status
      const grievanceToUpdate = allGrievances[0];
      const updatedGrievance = await grievanceService.updateGrievanceStatus(
        admin,
        grievanceToUpdate.code,
        'In Progress',
        'Working on this issue'
      );
      
      expect(updatedGrievance.status).toBe('In Progress');
      expect(updatedGrievance.history.length).toBeGreaterThan(1);
      expect(updatedGrievance.history[updatedGrievance.history.length - 1].adminEmail).toBe(admin.email);
    });

    /**
     * Test admin can view user statistics
     * **Validates: Requirement 5.5**
     */
    it('should allow admin to view user statistics', async () => {
      const adminLogin = authService.login('admin@test.com', 'admin123', 'admin', 'ADM001');
      const admin = adminLogin.user;
      
      // Change one user status to blocked
      adminService.updateUserStatus(admin.email, 'student1@test.com', 'blocked');
      
      // Get statistics
      const stats = adminService.getUserStatistics(admin);
      
      expect(stats).toBeDefined();
      expect(stats.byStatus).toBeDefined();
      expect(stats.byStatus.active).toBe(2); // 1 student + 1 admin
      expect(stats.byStatus.blocked).toBe(1);
      expect(stats.byDepartment).toBeDefined();
      expect(stats.total).toBe(3);
    });
  });

  describe('Data Isolation', () => {
    /**
     * Test student cannot see other users' data
     * **Validates: Requirements 3.1, 3.2, 3.3**
     */
    it('should prevent student from seeing other users data', async () => {
      // Setup: Create grievances from two different students
      const student1Login = authService.login('student1@test.com', 'password123', 'student', 'STU001');
      const student1 = student1Login.user;
      
      const grievance1 = await grievanceService.submitGrievance(
        {
          category: 'academic',
          subject: 'Student 1 Private Issue',
          description: 'Private data for student 1',
          user: student1
        },
        false,
        student1
      );
      
      const student2Login = authService.login('student2@test.com', 'password123', 'student', 'STU002');
      const student2 = student2Login.user;
      
      const grievance2 = await grievanceService.submitGrievance(
        {
          category: 'infrastructure',
          subject: 'Student 2 Private Issue',
          description: 'Private data for student 2',
          user: student2
        },
        false,
        student2
      );
      
      // Test: Student 1 should only see their own grievances
      const student1Grievances = await grievanceService.getGrievances(student1);
      
      expect(student1Grievances.length).toBe(1);
      expect(student1Grievances[0].code).toBe(grievance1.code);
      expect(student1Grievances[0].userId).toBe(student1.id);
      expect(student1Grievances.some(g => g.code === grievance2.code)).toBe(false);
      
      // Test: Student 2 should only see their own grievances
      const student2Grievances = await grievanceService.getGrievances(student2);
      
      expect(student2Grievances.length).toBe(1);
      expect(student2Grievances[0].code).toBe(grievance2.code);
      expect(student2Grievances[0].userId).toBe(student2.id);
      expect(student2Grievances.some(g => g.code === grievance1.code)).toBe(false);
    });

    /**
     * Test student cannot access another user's profile data
     * **Validates: Requirement 3.2**
     */
    it('should sanitize user data when accessed by non-owner', () => {
      const student1Login = authService.login('student1@test.com', 'password123', 'student', 'STU001');
      const student1 = student1Login.user;
      
      const student2Login = authService.login('student2@test.com', 'password123', 'student', 'STU002');
      const student2 = student2Login.user;
      
      // Student 1 tries to access Student 2's data
      const sanitizedData = dataIsolationService.sanitizeUserData(student2, student1);
      
      // Sensitive fields should be removed
      expect(sanitizedData.password).toBeUndefined();
      expect(sanitizedData.phone).toBeUndefined();
      expect(sanitizedData.email).toBeUndefined();
      
      // Public fields should remain
      expect(sanitizedData.name).toBeDefined();
      expect(sanitizedData.role).toBeDefined();
    });

    /**
     * Test permission checking prevents unauthorized operations
     * **Validates: Requirements 2.4, 6.5**
     */
    it('should prevent student from performing admin operations', async () => {
      const studentLogin = authService.login('student1@test.com', 'password123', 'student', 'STU001');
      const student = studentLogin.user;
      
      // Test: Student cannot update grievance status
      const grievance = await grievanceService.submitGrievance(
        {
          category: 'academic',
          subject: 'Test Issue',
          description: 'Test',
          user: student
        },
        false,
        student
      );
      
      await expect(
        grievanceService.updateGrievanceStatus(
          student,
          grievance.code,
          'Resolved',
          'Trying to resolve'
        )
      ).rejects.toThrow('Permission denied');
      
      // Test: Student does not have admin permissions
      expect(dataIsolationService.checkPermission(student, PERMISSIONS.MANAGE_USERS)).toBe(false);
      expect(dataIsolationService.checkPermission(student, PERMISSIONS.VIEW_ALL_GRIEVANCES)).toBe(false);
      expect(dataIsolationService.checkPermission(student, PERMISSIONS.UPDATE_GRIEVANCE_STATUS)).toBe(false);
    });
  });

  describe('Anonymous Grievance Handling', () => {
    /**
     * Test anonymous grievance submission and visibility
     * **Validates: Requirements 12.1, 12.2, 12.3, 12.4**
     */
    it('should handle anonymous grievance submission correctly', async () => {
      const studentLogin = authService.login('student1@test.com', 'password123', 'student', 'STU001');
      const student = studentLogin.user;
      
      // Step 1: Student submits anonymous grievance
      const anonGrievance = await grievanceService.submitGrievance(
        {
          category: 'harassment',
          subject: 'Anonymous Report',
          description: 'Sensitive issue reported anonymously',
          user: student
        },
        true, // anonymous
        student
      );
      
      expect(anonGrievance.userId).toBe('anonymous');
      expect(anonGrievance.userEmail).toBe('anonymous@system.local');
      expect(anonGrievance.isAnonymous).toBe(true);
      
      // Step 2: Student should NOT see anonymous grievance in their list
      const studentGrievances = await grievanceService.getGrievances(student);
      
      expect(studentGrievances.some(g => g.code === anonGrievance.code)).toBe(false);
      
      // Step 3: Admin should see anonymous grievance
      const adminLogin = authService.login('admin@test.com', 'admin123', 'admin', 'ADM001');
      const admin = adminLogin.user;
      
      const adminGrievances = await grievanceService.getGrievances(admin);
      
      expect(adminGrievances.some(g => g.code === anonGrievance.code)).toBe(true);
      
      const foundAnonGrievance = adminGrievances.find(g => g.code === anonGrievance.code);
      expect(foundAnonGrievance.userId).toBe('anonymous');
      expect(foundAnonGrievance.isAnonymous).toBe(true);
    });

    /**
     * Test anonymous grievance does not reveal submitter identity
     * **Validates: Requirement 12.4**
     */
    it('should not reveal submitter identity for anonymous grievances', async () => {
      const studentLogin = authService.login('student1@test.com', 'password123', 'student', 'STU001');
      const student = studentLogin.user;
      
      const anonGrievance = await grievanceService.submitGrievance(
        {
          category: 'harassment',
          subject: 'Anonymous Report',
          description: 'Sensitive issue',
          user: student
        },
        true,
        student
      );
      
      // Verify no identifying information is stored
      expect(anonGrievance.userId).toBe('anonymous');
      expect(anonGrievance.userEmail).toBe('anonymous@system.local');
      expect(anonGrievance.userId).not.toBe(student.id);
      expect(anonGrievance.userEmail).not.toBe(student.email);
      
      // Verify it's stored in anonymous database
      const anonDB = storageService.get(STORAGE_KEYS.ANON_GRIEVANCE_DB, []);
      expect(anonDB.some(g => g.code === anonGrievance.code)).toBe(true);
    });

    /**
     * Test student can submit both regular and anonymous grievances
     * **Validates: Requirements 4.1, 12.1**
     */
    it('should allow student to submit both regular and anonymous grievances', async () => {
      const studentLogin = authService.login('student1@test.com', 'password123', 'student', 'STU001');
      const student = studentLogin.user;
      
      // Submit regular grievance
      const regularGrievance = await grievanceService.submitGrievance(
        {
          category: 'academic',
          subject: 'Regular Issue',
          description: 'Non-sensitive issue',
          user: student
        },
        false,
        student
      );
      
      // Submit anonymous grievance
      const anonGrievance = await grievanceService.submitGrievance(
        {
          category: 'harassment',
          subject: 'Anonymous Issue',
          description: 'Sensitive issue',
          user: student
        },
        true,
        student
      );
      
      expect(regularGrievance.userId).toBe(student.id);
      expect(anonGrievance.userId).toBe('anonymous');
      
      // Student should only see regular grievance
      const studentGrievances = await grievanceService.getGrievances(student);
      expect(studentGrievances.length).toBe(1);
      expect(studentGrievances[0].code).toBe(regularGrievance.code);
      
      // Admin should see both
      const adminLogin = authService.login('admin@test.com', 'admin123', 'admin', 'ADM001');
      const admin = adminLogin.user;
      
      const adminGrievances = await grievanceService.getGrievances(admin);
      expect(adminGrievances.length).toBe(2);
    });
  });

  describe('Complete System Integration', () => {
    /**
     * Test complete system flow with multiple users and operations
     * **Validates: All requirements integrated**
     */
    it('should handle complex multi-user scenario', async () => {
      // Scenario: Multiple students submit grievances, admin manages them
      
      // Student 1 submits regular grievance
      const student1Login = authService.login('student1@test.com', 'password123', 'student', 'STU001');
      const student1 = student1Login.user;
      
      const s1Grievance = await grievanceService.submitGrievance(
        {
          category: 'academic',
          subject: 'Grade Issue',
          description: 'Need grade review',
          user: student1
        },
        false,
        student1
      );
      
      // Student 2 submits anonymous grievance
      const student2Login = authService.login('student2@test.com', 'password123', 'student', 'STU002');
      const student2 = student2Login.user;
      
      const s2AnonGrievance = await grievanceService.submitGrievance(
        {
          category: 'harassment',
          subject: 'Harassment Report',
          description: 'Anonymous report',
          user: student2
        },
        true,
        student2
      );
      
      // Student 2 also submits regular grievance
      const s2Grievance = await grievanceService.submitGrievance(
        {
          category: 'infrastructure',
          subject: 'Facility Issue',
          description: 'Lab equipment broken',
          user: student2
        },
        false,
        student2
      );
      
      // Verify data isolation
      const s1Grievances = await grievanceService.getGrievances(student1);
      expect(s1Grievances.length).toBe(1);
      expect(s1Grievances[0].code).toBe(s1Grievance.code);
      
      const s2Grievances = await grievanceService.getGrievances(student2);
      expect(s2Grievances.length).toBe(1); // Only regular grievance, not anonymous
      expect(s2Grievances[0].code).toBe(s2Grievance.code);
      
      // Admin logs in and manages grievances
      const adminLogin = authService.login('admin@test.com', 'admin123', 'admin', 'ADM001');
      const admin = adminLogin.user;
      
      const allGrievances = await grievanceService.getGrievances(admin);
      expect(allGrievances.length).toBe(3); // All grievances including anonymous
      
      // Admin updates student 1's grievance
      await grievanceService.updateGrievanceStatus(
        admin,
        s1Grievance.code,
        'In Progress',
        'Reviewing grade records'
      );
      
      // Admin blocks student 1
      adminService.updateUserStatus(admin.email, student1.id, 'blocked');
      
      // Verify student 1 cannot login
      const blockedLogin = authService.login('student1@test.com', 'password123', 'student', 'STU001');
      expect(blockedLogin.success).toBe(false);
      expect(blockedLogin.accountStatus).toBe('blocked');
      
      // Verify student 2 can still operate normally
      const s2NewGrievance = await grievanceService.submitGrievance(
        {
          category: 'other',
          subject: 'Another Issue',
          description: 'New issue',
          user: student2
        },
        false,
        student2
      );
      
      expect(s2NewGrievance).toBeDefined();
      
      // Admin views updated statistics
      const stats = adminService.getUserStatistics(admin);
      expect(stats.byStatus.blocked).toBe(1);
      expect(stats.byStatus.active).toBe(2);
    });
  });
});
