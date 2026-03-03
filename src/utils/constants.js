// Application constants

export const APP_NAME = 'Code Flow';
export const APP_VERSION = '1.0.0';

// Roles
export const ROLES = {
  STUDENT: 'student',
  ADMIN: 'Admin'
};

// Grievance statuses
export const GRIEVANCE_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  IN_PROGRESS: 'in-progress',
  REVIEWED: 'reviewed',
  RESOLVED: 'resolved',
  SOLVED: 'solved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

// Categories
export const CATEGORIES = [
  { value: 'Academic', label: 'Academic Affairs', icon: 'fa-graduation-cap' },
  { value: 'Examination & Evaluations', label: 'Examination Department', icon: 'fa-file-alt' },
  { value: 'Administrative', label: 'Administrative Office', icon: 'fa-building' },
  { value: 'Hostel Facilities', label: 'Hostel & Accommodation', icon: 'fa-bed' },
  { value: 'Library service', label: 'Library Services', icon: 'fa-book' },
  { value: 'sports', label: 'Sports & Recreation', icon: 'fa-running' },
  { value: 'Financial & others', label: 'Finance & Accounts', icon: 'fa-money-bill' },
  { value: 'IT & Digital service', label: 'IT & Technical Support', icon: 'fa-laptop' },
  { value: 'security', label: 'Campus Security', icon: 'fa-shield-alt' },
  { value: 'Transport & Community', label: 'Transportation', icon: 'fa-bus' },
  { value: 'canteen', label: 'Canteen & Food Services', icon: 'fa-utensils' },
  { value: 'Placement & Career', label: 'Placement & Career', icon: 'fa-briefcase' },
  { value: 'Registrar office', label: 'Registrar Office', icon: 'fa-university' },
  { value: 'Harassment/Ragging', label: 'Anti-Ragging Cell', icon: 'fa-exclamation-triangle', danger: true },
  { value: 'other', label: 'Other', icon: 'fa-question-circle' }
];

// Priority levels
export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// File upload config
export const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'video/mp4',
    'video/quicktime'
  ],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.pdf', '.mp4', '.mov']
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  OPTIONS: [10, 25, 50, 100]
};

// LocalStorage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  CURRENT_USER: 'currentUser',
  GRIEVANCE_DB: 'grievanceDatabase',
  ANON_GRIEVANCE_DB: 'anonymousGrievanceDatabase',
  CHECK_STATUS: 'checkStatusGrievances',
  NOTIFICATIONS: 'notifications',
  MAIL: 'mailDatabase',
  DRAFT: 'grievanceDraft',
  SETTINGS: 'userSettings',
  THEME: 'theme'
};

// Routes
export const ROUTES = {
  PUBLIC: {
    HOME: '/',
    ABOUT: '/about',
    CONTACT: '/contact',
    FAQS: '/faqs',
    LOGIN: '/login',
    REGISTER: '/register'
  },
  USER: {
    DASHBOARD: '/user',
    GRIEVANCES: '/user/grievances',
    SUBMIT: '/user/submit',
    STATUS: '/user/status',
    PROFILE: '/user/profile',
    MAIL: '/user/mail',
    NOTICES: '/user/notices',
    GUIDELINES: '/user/guidelines',
    INSIGHTS: '/user/insights'
  },
  ADMIN: {
    DASHBOARD: '/admin',
    GRIEVANCES: '/admin/grievances',
    USERS: '/admin/users',
    SETTINGS: '/admin/settings',
    ANALYTICS: '/admin/analytics'
  }
};

// Animation durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  PAGE_TRANSITION: 400
};

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.'
};

export default {
  APP_NAME,
  ROLES,
  GRIEVANCE_STATUS,
  CATEGORIES,
  PRIORITY,
  FILE_CONFIG,
  PAGINATION,
  STORAGE_KEYS,
  ROUTES,
  ANIMATION,
  ERROR_MESSAGES
};