/**
 * @fileoverview Input validation utilities for CivicTrack
 * Provides validation functions for forms, API inputs, and user data
 */

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns ValidationResult with validation status and errors
 */
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please enter a valid email address');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates password strength
 * @param password - Password string to validate
 * @returns ValidationResult with validation status and errors
 */
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates phone number format
 * @param phone - Phone number string to validate
 * @returns ValidationResult with validation status and errors
 */
export const validatePhone = (phone: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!phone) {
    errors.push('Phone number is required');
  } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
    errors.push('Phone number must be 10 digits');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates issue title
 * @param title - Issue title to validate
 * @returns ValidationResult with validation status and errors
 */
export const validateIssueTitle = (title: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!title) {
    errors.push('Title is required');
  } else if (title.length < 10) {
    errors.push('Title must be at least 10 characters long');
  } else if (title.length > 500) {
    errors.push('Title cannot exceed 500 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates issue description
 * @param description - Issue description to validate
 * @returns ValidationResult with validation status and errors
 */
export const validateIssueDescription = (description: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!description) {
    errors.push('Description is required');
  } else if (description.length < 20) {
    errors.push('Description must be at least 20 characters long');
  } else if (description.length > 2000) {
    errors.push('Description cannot exceed 2000 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates coordinates
 * @param latitude - Latitude value
 * @param longitude - Longitude value
 * @returns ValidationResult with validation status and errors
 */
export const validateCoordinates = (latitude: number, longitude: number): ValidationResult => {
  const errors: string[] = [];
  
  if (latitude === undefined || latitude === null) {
    errors.push('Latitude is required');
  } else if (latitude < -90 || latitude > 90) {
    errors.push('Latitude must be between -90 and 90');
  }
  
  if (longitude === undefined || longitude === null) {
    errors.push('Longitude is required');
  } else if (longitude < -180 || longitude > 180) {
    errors.push('Longitude must be between -180 and 180');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates file upload
 * @param file - File object to validate
 * @returns ValidationResult with validation status and errors
 */
export const validateImageFile = (file: File): ValidationResult => {
  const errors: string[] = [];
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!file) {
    errors.push('File is required');
  } else {
    if (file.size > maxSize) {
      errors.push('File size must be less than 5MB');
    }
    
    if (!allowedTypes.includes(file.type)) {
      errors.push('File must be a valid image (JPEG, PNG, WebP)');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitizes HTML input to prevent XSS attacks
 * @param input - Raw HTML string
 * @returns Sanitized string
 */
export const sanitizeHtml = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validates and sanitizes form data
 * @param data - Raw form data object
 * @returns Validated and sanitized data with validation results
 */
export const validateFormData = (data: Record<string, any>): {
  sanitizedData: Record<string, any>;
  validationResults: Record<string, ValidationResult>;
  isValid: boolean;
} => {
  const sanitizedData: Record<string, any> = {};
  const validationResults: Record<string, ValidationResult> = {};
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    // Sanitize string values
    if (typeof value === 'string') {
      sanitizedData[key] = sanitizeHtml(value.trim());
    } else {
      sanitizedData[key] = value;
    }
    
    // Add specific validation based on field name
    switch (key) {
      case 'email':
        validationResults[key] = validateEmail(sanitizedData[key]);
        break;
      case 'password':
        validationResults[key] = validatePassword(sanitizedData[key]);
        break;
      case 'phone':
        validationResults[key] = validatePhone(sanitizedData[key]);
        break;
      case 'title':
        validationResults[key] = validateIssueTitle(sanitizedData[key]);
        break;
      case 'description':
        validationResults[key] = validateIssueDescription(sanitizedData[key]);
        break;
      default:
        validationResults[key] = { isValid: true, errors: [] };
    }
  });
  
  const isValid = Object.values(validationResults).every(result => result.isValid);
  
  return {
    sanitizedData,
    validationResults,
    isValid
  };
};
