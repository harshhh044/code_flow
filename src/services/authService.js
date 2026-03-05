import { useState, useMemo, useCallback } from 'react';

export const useSearch = (items, searchFields) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});

  const filteredItems = useMemo(() => {
    if (!query.trim() && Object.keys(filters).length === 0) {
      return items;
    }

    return items.filter(item => {
      // Text search
      const matchesQuery = !query.trim() || searchFields.some(field => {
        const value = getNestedValue(item, field);
        return value && String(value).toLowerCase().includes(query.toLowerCase());
      });

      // Filter match
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const itemValue = getNestedValue(item, key);
        return String(itemValue).toLowerCase() === String(value).toLowerCase();
      });

      return matchesQuery && matchesFilters;
    });
  }, [items, query, filters, searchFields]);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setQuery('');
  }, []);

  return {
    query,
    setQuery,
    filters,
    updateFilter,
    clearFilters,
    results: filteredItems,
    hasResults: filteredItems.length > 0,
    resultCount: filteredItems.length
  };
};

// Helper to get nested object values
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Hook for debounced search
export const useDebouncedSearch = (delay = 300) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useState(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  return {
    query,
    setQuery,
    debouncedQuery
  };
};

// Hook for search history
export const useSearchHistory = (key, maxItems = 10) => {
  const [history, setHistory] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  });

  const addToHistory = useCallback((term) => {
    if (!term.trim()) return;
    
    setHistory(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== term.toLowerCase());
      const updated = [term, ...filtered].slice(0, maxItems);
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
    });
  }, [key, maxItems]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(key);
  }, [key]);

  const removeFromHistory = useCallback((term) => {
    setHistory(prev => {
      const updated = prev.filter(item => item !== term);
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
    });
  }, [key]);

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory
  };
};

export default useSearch;