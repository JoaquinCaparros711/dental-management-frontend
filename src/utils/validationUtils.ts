/**
 * Validation utilities for form inputs and API payload sanitization.
 */

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export function validateEmail(email: string): ValidationResult {
  if (!email || !email.trim()) {
    return { isValid: false, errorMessage: 'Email address is required.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, errorMessage: 'Please enter a valid email address.' };
  }
  return { isValid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, errorMessage: 'Password is required.' };
  }
  if (password.length < 6) {
    return { isValid: false, errorMessage: 'Password must be at least 6 characters long.' };
  }
  return { isValid: true };
}

export function validateRequiredField(value: string, fieldName: string): ValidationResult {
  if (!value || !value.trim()) {
    return { isValid: false, errorMessage: `${fieldName} is required.` };
  }
  return { isValid: true };
}

export function validatePhone(phone: string): ValidationResult {
  if (!phone || !phone.trim()) {
    return { isValid: true }; // Phone is optional in some forms
  }
  const phoneRegex = /^[0-9+\s\-()]{6,20}$/;
  if (!phoneRegex.test(phone.trim())) {
    return { isValid: false, errorMessage: 'Please enter a valid phone number.' };
  }
  return { isValid: true };
}

export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input.trim().replace(/[<>]/g, '');
}
