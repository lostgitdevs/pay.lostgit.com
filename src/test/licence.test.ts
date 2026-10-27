import { describe, it, expect } from 'vitest';
import {
  generateLicenceKey,
  isDomainAllowed,
  evaluateEntitlementStatus,
} from '../lib/licence';

describe('Licence & Entitlement Service', () => {
  describe('generateLicenceKey', () => {
    it('generates a valid formatted LGT key', () => {
      const key = generateLicenceKey();
      expect(key).toMatch(/^LGT-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/);
    });
  });

  describe('isDomainAllowed', () => {
    it('allows exact matches and localhost', () => {
      const allowed = ['clientapp.com', 'app.client.in'];
      expect(isDomainAllowed('clientapp.com', allowed)).toBe(true);
      expect(isDomainAllowed('localhost:3000', allowed)).toBe(true);
      expect(isDomainAllowed('unauthorized.com', allowed)).toBe(false);
    });

    it('supports wildcard subdomains', () => {
      const allowed = ['*.client.com'];
      expect(isDomainAllowed('portal.client.com', allowed)).toBe(true);
      expect(isDomainAllowed('api.client.com', allowed)).toBe(true);
      expect(isDomainAllowed('client.com', allowed)).toBe(true);
      expect(isDomainAllowed('otherdomain.com', allowed)).toBe(false);
    });

    it('allows all if allowed list is empty', () => {
      expect(isDomainAllowed('anydomain.org', [])).toBe(true);
    });
  });

  describe('evaluateEntitlementStatus', () => {
    const now = new Date('2026-10-28T00:00:00Z');

    it('returns active when within valid dates', () => {
      const res = evaluateEntitlementStatus({
        currentStatus: 'active',
        validUntil: '2026-12-31T23:59:59Z',
        gracePeriodUntil: '2027-01-07T23:59:59Z',
        currentTime: now,
      });

      expect(res.status).toBe('active');
      expect(res.valid).toBe(true);
    });

    it('returns grace_period and valid=true when within grace period', () => {
      const res = evaluateEntitlementStatus({
        currentStatus: 'active',
        validUntil: '2026-10-20T00:00:00Z', // expired 8 days ago
        gracePeriodUntil: '2026-10-31T00:00:00Z', // grace period active until end of month
        currentTime: now,
      });

      expect(res.status).toBe('grace_period');
      expect(res.valid).toBe(true);
    });

    it('returns expired and valid=false when grace period has elapsed', () => {
      const res = evaluateEntitlementStatus({
        currentStatus: 'active',
        validUntil: '2026-10-01T00:00:00Z',
        gracePeriodUntil: '2026-10-08T00:00:00Z',
        currentTime: now,
      });

      expect(res.status).toBe('expired');
      expect(res.valid).toBe(false);
    });

    it('returns revoked if explicitly revoked in database', () => {
      const res = evaluateEntitlementStatus({
        currentStatus: 'revoked',
        validUntil: '2027-01-01T00:00:00Z',
        gracePeriodUntil: null,
        currentTime: now,
      });

      expect(res.status).toBe('revoked');
      expect(res.valid).toBe(false);
    });
  });
});
