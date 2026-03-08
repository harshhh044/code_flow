import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userService } from './userService';
import { storageService } from './storageService';

// Mock storageService
vi.mock('./storageService', () => ({
  storageService: {
    get: vi.fn(),
    set: vi.fn()
  }
}));

describe('userService Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock: empty users array
    storageService.get.mockReturnValue([]);
  });

  describe('validateEmail', () => {
    it('should return valid for correct email format', () => {
      const result = userService.validateEmail('test@example.com');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for missing email', () => {
      const result = userService.validateEmail('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Email is required');
    });

    it('should return invalid for email without @', () => {
      const result = userService.validateEmail('testexample.com');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    it('should return invalid for email without domain', () => {
      const result = userService.validateEmail('test@');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    it('should return invalid for email without TLD', () => {
      const result = userService.validateEmail('test@example');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    it('should return invalid for email with spaces', () => {
      const result = userService.validateEmail('test @example.com');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });
  });

  describe('isEmailUnique', () => {
    it('should return unique for new email', () => {
      storageService.get.mockReturnValue([
        { email: 'existing@example.com', id: '1' }
      ]);

      const result = userService.isEmailUnique('new@example.com');
      expect(result.unique).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return not unique for existing email', () => {
      storageService.get.mockReturnValue([
        { email: 'existing@example.com', id: '1' }
      ]);

      const result = userService.isEmailUnique('existing@example.com');
      expect(result.unique).toBe(false);
      expect(result.error).toBe('Email already exists');
    });

    it('should exclude specified user ID when checking uniqueness', () => {
      storageService.get.mockReturnValue([
        { email: 'user@example.com', id: '1' }
      ]);

      const result = userService.isEmailUnique('user@example.com', '1');
      expect(result.unique).toBe(true);
    });

    it('should return not unique if email exists for different user', () => {
      storageService.get.mockReturnValue([
        { email: 'user@example.com', id: '1' },
        { email: 'other@example.com', id: '2' }
      ]);

      const result = userService.isEmailUnique('user@example.com', '2');
      expect(result.unique).toBe(false);
      expect(result.error).toBe('Email already exists');
    });
  });

  describe('validateRole', () => {
    it('should return valid for admin role', () => {
      const result = userService.validateRole('admin');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for student role', () => {
      const result = userService.validateRole('student');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for missing role', () => {
      const result = userService.validateRole('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Role is required');
    });

    it('should return invalid for invalid role', () => {
      const result = userService.validateRole('teacher');
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Role must be either 'admin' or 'student'");
    });

    it('should return invalid for null role', () => {
      const result = userService.validateRole(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Role is required');
    });
  });

  describe('validateStatus', () => {
    it('should return valid for active status', () => {
      const result = userService.validateStatus('active');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for blocked status', () => {
      const result = userService.validateStatus('blocked');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for restricted status', () => {
      const result = userService.validateStatus('restricted');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for removed status', () => {
      const result = userService.validateStatus('removed');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for missing status', () => {
      const result = userService.validateStatus('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Status is required');
    });

    it('should return invalid for invalid status', () => {
      const result = userService.validateStatus('suspended');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Status must be one of: active, blocked, restricted, removed');
    });
  });

  describe('hashPassword', () => {
    it('should hash password', () => {
      const password = 'mySecurePassword123';
      const hashed = userService.hashPassword(password);
      
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed).toMatch(/^hashed_[a-f0-9]+$/);
    });

    it('should produce consistent hash for same password', () => {
      const password = 'testPassword';
      const hash1 = userService.hashPassword(password);
      const hash2 = userService.hashPassword(password);
      
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different passwords', () => {
      const hash1 = userService.hashPassword('password1');
      const hash2 = userService.hashPassword('password2');
      
      expect(hash1).not.toBe(hash2);
    });

    it('should throw error for empty password', () => {
      expect(() => userService.hashPassword('')).toThrow('Password is required');
    });

    it('should throw error for null password', () => {
      expect(() => userService.hashPassword(null)).toThrow('Password is required');
    });
  });

  describe('validateUserCreation', () => {
    it('should return valid for correct user data', () => {
      storageService.get.mockReturnValue([]);

      const userData = {
        email: 'newuser@example.com',
        role: 'student',
        password: 'password123'
      };

      const result = userService.validateUserCreation(userData);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid for missing email', () => {
      const userData = {
        role: 'student',
        password: 'password123'
      };

      const result = userService.validateUserCreation(userData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Email is required');
    });

    it('should return invalid for invalid email format', () => {
      const userData = {
        email: 'invalid-email',
        role: 'student',
        password: 'password123'
      };

      const result = userService.validateUserCreation(userData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    it('should return invalid for duplicate email', () => {
      storageService.get.mockReturnValue([
        { email: 'existing@example.com', id: '1' }
      ]);

      const userData = {
        email: 'existing@example.com',
        role: 'student',
        password: 'password123'
      };

      const result = userService.validateUserCreation(userData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Email already exists');
    });

    it('should return invalid for missing role', () => {
      const userData = {
        email: 'user@example.com',
        password: 'password123'
      };

      const result = userService.validateUserCreation(userData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Role is required');
    });

    it('should return invalid for invalid role', () => {
      const userData = {
        email: 'user@example.com',
        role: 'teacher',
        password: 'password123'
      };

      const result = userService.validateUserCreation(userData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Role must be either 'admin' or 'student'");
    });

    it('should return invalid for missing password', () => {
      const userData = {
        email: 'user@example.com',
        role: 'student'
      };

      const result = userService.validateUserCreation(userData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });

    it('should return invalid for invalid status', () => {
      const userData = {
        email: 'user@example.com',
        role: 'student',
        password: 'password123',
        status: 'invalid'
      };

      const result = userService.validateUserCreation(userData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Status must be one of: active, blocked, restricted, removed');
    });

    it('should return multiple errors for multiple validation failures', () => {
      const userData = {
        email: 'invalid-email',
        role: 'teacher'
      };

      const result = userService.validateUserCreation(userData);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain('Invalid email format');
      expect(result.errors).toContain("Role must be either 'admin' or 'student'");
      expect(result.errors).toContain('Password is required');
    });
  });

  describe('createUser', () => {
    beforeEach(() => {
      storageService.get.mockReturnValue([]);
    });

    it('should create user with valid data', () => {
      const userData = {
        email: 'newuser@example.com',
        role: 'student',
        password: 'password123',
        fullName: 'Test User'
      };

      const result = userService.createUser(userData);
      
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('newuser@example.com');
      expect(result.user.role).toBe('student');
      expect(result.user.password).toMatch(/^hashed_/);
      expect(result.user.password).not.toBe('password123');
      expect(result.user.status).toBe('active');
      expect(result.user.createdAt).toBeDefined();
      expect(result.user.lastUpdated).toBeDefined();
    });

    it('should hash password before storage', () => {
      const userData = {
        email: 'user@example.com',
        role: 'student',
        password: 'plainPassword'
      };

      const result = userService.createUser(userData);
      
      expect(result.success).toBe(true);
      expect(result.user.password).not.toBe('plainPassword');
      expect(result.user.password).toMatch(/^hashed_/);
    });

    it('should set default status to active if not provided', () => {
      const userData = {
        email: 'user@example.com',
        role: 'student',
        password: 'password123'
      };

      const result = userService.createUser(userData);
      
      expect(result.success).toBe(true);
      expect(result.user.status).toBe('active');
    });

    it('should use provided status if valid', () => {
      const userData = {
        email: 'user@example.com',
        role: 'student',
        password: 'password123',
        status: 'restricted'
      };

      const result = userService.createUser(userData);
      
      expect(result.success).toBe(true);
      expect(result.user.status).toBe('restricted');
    });

    it('should return error for invalid email', () => {
      const userData = {
        email: 'invalid-email',
        role: 'student',
        password: 'password123'
      };

      const result = userService.createUser(userData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid email format');
    });

    it('should return error for duplicate email', () => {
      storageService.get.mockReturnValue([
        { email: 'existing@example.com', id: '1' }
      ]);

      const userData = {
        email: 'existing@example.com',
        role: 'student',
        password: 'password123'
      };

      const result = userService.createUser(userData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Email already exists');
    });

    it('should return descriptive error message with multiple validation failures', () => {
      const userData = {
        email: 'invalid',
        role: 'invalid',
        password: ''
      };

      const result = userService.createUser(userData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Invalid email format');
      expect(result.error).toContain('Role must be either');
      expect(result.error).toContain('Password is required');
    });

    it('should save user to storage', () => {
      const userData = {
        email: 'user@example.com',
        role: 'student',
        password: 'password123'
      };

      userService.createUser(userData);
      
      expect(storageService.set).toHaveBeenCalledWith(
        'users',
        expect.arrayContaining([
          expect.objectContaining({
            email: 'user@example.com',
            role: 'student'
          })
        ])
      );
    });
  });

  describe('updateUserStatus', () => {
    beforeEach(() => {
      storageService.get.mockReturnValue([
        { 
          id: '1', 
          email: 'user@example.com', 
          fullName: 'Test User',
          status: 'active' 
        }
      ]);
    });

    it('should update user status with valid status', () => {
      const result = userService.updateUserStatus('1', 'blocked');
      
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.status).toBe('blocked');
      expect(result.user.lastUpdated).toBeDefined();
    });

    it('should return error for invalid status', () => {
      const result = userService.updateUserStatus('1', 'invalid');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Status must be one of: active, blocked, restricted, removed');
    });

    it('should return error for non-existent user', () => {
      const result = userService.updateUserStatus('999', 'blocked');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });

    it('should update status for all valid statuses', () => {
      const statuses = ['active', 'blocked', 'restricted', 'removed'];
      
      statuses.forEach(status => {
        const result = userService.updateUserStatus('1', status);
        expect(result.success).toBe(true);
        expect(result.user.status).toBe(status);
      });
    });

    it('should save updated user to storage', () => {
      userService.updateUserStatus('1', 'blocked');
      
      expect(storageService.set).toHaveBeenCalledWith(
        'users',
        expect.arrayContaining([
          expect.objectContaining({
            id: '1',
            status: 'blocked'
          })
        ])
      );
    });
  });
});
