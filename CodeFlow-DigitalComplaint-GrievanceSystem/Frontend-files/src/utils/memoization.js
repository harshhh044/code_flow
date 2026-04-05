/**
 * Memoization utility for expensive filtering operations
 * Requirement 9.2, 9.3: Optimize data filtering with memoization
 */

// Simple memoization cache with TTL
const cache = new Map();
const cacheTTL = 5000; // 5 seconds TTL

/**
 * Generate a cache key from arguments
 * @param {Array} args - Arguments to generate key from
 * @returns {string} - Cache key
 */
const generateKey = (args) => {
  return JSON.stringify(args);
};

/**
 * Memoize a function with TTL-based cache
 * @param {Function} fn - Function to memoize
 * @param {number} ttl - Time to live in milliseconds (default: 5000)
 * @returns {Function} - Memoized function
 */
export const memoize = (fn, ttl = cacheTTL) => {
  return function (...args) {
    const key = generateKey(args);
    const now = Date.now();

    // Check if we have a cached result
    if (cache.has(key)) {
      const { value, timestamp } = cache.get(key);

      // Return cached value if not expired
      if (now - timestamp < ttl) {
        return value;
      }

      // Remove expired entry
      cache.delete(key);
    }

    // Compute new value
    const result = fn.apply(this, args);

    // Store in cache
    cache.set(key, {
      value: result,
      timestamp: now
    });

    return result;
  };
};

/**
 * Clear the memoization cache
 */
export const clearMemoCache = () => {
  cache.clear();
};

/**
 * Get cache statistics
 */
export const getMemoStats = () => {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  };
};

/**
 * Memoized filter function for arrays
 * Optimized for filtering large datasets (Requirement 9.2)
 * @param {Array} data - Data to filter
 * @param {Function} predicate - Filter predicate function
 * @param {string} cacheKey - Unique key for caching this filter operation
 * @returns {Array} - Filtered data
 */
export const memoizedFilter = (() => {
  const filterCache = new Map();
  const FILTER_TTL = 3000;

  return (data, predicate, cacheKey = '') => {
    const key = cacheKey || `filter_${data.length}`;
    const now = Date.now();

    if (filterCache.has(key)) {
      const { value, timestamp } = filterCache.get(key);
      if (now - timestamp < FILTER_TTL) {
        return value;
      }
      filterCache.delete(key);
    }

    const result = data.filter(predicate);
    filterCache.set(key, { value: result, timestamp: now });
    return result;
  };
})();

/**
 * Optimized search function with early termination
 * Requirement 9.2: Complete operations within 200ms for 1000 items
 * @param {Array} data - Data to search
 * @param {string} searchTerm - Search term
 * @param {Array} fields - Fields to search in
 * @returns {Array} - Matching items
 */
export const optimizedSearch = (data, searchTerm, fields) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return data;
  }

  const lowerSearch = searchTerm.toLowerCase();
  const results = [];

  // Use for loop for better performance than forEach
  for (let i = 0; i < data.length; i++) {
    const item = data[i];

    // Early termination if we find a match
    for (let j = 0; j < fields.length; j++) {
      const field = fields[j];
      const value = item[field];

      if (value && String(value).toLowerCase().includes(lowerSearch)) {
        results.push(item);
        break; // Move to next item once we find a match
      }
    }
  }

  return results;
};

/**
 * Batch filter function for multiple conditions
 * Requirement 9.2: Optimize filtering operations
 * @param {Array} data - Data to filter
 * @param {Array} conditions - Array of filter conditions
 * @returns {Array} - Filtered data
 */
export const batchFilter = (data, conditions) => {
  if (!conditions || conditions.length === 0) {
    return data;
  }

  return data.filter(item => {
    // All conditions must pass (AND logic)
    for (let i = 0; i < conditions.length; i++) {
      if (!conditions[i](item)) {
        return false; // Early return on first failed condition
      }
    }
    return true;
  });
};

export default {
  memoize,
  clearMemoCache,
  getMemoStats,
  memoizedFilter,
  optimizedSearch,
  batchFilter
};
