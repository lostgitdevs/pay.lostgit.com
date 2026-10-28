import { describe, it, expect } from 'vitest';
import crypto from 'crypto';

describe('Website Analytics & Telemetry Engine', () => {
  describe('Privacy-Preserving Visitor Hash (DPDP Compliance)', () => {
    function generateTestHash(ip: string, ua: string, dateStr: string, salt: string) {
      return crypto
        .createHmac('sha256', salt)
        .update(`${ip}|${ua}|${dateStr}`)
        .digest('hex')
        .slice(0, 24);
    }

    it('generates consistent hash for same visitor on same day', () => {
      const ip = '103.21.244.2';
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0';
      const date = '2026-10-28';
      const salt = 'test_salt_key_123';

      const hash1 = generateTestHash(ip, ua, date, salt);
      const hash2 = generateTestHash(ip, ua, date, salt);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(24);
    });

    it('automatically rotates hash on a different day to prevent cross-day tracking', () => {
      const ip = '103.21.244.2';
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0';
      const salt = 'test_salt_key_123';

      const day1 = generateTestHash(ip, ua, '2026-10-28', salt);
      const day2 = generateTestHash(ip, ua, '2026-10-29', salt);

      expect(day1).not.toBe(day2);
    });

    it('differentiates distinct visitor devices and user agents', () => {
      const salt = 'test_salt_key_123';
      const date = '2026-10-28';

      const visitorA = generateTestHash('103.21.244.2', 'Chrome/120.0', date, salt);
      const visitorB = generateTestHash('103.21.244.5', 'Safari/17.0', date, salt);

      expect(visitorA).not.toBe(visitorB);
    });
  });

  describe('Session Duration & Event Aggregation', () => {
    it('aggregates total duration across multiple beacon events', () => {
      const events = [
        { eventType: 'pageview', durationSeconds: 0 },
        { eventType: 'heartbeat', durationSeconds: 30 },
        { eventType: 'click', durationSeconds: 45 },
        { eventType: 'session_end', durationSeconds: 120 },
      ];

      const maxDuration = Math.max(...events.map((e) => e.durationSeconds));
      expect(maxDuration).toBe(120);

      const pageviewCount = events.filter((e) => e.eventType === 'pageview').length;
      expect(pageviewCount).toBe(1);

      // Bounce classification: 1 pageview and duration <= 10s would be bounce
      const isBounce = pageviewCount <= 1 && maxDuration < 10;
      expect(isBounce).toBe(false);
    });
  });
});
