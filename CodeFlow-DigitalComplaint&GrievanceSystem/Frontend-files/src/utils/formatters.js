// Formatting utilities

export const formatters = {
  // Date formatting
  date: (date, format = 'medium') => {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const options = {
      short: { month: 'short', day: 'numeric' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { month: 'long', day: 'numeric', year: 'numeric' },
      full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
      time: { hour: '2-digit', minute: '2-digit' },
      datetime: { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    };

    return d.toLocaleDateString('en-US', options[format] || options.medium);
  },

  // Relative time (e.g., "2 hours ago")
  timeAgo: (date) => {
    if (!date) return '';
    
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
    
    return formatters.date(date, 'short');
  },

  // File size formatting
  fileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Number formatting
  number: (num, decimals = 0) => {
    if (num === null || num === undefined) return '';
    return Number(num).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  },

  // Currency formatting
  currency: (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  },

  // Phone number formatting (Indian)
  phone: (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    if (cleaned.length > 10) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
  },

  // Truncate text
  truncate: (text, length = 100, suffix = '...') => {
    if (!text || text.length <= length) return text;
    return text.substring(0, length).trim() + suffix;
  },

  // Capitalize first letter
  capitalize: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // Title case
  titleCase: (str) => {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },

  // Status badge color
  statusColor: (status) => {
    const colors = {
      'pending': 'yellow',
      'processing': 'blue',
      'in-progress': 'blue',
      'reviewed': 'purple',
      'resolved': 'green',
      'solved': 'green',
      'completed': 'green',
      'rejected': 'red',
      'cancelled': 'gray'
    };
    return colors[status?.toLowerCase()] || 'gray';
  },

  // Status label formatting
  statusLabel: (status) => {
    if (!status) return 'Unknown';
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  },

  // Category label formatting
  categoryLabel: (category) => {
    if (!category) return 'General';
    
    const labels = {
      'Academic': 'Academic Affairs',
      'Examination & Evaluations': 'Examination Department',
      'Administrative': 'Administrative Office',
      'Hostel Facilities': 'Hostel & Accommodation',
      'Library service': 'Library Services',
      'sports': 'Sports & Recreation',
      'Financial & others': 'Finance & Accounts',
      'IT & Digital service': 'IT & Technical Support',
      'security': 'Campus Security',
      'Transport & Community': 'Transportation',
      'canteen': 'Canteen & Food Services',
      'Placement & Career': 'Placement & Career',
      'Registrar office': 'Registrar Office',
      'Harassment/Ragging': 'Anti-Ragging Cell',
      'other': 'Other'
    };
    
    return labels[category] || category;
  }
};

// Quick export helpers
export const formatDate = formatters.date;
export const formatTimeAgo = formatters.timeAgo;
export const formatFileSize = formatters.fileSize;
export const formatNumber = formatters.number;
export const formatCurrency = formatters.currency;
export const formatPhone = formatters.phone;
export const truncateText = formatters.truncate;
export const capitalize = formatters.capitalize;

export default formatters;