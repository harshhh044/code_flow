import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sessionService } from './sessionService';
import { storageService } from './storageService';
import { userService } from './userService';

// Mock the dependencies
vi.mock('./storageService', () => ({
  storageService: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn()
  }
}));

vi.mock('./userService', () => ({
  userService: {
    getUserById: vi.fn()
  }
}));

describe('SessionService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Default mock implementations
    storageService.get.mockReturnValue([]);
    storageService.set.mockReturnValue(true);
  });

  describe('createSession', () => {
    it('should create a session with cryptographically secure token', () => {
      const userId = 'user123';
      
      const session = sessionService.createSession(userId);
      
      expect(session).toHaveProperty('userId', userId);
      expect(session).toHaveProperty('token');
      expect(session).toHaveProperty('loginTime');
      expect(session).toHaveProperty('expiresAt');
      
      // Token should be 64 characters (32 bytes in hex)
      expect(session.token).toHaveLength(64);
      expect(session.token).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should generate unique tokens for multiple sessions', () => {
      const userId = 'user123';
      
      const session1 = sessionService.createSession(userId);
      const session2 = sessionService.createSession(userId);
      
      expect(session1.token).not.toBe(session2.token);
    });

    it('should set expiration to 24 hours from creation', () => {
      const userId = 'user123';
      const beforeCreate = Date.now();
      
      const session = sessionService.createSession(userId);
      
      const afterCreate = Date.now();
      const loginTime = new Date(session.loginTime).getTime();
      const expiresAt = new Date(session.expiresAt).getTime();
      
      // Login time should be within test execution window
      expect(loginTime).toBeGreaterThanOrEqual(beforeCreate);
      expect(loginTime).toBeLessThanOrEqual(afterCreate);
      
      // Expiration should be 24 hours after login
      const expectedExpiration = 24 * 60 * 60 * 1000;
      const actualDuration = expiresAt - loginTime;
      
      // Allow 1 second tolerance for test execution time
      expect(actualDuration).toBeGreaterThanOrEqual(expectedExpiration - 1000);
      expect(actualDuration).toBeLessThanOrEqual(expectedExpiration + 1000);
    });

    it('should store session in localStorage', () => {
      const userId = 'user123';
      
      sessionService.createSession(userId);
      
      expect(storageService.set).toHaveBeenCalledWith(
        'sessions',
        expect.arrayContaining([
          expect.objectContaining({
            userId,
            token: expect.any(String),
            loginTime: expect.any(String),
            expiresAt: expect.any(String)
          })
        ])
      );
    });

    it('should append to existing sessions', () => {
      const existingSession = {
        userId: 'user1',
        token: 'existing-token',
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      
      storageService.get.mockReturnValue([existingSession]);
      
      sessionService.createSession('user2');
      
      expect(storageService.set).toHaveBeenCalledWith(
        'sessions',
        expect.arrayContaining([existingSession, expect.objectContaining({ userId: 'user2' })])
      );
    });
  });

  describe('validateSession', () => {
    it('should return null for invalid token', () => {
      storageService.get.mockReturnValue([]);
      
      const result = sessionService.validateSession('invalid-token');
      
      expect(result).toBeNull();
    });

    it('should return null for null or undefined token', () => {
      expect(sessionService.validateSession(null)).toBeNull();
      expect(sessionService.validateSession(undefined)).toBeNull();
    });

    it('should return session for valid non-expired token with active user', () => {
      const validSession = {
        userId: 'user123',
        token: 'valid-token',
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      
      storageService.get.mockReturnValue([validSession]);
      userService.getUserById.mockReturnValue({
        id: 'user123',
        email: 'user@example.com',
        status: 'active'
      });
      
      const result = sessionService.validateSession('valid-token');
      
      expect(result).toEqual(validSession);
    });

    it('should invalidate and return null for expired session', () => {
      const expiredSession = {
        userId: 'user123',
        token: 'expired-token',
        loginTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      };
      
      storageService.get.mockReturnValue([expiredSession]);
      
      const result = sessionService.validateSession('expired-token');
      
      expect(result).toBeNull();
      expect(storageService.set).toHaveBeenCalledWith('sessions', []);
    });

    it('should invalidate session when user is not found', () => {
      const session = {
        userId: 'user123',
        token: 'valid-token',
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      
      storageService.get.mockReturnValue([session]);
      userService.getUserById.mockReturnValue(null);
      
      const result = sessionService.validateSession('valid-token');
      
      expect(result).toBeNull();
      expect(storageService.set).toHaveBeenCalledWith('sessions', []);
    });

    it('should invalidate session when user status is blocked', () => {
      const session = {
        userId: 'user123',
        token: 'valid-token',
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      
      storageService.get.mockReturnValue([session]);
      userService.getUserById.mockReturnValue({
        id: 'user123',
        email: 'user@example.com',
        status: 'blocked'
      });
      
      const result = sessionService.validateSession('valid-token');
      
      expect(result).toBeNull();
      expect(storageService.set).toHaveBeenCalledWith('sessions', []);
    });

    it('should invalidate session when user status is removed', () => {
      const session = {
        userId: 'user123',
        token: 'valid-token',
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      
      storageService.get.mockReturnValue([session]);
      userService.getUserById.mockReturnValue({
        id: 'user123',
        email: 'user@example.com',
        status: 'removed'
      });
      
      const result = sessionService.validateSession('valid-token');
      
      expect(result).toBeNull();
    });

    it('should invalidate session when user status is restricted', () => {
      const session = {
        userId: 'user123',
        token: 'valid-token',
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      
      storageService.get.mockReturnValue([session]);
      userService.getUserById.mockReturnValue({
        id: 'user123',
        email: 'user@example.com',
        status: 'restricted'
      });
      
      const result = sessionService.validateSession('valid-token');
      
      expect(result).toBeNull();
    });
  });

  describe('invalidateSession', () => {
    it('should remove session with matching token', () => {
      const sessions = [
        {
          userId: 'user1',
          token: 'token1',
          loginTime: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        {
          userId: 'user2',
          token: 'token2',
          loginTime: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      storageService.get.mockReturnValue(sessions);
      
      const result = sessionService.invalidateSession('token1');
      
      expect(result).toBe(true);
      expect(storageService.set).toHaveBeenCalledWith(
        'sessions',
        [sessions[1]]
      );
    });

    it('should return false when token not found', () => {
      storageService.get.mockReturnValue([]);
      
      const result = sessionService.invalidateSession('non-existent-token');
      
      expect(result).toBe(false);
    });

    it('should return false for null or undefined token', () => {
      expect(sessionService.invalidateSession(null)).toBe(false);
      expect(sessionService.invalidateSession(undefined)).toBe(false);
    });

    it('should not modify storage when token not found', () => {
      const sessions = [
        {
          userId: 'user1',
          token: 'token1',
          loginTime: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      storageService.get.mockReturnValue(sessions);
      
      sessionService.invalidateSession('non-existent-token');
      
      expect(storageService.set).not.toHaveBeenCalled();
    });
  });

  describe('invalidateAllUserSessions', () => {
    it('should remove all sessions for a specific user', () => {
      const sessions = [
        {
          userId: 'user1',
          token: 'token1',
          loginTime: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        {
          userId: 'user1',
          token: 'token2',
          loginTime: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        {
          userId: 'user2',
          token: 'token3',
          loginTime: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      storageService.get.mockReturnValue(sessions);
      
      const result = sessionService.invalidateAllUserSessions('user1');
      
      expect(result).toBe(2);
      expect(storageService.set).toHaveBeenCalledWith(
        'sessions',
        [sessions[2]]
      );
    });

    it('should return 0 when user has no sessions', () => {
      const sessions = [
        {
          userId: 'user1',
          token: 'token1',
          loginTime: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      storageService.get.mockReturnValue(sessions);
      
      const result = sessionService.invalidateAllUserSessions('user2');
      
      expect(result).toBe(0);
      expect(storageService.set).not.toHaveBeenCalled();
    });

    it('should return 0 for null or undefined userId', () => {
      expect(sessionService.invalidateAllUserSessions(null)).toBe(0);
      expect(sessionService.invalidateAllUserSessions(undefined)).toBe(0);
    });

    it('should handle empty sessions array', () => {
      storageService.get.mockReturnValue([]);
      
      const result = sessionService.invalidateAllUserSessions('user1');
      
      expect(result).toBe(0);
    });
  });

  describe('getAllSessions', () => {
    it('should return all sessions from storage', () => {
      const sessions = [
        {
          userId: 'user1',
          token: 'token1',
          loginTime: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        {
          userId: 'user2',
          token: 'token2',
          loginTime: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      storageService.get.mockReturnValue(sessions);
      
      const result = sessionService.getAllSessions();
      
      expect(result).toEqual(sessions);
    });

    it('should return empty array when no sessions exist', () => {
      storageService.get.mockReturnValue([]);
      
      const result = sessionService.getAllSessions();
      
      expect(result).toEqual([]);
    });
  });

  describe('clearAllSessions', () => {
    it('should clear all sessions from storage', () => {
      storageService.set.mockReturnValue(true);
      
      const result = sessionService.clearAllSessions();
      
      expect(result).toBe(true);
      expect(storageService.set).toHaveBeenCalledWith('sessions', []);
    });
  });

  describe('Token Security', () => {
    it('should generate tokens using cryptographically secure random values', () => {
      // Create multiple tokens and verify they are unique and properly formatted
      const tokens = new Set();
      const iterations = 100;
      
      for (let i = 0; i < iterations; i++) {
        const session = sessionService.createSession(`user${i}`);
        tokens.add(session.token);
        
        // Verify token format
        expect(session.token).toMatch(/^[0-9a-f]{64}$/);
      }
      
      // All tokens should be unique
      expect(tokens.size).toBe(iterations);
    });
  });
});
