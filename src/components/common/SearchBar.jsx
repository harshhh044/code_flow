import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({
  placeholder = "Search grievances, notices...",
  data = [],
  onSearch,
  className = '',
  id = 'global-search',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const filtered = data
      .filter(item => 
        item.title?.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5);

    setResults(filtered);
    setSelectedIndex(-1);
  }, [query, data]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  const handleSelect = (result) => {
    if (onSearch) {
      onSearch(result);
    } else if (result.url) {
      navigate(result.url);
    }
    setShowResults(false);
    setQuery('');
  };

  const getTypeColor = (type) => {
    const colors = {
      grievance: 'bg-blue-100 text-blue-700',
      notice: 'bg-amber-100 text-amber-700',
      guideline: 'bg-emerald-100 text-emerald-700',
      default: 'bg-gray-100 text-gray-700',
    };
    return colors[type] || colors.default;
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-blue-100 text-blue-900 px-1 rounded font-semibold">$1</mark>');
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input
          id={id}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => query && setShowResults(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
        />
      </div>

      {/* Results Dropdown */}
      {showResults && query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-[slideDown_0.2s_ease]">
          {results.length > 0 ? (
            results.map((result, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(result)}
                className={`w-full px-4 py-3 text-left transition-colors border-b border-gray-50 last:border-0 ${
                  idx === selectedIndex ? 'bg-blue-50' : 'hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span 
                    className="text-sm font-semibold text-gray-800"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightMatch(result.title, query) 
                    }}
                  />
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(result.type)}`}>
                    {result.type}
                  </span>
                </div>
                <p 
                  className="text-xs text-gray-500 truncate"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightMatch(result.description, query) 
                  }}
                />
              </button>
            ))
          ) : (
            <div className="p-4 text-sm text-center text-gray-500">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;