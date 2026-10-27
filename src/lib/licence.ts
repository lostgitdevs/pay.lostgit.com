import crypto from 'crypto';

export interface LicenceVerificationResult {
  valid: boolean;
  status: 'active' | 'grace_period' | 'pending_review' | 'suspended' | 'expired' | 'revoked';
  projectName?: string;
  clientName?: string;
  allowedDomains: string[];
  validUntil: string | null;
  gracePeriodUntil: string | null;
  message: string;
}

/**
 * Generates a high-entropy formatted licence key:
 * e.g., LGT-A8F2-99CD-E104-762B
 */
export function generateLicenceKey(): string {
  const bytes = crypto.randomBytes(10);
  const hex = bytes.toString('hex').toUpperCase();
  const parts = [
    'LGT',
    hex.slice(0, 4),
    hex.slice(4, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
  ];
  return parts.join('-');
}

/**
 * Validates domain match against allowed domains array.
 * Supports wildcards (e.g. *.lostgit.com matches client.lostgit.com) and localhost.
 */
export function isDomainAllowed(requestDomain: string, allowedDomains: string[]): boolean {
  if (!allowedDomains || allowedDomains.length === 0) {
    return true; // No domain restrictions configured
  }

  const cleanDomain = requestDomain.toLowerCase().trim().replace(/:\d+$/, ''); // strip port

  // Always allow localhost in dev
  if (cleanDomain === 'localhost' || cleanDomain === '127.0.0.1') {
    return true;
  }

  for (const pattern of allowedDomains) {
    const cleanPattern = pattern.toLowerCase().trim();
    if (cleanPattern === cleanDomain) {
      return true;
    }
    // Wildcard match
    if (cleanPattern.startsWith('*.')) {
      const baseDomain = cleanPattern.slice(2);
      if (cleanDomain.endsWith(baseDomain)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Determines entitlement status based on timestamps and explicit database status.
 */
export function evaluateEntitlementStatus({
  currentStatus,
  validUntil,
  gracePeriodUntil,
  currentTime = new Date(),
}: {
  currentStatus: string;
  validUntil: string | null;
  gracePeriodUntil: string | null;
  currentTime?: Date;
}): { status: 'active' | 'grace_period' | 'pending_review' | 'suspended' | 'expired' | 'revoked'; valid: boolean } {
  // If explicitly revoked or suspended
  if (currentStatus === 'revoked') {
    return { status: 'revoked', valid: false };
  }
  if (currentStatus === 'suspended') {
    return { status: 'suspended', valid: false };
  }

  // Check validity dates
  if (validUntil) {
    const validDate = new Date(validUntil);
    if (currentTime > validDate) {
      // Past valid date — check grace period
      if (gracePeriodUntil) {
        const graceDate = new Date(gracePeriodUntil);
        if (currentTime <= graceDate) {
          return { status: 'grace_period', valid: true };
        }
      }
      return { status: 'expired', valid: false };
    }
  }

  return { status: 'active', valid: true };
}
