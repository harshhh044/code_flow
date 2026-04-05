// Validation utilities

export const validators = {
  // Email validation
  email: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
      isValid: re.test(email),
      message: re.test(email) ? '' : 'Please enter a valid email address'
    };
  },

  // Password validation (min 8 chars, at least 1 uppercase, 1 lowercase, 1 number)
  password: (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) errors.push('at least 8 characters');
    if (!hasUpperCase) errors.push('one uppercase letter');
    if (!hasLowerCase) errors.push('one lowercase letter');
    if (!hasNumbers) errors.push('one number');
    if (!hasSpecialChar) errors.push('one special character');

    return {
      isValid: errors.length === 0,
      message: errors.length > 0 ? `Password must contain ${errors.join(', ')}` : '',
      strength: password.length < 8 ? 'weak' : 
                (hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar) ? 'strong' : 'medium'
    };
  },

  // Phone validation (Indian format)
  phone: (phone) => {
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    const cleaned = phone.replace(/\D/g, '');
    return {
      isValid: cleaned.length >= 10,
      message: cleaned.length >= 10 ? '' : 'Please enter a valid phone number'
    };
  },

  // Required field
  required: (value, fieldName = 'This field') => {
    const isValid = value !== null && value !== undefined && String(value).trim() !== '';
    return {
      isValid,
      message: isValid ? '' : `${fieldName} is required`
    };
  },

  // Minimum length
  minLength: (value, min, fieldName = 'This field') => {
    const isValid = String(value).length >= min;
    return {
      isValid,
      message: isValid ? '' : `${fieldName} must be at least ${min} characters`
    };
  },

  // Maximum length
  maxLength: (value, max, fieldName = 'This field') => {
    const isValid = String(value).length <= max;
    return {
      isValid,
      message: isValid ? '' : `${fieldName} must be no more than ${max} characters`
    };
  },

  // UID validation (alphanumeric)
  uid: (uid) => {
    const re = /^[a-zA-Z0-9]+$/;
    return {
      isValid: re.test(uid) && uid.length >= 4,
      message: re.test(uid) && uid.length >= 4 ? '' : 'UID must be at least 4 alphanumeric characters'
    };
  },

  // Date validation (not in future)
  pastDate: (date) => {
    const inputDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    return {
      isValid: inputDate <= today,
      message: inputDate <= today ? '' : 'Date cannot be in the future'
    };
  },

  // CAPTCHA validation
  captcha: (input, expected) => {
    const isValid = parseInt(input) === parseInt(expected);
    return {
      isValid,
      message: isValid ? '' : 'Incorrect answer, please try again'
    };
  },

  // File validation
  file: (file, maxSizeMB = 10, allowedTypes = []) => {
    if (!file) return { isValid: false, message: 'File is required' };

    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      return { isValid: false, message: `File size must be less than ${maxSizeMB}MB` };
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return { isValid: false, message: `File type not allowed. Allowed: ${allowedTypes.join(', ')}` };
    }

    return { isValid: true, message: '' };
  },

  // Validate grievance form
  grievanceForm: (data, isAnonymous = false) => {
    const errors = {};

    if (!isAnonymous) {
      // Personal info validation
      const nameCheck = validators.required(data.first_name, 'Full name');
      if (!nameCheck.isValid) errors.first_name = nameCheck.message;

      const uidCheck = validators.uid(data.student_id);
      if (!uidCheck.isValid) errors.student_id = uidCheck.message;

      const emailCheck = validators.email(data.email);
      if (!emailCheck.isValid) errors.email = emailCheck.message;

      const phoneCheck = validators.phone(data.phone);
      if (!phoneCheck.isValid) errors.phone = phoneCheck.message;
    }

    // Grievance details validation
    const categoryCheck = validators.required(data.category, 'Category');
    if (!categoryCheck.isValid) errors.category = categoryCheck.message;

    const descCheck = validators.minLength(data.description, 50, 'Description');
    if (!descCheck.isValid) errors.description = descCheck.message;

    const dateCheck = validators.pastDate(data.incident_date);
    if (!dateCheck.isValid) errors.incident_date = dateCheck.message;

    const resolutionCheck = validators.required(data.resolution_notes, 'Desired resolution');
    if (!resolutionCheck.isValid) errors.resolution_notes = resolutionCheck.message;

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Validate login form
  loginForm: (data) => {
    const errors = {};

    const emailCheck = validators.required(data.email, 'Email');
    if (!emailCheck.isValid) errors.email = emailCheck.message;

    const passwordCheck = validators.required(data.password, 'Password');
    if (!passwordCheck.isValid) errors.password = passwordCheck.message;

    const roleCheck = validators.required(data.role, 'Role');
    if (!roleCheck.isValid) errors.role = roleCheck.message;

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Validate registration form
  registerForm: (data) => {
    const errors = {};

    const nameCheck = validators.required(data.fullName, 'Full name');
    if (!nameCheck.isValid) errors.fullName = nameCheck.message;

    const emailCheck = validators.email(data.email);
    if (!emailCheck.isValid) errors.email = emailCheck.message;

    const passwordCheck = validators.password(data.password);
    if (!passwordCheck.isValid) errors.password = passwordCheck.message;

    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    const phoneCheck = validators.phone(data.phone);
    if (!phoneCheck.isValid) errors.phone = phoneCheck.message;

    const uidCheck = validators.uid(data.uid);
    if (!uidCheck.isValid) errors.uid = uidCheck.message;

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

// Quick validation helpers
export const isEmail = (email) => validators.email(email).isValid;
export const isPasswordStrong = (password) => validators.password(password).strength === 'strong';
export const isRequired = (value) => validators.required(value).isValid;

export default validators;