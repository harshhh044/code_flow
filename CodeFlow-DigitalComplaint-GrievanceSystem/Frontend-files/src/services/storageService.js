// Storage Service - Wrapper around localStorage with error handling

export const storageService = {
  // Set item with error handling
  set: (key, value) => {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  },

  // Get item with error handling
  get: (key, defaultValue = null) => {
    try {
      const serialized = localStorage.getItem(key);
      if (serialized === null) return defaultValue;
      return JSON.parse(serialized);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },

  // Remove item
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },

  // Clear all (use with caution)
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },

  // Check if key exists
  has: (key) => {
    return localStorage.getItem(key) !== null;
  },

  // Get all keys with prefix
  getKeysWithPrefix: (prefix) => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }
    return keys;
  },

  // Get storage usage
  getUsage: () => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length * 2; // UTF-16 encoding
      }
    }
    return {
      used: total,
      usedMB: (total / 1024 / 1024).toFixed(2),
      limit: 5 * 1024 * 1024, // Typical 5MB limit
      percent: ((total / (5 * 1024 * 1024)) * 100).toFixed(2)
    };
  },

  // Export all data
  export: () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        data[key] = storageService.get(key);
      }
    }
    return data;
  },

  // Import data
  import: (data, merge = false) => {
    if (!merge) {
      localStorage.clear();
    }
    Object.entries(data).forEach(([key, value]) => {
      storageService.set(key, value);
    });
  }
};

export default storageService;