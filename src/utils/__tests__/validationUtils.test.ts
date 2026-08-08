import {
  validateEmail,
  validatePassword,
  validateRequiredField,
  validatePhone,
  sanitizeInput,
} from '../validationUtils';

describe('validationUtils', () => {
  describe('validateEmail', () => {
    it('should return valid for correct email format', () => {
      // Arrange
      const validEmail = 'doctor@dental.com';

      // Act
      const result = validateEmail(validEmail);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    it('should return invalid for malformed email', () => {
      // Arrange
      const invalidEmail = 'doctor@dental';

      // Act
      const result = validateEmail(invalidEmail);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Please enter a valid email address.');
    });

    it('should return invalid for empty email', () => {
      // Act & Assert
      expect(validateEmail('').isValid).toBe(false);
      expect(validateEmail('   ').isValid).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should return valid if password length >= 6', () => {
      // Act & Assert
      expect(validatePassword('secret123').isValid).toBe(true);
    });

    it('should return invalid if password is too short', () => {
      // Act & Assert
      expect(validatePassword('12345').isValid).toBe(false);
    });
  });

  describe('validateRequiredField', () => {
    it('should pass when field has content', () => {
      // Act
      const result = validateRequiredField('John', 'First Name');

      // Assert
      expect(result.isValid).toBe(true);
    });

    it('should fail with custom field name when empty', () => {
      // Act
      const result = validateRequiredField('   ', 'First Name');

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('First Name is required.');
    });
  });

  describe('validatePhone', () => {
    it('should validate valid phone format', () => {
      expect(validatePhone('+54 9 11 1234-5678').isValid).toBe(true);
    });

    it('should reject invalid phone format', () => {
      expect(validatePhone('invalid_phone_number').isValid).toBe(false);
    });
  });


  describe('sanitizeInput', () => {
    it('should trim and remove HTML tags', () => {
      // Arrange
      const input = '  <script>alert("xss")</script> Hello  ';

      // Act
      const sanitized = sanitizeInput(input);

      // Assert
      expect(sanitized).toBe('scriptalert("xss")/script Hello');
    });
  });
});
