import { isValidPort } from '../src/utils/validation';

describe('Utility Functions', () => {
  describe('isValidPort', () => {
    it('should return true for valid port numbers', () => {
      expect(isValidPort(1)).toBe(true);
      expect(isValidPort(8080)).toBe(true);
      expect(isValidPort(65535)).toBe(true);
    });

    it('should return false for invalid port numbers', () => {
      expect(isValidPort(0)).toBe(false);
      expect(isValidPort(65536)).toBe(false);
      expect(isValidPort(-1)).toBe(false);
      expect(isValidPort(8080.5)).toBe(false);
    });
  });
});
