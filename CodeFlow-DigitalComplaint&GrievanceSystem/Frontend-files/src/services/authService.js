import api from './api';

/**
 * Detect common email domain typos and suggest corrections
 * (Keep this as client-side helper)
 */
const EMAIL_TYPO_MAP = {
  'gmal.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'yahooo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'yhoo.com': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  'outlok.com': 'outlook.com',
  'outllok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'outlook.co': 'outlook.com',
  'hotmal.com': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmail.co': 'hotmail.com',
};

export const detectEmailTypo = (email) => {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return { hasTypo: false, suggestion: '' };
  }

  const parts = email.split('@');
  if (parts.length !== 2) {
    return { hasTypo: false, suggestion: '' };
  }

  const [localPart, domain] = parts;
  const lowerDomain = domain.toLowerCase();

  if (EMAIL_TYPO_MAP[lowerDomain]) {
    return {
      hasTypo: true,
      suggestion: `${localPart}@${EMAIL_TYPO_MAP[lowerDomain]}`
    };
  }

  return { hasTypo: false, suggestion: '' };
};

export const authService = {
  /**
   * Login with backend API
   */
  login: async (email, password, role, uid) => {
    try {
      const response = await api.post('/auth/login', { email, password, role, uid });
      const { token, ...user } = response.data;

      // Store in localStorage for persistence
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(user));

      return { success: true, user, token };
    } catch (error) {
      // Suggest typo correction if applicable
      const typoCheck = detectEmailTypo(email);
      let errorMessage = error.response?.data?.error || 'Login failed. Please check your credentials.';

      if (typoCheck.hasTypo && errorMessage.includes('No account found')) {
        errorMessage = `Email not found. Did you mean "${typoCheck.suggestion}"?`;
      }

      return { success: false, error: errorMessage };
    }
  },

  /**
   * Register with backend API
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, ...user } = response.data;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(user));

      return { success: true, user, token };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed. Please try again.'
      };
    }
  },

  /**
   * Logout - clear local storage
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    return true;
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export default authService;