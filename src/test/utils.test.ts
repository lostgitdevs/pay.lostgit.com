import { describe, it, expect } from 'vitest';
import { formatCurrency, timeSafeEqual, slugify, generateSecureToken } from '../lib/utils';

describe('Utility functions', () => {
  describe('formatCurrency', () => {
    it('formats paise correctly into INR string', () => {
      expect(formatCurrency(100000)).toContain('1,000.00');
      expect(formatCurrency(50)).toContain('0.50');
      expect(formatCurrency(0)).toContain('0.00');
    });
  });

  describe('timeSafeEqual', () => {
    it('compares matching strings in constant time', () => {
      expect(timeSafeEqual('secret_token_123', 'secret_token_123')).toBe(true);
    });

    it('rejects mismatching strings safely', () => {
      expect(timeSafeEqual('secret_token_123', 'secret_token_456')).toBe(false);
      expect(timeSafeEqual('short', 'longer_string')).toBe(false);
    });
  });

  describe('generateSecureToken', () => {
    it('generates a hex token of expected character length', () => {
      const token = generateSecureToken(32);
      expect(token).toHaveLength(64);
      expect(/^[0-9a-f]+$/.test(token)).toBe(true);
    });
  });

  describe('slugify', () => {
    it('converts string to url-friendly slug', () => {
      expect(slugify('LostGit Solutions Pay Project!')).toBe('lostgit-solutions-pay-project');
    });
  });
});
