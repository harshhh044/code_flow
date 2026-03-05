import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { authService } from './authService';
import { storageService } from './storageService';

/**
 * Bug Condition Exploration Test for Login Invalid Credentials Error
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
 * 
 * This test explores the bug condition where authentication fails but the error
 * message doesn't indicate which specific field is incorrect. The current implementation
 * only returns a generic "Invalid credentials. Please check your role, email and password."
 * message for all failure scenarios and completely ignores the UID field.
 * 
 * CRITICAL: This test is EXPECTED TO FAIL on unfixed code - failure confirms the bug exists.
 * DO NOT attempt to fix the test or the code when it fails.
 * 
 * The test will surface counterexamples demonstrating:
 * - Generic error messages returned for all scenarios
 * - UID field completely ignored in authentication
 * - No email typo detection
 * - No specific feedback for role mismatches or UID/email mismatches
 */
describe('Bug Condition Exploration: Specific Error Messages for Authentication Failures', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Setup test users with UIDs
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
        email: 'HK@gmail.com',
        password: 'hkpass123',
        role: 'student',
        status: 'active',
        fullName: 'HK Student',
        uid: 'STU002'
      }
    ];
    
    storageService.set('users', testUsers);
    storageService.set('sessions', []);
    storageService.set('activityLogs', []);
  });

  /**
   * Property 1: Fault Condition - Specific Error Messages for Authentication Failures
   * 
   * For any login attempt where authentication fails, the system should provide
   * specific error messages indicating which field is incorrect, rather than
   * returning a generic "Invalid credentials" message.
   */
  describe('Property 1: Fault Condition - Specific Error Messages', () => {
    it('should return specific error for email typo (e.g., gmal.com instead of gmail.com)', () => {
      // Test with email typo: "gmal.com" instead of "gmail.com"
      // Expected: Specific error suggesting to check for typos or indicating email not found
      // Actual on unfixed code: Generic "Invalid credentials. Please check your role, email and password."
      
      const result = authService.login('HK@gmal.com', 'hkpass123', 'student', 'STU002');
      
      expect(result.success).toBe(false);
      
      // The error should be specific about the email issue
      // It should either:
      // 1. Mention "email" specifically
      // 2. Suggest checking for typos
      // 3. Indicate email was not found
      // It should NOT be the generic message
      expect(result.error).not.toBe('Invalid credentials. Please check your role, email and password.');
      expect(
        result.error.toLowerCase().includes('email') ||
        result.error.toLowerCase().includes('typo') ||
        result.error.toLowerCase().includes('not found')
      ).toBe(true);
    });

    it('should return specific error when UID exists but email does not match', () => {
      // Test with valid UID but wrong email
      // Expected: Specific error indicating UID exists but email doesn't match
      // Actual on unfixed code: Generic error (UID is completely ignored)
      
      const result = authService.login('wrong@test.com', 'password123', 'student', 'STU001');
      
      expect(result.success).toBe(false);
      
      // The error should mention UID or indicate a mismatch
      expect(result.error).not.toBe('Invalid credentials. Please check your role, email and password.');
      expect(
        result.error.toLowerCase().includes('uid') ||
        result.error.toLowerCase().includes('mismatch') ||
        result.error.toLowerCase().includes('doesn\'t match')
      ).toBe(true);
    });

    it('should return specific error when role is incorrect', () => {
      // Test with correct email and password but wrong role
      // Expected: Specific error indicating role mismatch
      // Actual on unfixed code: Generic "Invalid credentials" message
      
      const result = authService.login('student@test.com', 'password123', 'admin', 'STU001');
      
      expect(result.success).toBe(false);
      
      // The error should specifically mention role
      expect(result.error).not.toBe('Invalid credentials. Please check your role, email and password.');
      expect(result.error.toLowerCase().includes('role')).toBe(true);
    });

    it('should return specific error when UID is invalid', () => {
      // Test with invalid UID
      // Expected: Specific error indicating UID not found
      // Actual on unfixed code: UID is ignored, so this might succeed if other credentials match
      
      const result = authService.login('student@test.com', 'password123', 'student', 'INVALID999');
      
      expect(result.success).toBe(false);
      
      // The error should mention UID
      expect(result.error).not.toBe('Invalid credentials. Please check your role, email and password.');
      expect(
        result.error.toLowerCase().includes('uid') ||
        result.error.toLowerCase().includes('not found')
      ).toBe(true);
    });

    /**
     * Property-based test: Generate various invalid credential combinations
     * and verify that specific error messages are returned (not generic)
     */
    it('should return specific error messages for various authentication failure scenarios', () => {
      fc.assert(
        fc.property(
          // Generate test cases with different types of credential mismatches
          fc.record({
            scenario: fc.constantFrom(
              'email_typo',
              'uid_mismatch',
              'role_mismatch',
              'invalid_uid'
            ),
            email: fc.constantFrom('student@test.com', 'admin@test.com', 'HK@gmail.com', 'HK@gmal.com', 'wrong@test.com'),
            password: fc.constantFrom('password123', 'admin123', 'hkpass123', 'wrongpass'),
            role: fc.constantFrom('student', 'admin'),
            uid: fc.constantFrom('STU001', 'STU002', 'ADM001', 'INVALID999')
          }),
          (testCase) => {
            // Only test cases that should fail authentication
            const shouldFail = 
              testCase.scenario === 'email_typo' && testCase.email === 'HK@gmal.com' ||
              testCase.scenario === 'uid_mismatch' && testCase.email === 'wrong@test.com' ||
              testCase.scenario === 'role_mismatch' && 
                (testCase.email === 'student@test.com' && testCase.role === 'admin') ||
              testCase.scenario === 'invalid_uid' && testCase.uid === 'INVALID999';
            
            if (!shouldFail) {
              return true; // Skip valid credential combinations
            }
            
            const result = authService.login(
              testCase.email,
              testCase.password,
              testCase.role,
              testCase.uid
            );
            
            // Should fail
            expect(result.success).toBe(false);
            
            // Should NOT return the generic error message
            const isGenericError = result.error === 'Invalid credentials. Please check your role, email and password.';
            
            // Should return a specific error message
            const hasSpecificError = 
              result.error.toLowerCase().includes('email') ||
              result.error.toLowerCase().includes('uid') ||
              result.error.toLowerCase().includes('role') ||
              result.error.toLowerCase().includes('typo') ||
              result.error.toLowerCase().includes('mismatch') ||
              result.error.toLowerCase().includes('not found');
            
            // This will fail on unfixed code because generic errors are returned
            return !isGenericError && hasSpecificError;
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
