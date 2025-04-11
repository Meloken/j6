import {
  isValidEmail,
  isStrongPassword,
  isValidUsername,
  isValidUrl,
  isEmpty,
  minLength,
  maxLength,
  isEqual,
  isNumber,
  isInteger,
  isPositive,
  isNegative,
  isInRange,
} from '../../src/utils/validation';

describe('Validation Utils', () => {
  describe('isValidEmail', () => {
    it('returns true for valid email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('test.name@example.co.uk')).toBe(true);
      expect(isValidEmail('test+label@example.com')).toBe(true);
    });
    
    it('returns false for invalid email addresses', () => {
      expect(isValidEmail('test')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test@example')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });
  
  describe('isStrongPassword', () => {
    it('returns true for strong passwords', () => {
      expect(isStrongPassword('Abc123')).toBe(true);
      expect(isStrongPassword('StrongP4ssword')).toBe(true);
      expect(isStrongPassword('P4ssw0rd!')).toBe(true);
    });
    
    it('returns false for weak passwords', () => {
      expect(isStrongPassword('abc123')).toBe(false); // No uppercase
      expect(isStrongPassword('ABC123')).toBe(false); // No lowercase
      expect(isStrongPassword('Abcdef')).toBe(false); // No number
      expect(isStrongPassword('Ab1')).toBe(false); // Too short
      expect(isStrongPassword('')).toBe(false);
    });
  });
  
  describe('isValidUsername', () => {
    it('returns true for valid usernames', () => {
      expect(isValidUsername('user123')).toBe(true);
      expect(isValidUsername('user_name')).toBe(true);
      expect(isValidUsername('user.name')).toBe(true);
      expect(isValidUsername('User123')).toBe(true);
    });
    
    it('returns false for invalid usernames', () => {
      expect(isValidUsername('us')).toBe(false); // Too short
      expect(isValidUsername('user name')).toBe(false); // Contains space
      expect(isValidUsername('user@name')).toBe(false); // Contains @
      expect(isValidUsername('user-name')).toBe(false); // Contains -
      expect(isValidUsername('user#name')).toBe(false); // Contains #
      expect(isValidUsername('a'.repeat(21))).toBe(false); // Too long
      expect(isValidUsername('')).toBe(false);
    });
  });
  
  describe('isValidUrl', () => {
    it('returns true for valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://www.example.com/path')).toBe(true);
      expect(isValidUrl('https://example.com:8080')).toBe(true);
    });
    
    it('returns false for invalid URLs', () => {
      expect(isValidUrl('example.com')).toBe(false);
      expect(isValidUrl('www.example.com')).toBe(false);
      expect(isValidUrl('http:/example.com')).toBe(false);
      expect(isValidUrl('https://')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });
  
  describe('isEmpty', () => {
    it('returns true for empty values', () => {
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('  ')).toBe(true);
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
    });
    
    it('returns false for non-empty values', () => {
      expect(isEmpty('text')).toBe(false);
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(false)).toBe(false);
      expect(isEmpty([1, 2, 3])).toBe(false);
      expect(isEmpty({ key: 'value' })).toBe(false);
    });
  });
  
  describe('minLength', () => {
    it('returns true if string length is greater than or equal to minLength', () => {
      expect(minLength('abc', 3)).toBe(true);
      expect(minLength('abcd', 3)).toBe(true);
      expect(minLength('abcde', 3)).toBe(true);
    });
    
    it('returns false if string length is less than minLength', () => {
      expect(minLength('a', 3)).toBe(false);
      expect(minLength('ab', 3)).toBe(false);
      expect(minLength('', 3)).toBe(false);
    });
  });
  
  describe('maxLength', () => {
    it('returns true if string length is less than or equal to maxLength', () => {
      expect(maxLength('a', 3)).toBe(true);
      expect(maxLength('ab', 3)).toBe(true);
      expect(maxLength('abc', 3)).toBe(true);
    });
    
    it('returns false if string length is greater than maxLength', () => {
      expect(maxLength('abcd', 3)).toBe(false);
      expect(maxLength('abcde', 3)).toBe(false);
    });
  });
  
  describe('isEqual', () => {
    it('returns true if values are equal', () => {
      expect(isEqual('abc', 'abc')).toBe(true);
      expect(isEqual(123, 123)).toBe(true);
      expect(isEqual(true, true)).toBe(true);
      expect(isEqual(null, null)).toBe(true);
      expect(isEqual(undefined, undefined)).toBe(true);
    });
    
    it('returns false if values are not equal', () => {
      expect(isEqual('abc', 'def')).toBe(false);
      expect(isEqual(123, 456)).toBe(false);
      expect(isEqual(true, false)).toBe(false);
      expect(isEqual(null, undefined)).toBe(false);
      expect(isEqual({}, {})).toBe(false); // Objects are compared by reference
      expect(isEqual([], [])).toBe(false); // Arrays are compared by reference
    });
  });
  
  describe('isNumber', () => {
    it('returns true for numbers', () => {
      expect(isNumber(123)).toBe(true);
      expect(isNumber(0)).toBe(true);
      expect(isNumber(-123)).toBe(true);
      expect(isNumber(123.45)).toBe(true);
      expect(isNumber('123')).toBe(true);
      expect(isNumber('123.45')).toBe(true);
    });
    
    it('returns false for non-numbers', () => {
      expect(isNumber('abc')).toBe(false);
      expect(isNumber('123abc')).toBe(false);
      expect(isNumber({})).toBe(false);
      expect(isNumber([])).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
      expect(isNumber(NaN)).toBe(false);
    });
  });
  
  describe('isInteger', () => {
    it('returns true for integers', () => {
      expect(isInteger(123)).toBe(true);
      expect(isInteger(0)).toBe(true);
      expect(isInteger(-123)).toBe(true);
      expect(isInteger('123')).toBe(true);
      expect(isInteger('-123')).toBe(true);
    });
    
    it('returns false for non-integers', () => {
      expect(isInteger(123.45)).toBe(false);
      expect(isInteger('123.45')).toBe(false);
      expect(isInteger('abc')).toBe(false);
      expect(isInteger('123abc')).toBe(false);
      expect(isInteger({})).toBe(false);
      expect(isInteger([])).toBe(false);
      expect(isInteger(null)).toBe(false);
      expect(isInteger(undefined)).toBe(false);
      expect(isInteger(NaN)).toBe(false);
    });
  });
  
  describe('isPositive', () => {
    it('returns true for positive numbers', () => {
      expect(isPositive(123)).toBe(true);
      expect(isPositive(0.1)).toBe(true);
    });
    
    it('returns false for non-positive numbers', () => {
      expect(isPositive(0)).toBe(false);
      expect(isPositive(-123)).toBe(false);
      expect(isPositive(-0.1)).toBe(false);
    });
  });
  
  describe('isNegative', () => {
    it('returns true for negative numbers', () => {
      expect(isNegative(-123)).toBe(true);
      expect(isNegative(-0.1)).toBe(true);
    });
    
    it('returns false for non-negative numbers', () => {
      expect(isNegative(0)).toBe(false);
      expect(isNegative(123)).toBe(false);
      expect(isNegative(0.1)).toBe(false);
    });
  });
  
  describe('isInRange', () => {
    it('returns true for numbers in range', () => {
      expect(isInRange(5, 1, 10)).toBe(true);
      expect(isInRange(1, 1, 10)).toBe(true);
      expect(isInRange(10, 1, 10)).toBe(true);
    });
    
    it('returns false for numbers out of range', () => {
      expect(isInRange(0, 1, 10)).toBe(false);
      expect(isInRange(11, 1, 10)).toBe(false);
    });
  });
});
