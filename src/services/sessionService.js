import { storageService } from './storageService';
import { userService } from './userService';

const SESSIONS_KEY = 'sessions';
const SESSION_EXPIRATION_HOURS = 24;

/**
 * SessionService - Manages secure user sessions with token-based authentication
 * 
 * Session structure: {
 *   userId: string,
 *   token: string,
 *   loginTime: ISO timestamp,
 *   expiresAt: ISO timestamp
 * }
 */
export const sessionService = {
  /**
   * Generate a cryptographically secure random token
   * @returns {string} Secure random token
   */
  _generateSecureToken: () => {
    // Use crypto.getRandomValues for cryptographically secure random generation
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    // Convert to hex string
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Create a new session for a user
   * @param {string} userId - The user's ID or email
   * @returns {Object} Session object with token and expiration
   */
  createSession: (userId) => {
    const token = sessionService._generateSecureToken();
    const loginTime = new Date().toISOString();
    const expiresAt = new Date(Date.now() + SESSION_EXPIRATION_HOURS * 60 * 60 * 1000).toISOString();

    const session = {
      userId,
      token,
      loginTime,
      expiresAt
    };

    // Get all sessions
    const sessions = storageService.get(SESSIONS_KEY, []);
    
    // Add new session
    sessions.push(session);
    
    // Save sessions
    storageService.set(SESSIONS_KEY, sessions);

    return session;
  },

  /**
   * Validate a session token
   * @param {string} token - The session token to validate
   * @returns {Object|null} Session object if valid, null otherwise
   */
  validateSession: (token) => {
    if (!token) {
      return null;
    }

    const sessions = storageService.get(SESSIONS_KEY, []);
    const session = sessions.find(s => s.token === token);

    if (!session) {
      return null;
    }

    // Check if session has expired
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    
    if (now > expiresAt) {
      // Session expired, remove it
      sessionService.invalidateSession(token);
      return null;
    }

    // Check user status
    const user = userService.getUserById(session.userId);
    
    if (!user) {
      // User not found, invalidate session
      sessionService.invalidateSession(token);
      return null;
    }

    // Check if user is active
    if (user.status && user.status !== 'active') {
      // User is blocked, restricted, or removed - invalidate session
      sessionService.invalidateSession(token);
      return null;
    }

    return session;
  },

  /**
   * Invalidate a specific session (logout)
   * @param {string} token - The session token to invalidate
   * @returns {boolean} True if session was found and removed
   */
  invalidateSession: (token) => {
    if (!token) {
      return false;
    }

    const sessions = storageService.get(SESSIONS_KEY, []);
    const filteredSessions = sessions.filter(s => s.token !== token);
    
    const wasRemoved = filteredSessions.length < sessions.length;
    
    if (wasRemoved) {
      storageService.set(SESSIONS_KEY, filteredSessions);
    }

    return wasRemoved;
  },

  /**
   * Invalidate all sessions for a specific user (admin action)
   * @param {string} userId - The user's ID or email
   * @returns {number} Number of sessions invalidated
   */
  invalidateAllUserSessions: (userId) => {
    if (!userId) {
      return 0;
    }

    const sessions = storageService.get(SESSIONS_KEY, []);
    const userSessions = sessions.filter(s => s.userId === userId);
    const remainingSessions = sessions.filter(s => s.userId !== userId);
    
    const removedCount = userSessions.length;
    
    if (removedCount > 0) {
      storageService.set(SESSIONS_KEY, remainingSessions);
    }

    return removedCount;
  },

  /**
   * Get all active sessions (for debugging/admin purposes)
   * @returns {Array} Array of all sessions
   */
  getAllSessions: () => {
    return storageService.get(SESSIONS_KEY, []);
  },

  /**
   * Clear all sessions (for data cleanup)
   * @returns {boolean} True if successful
   */
  clearAllSessions: () => {
    return storageService.set(SESSIONS_KEY, []);
  }
};

export default sessionService;
