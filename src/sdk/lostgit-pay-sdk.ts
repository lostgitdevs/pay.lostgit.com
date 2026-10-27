/**
 * LostGit Pay Entitlement SDK
 * Lightweight TypeScript SDK for client software and web applications
 * to verify their licence and payment status with pay.lostgit.com.
 */

export interface LostGitPayConfig {
  licenceKey: string;
  endpoint?: string;
  domain?: string;
  cacheTtlMs?: number;
}

export interface EntitlementResponse {
  valid: boolean;
  status: 'active' | 'grace_period' | 'pending_review' | 'suspended' | 'expired' | 'revoked';
  projectName?: string;
  clientName?: string;
  allowedDomains?: string[];
  validUntil?: string | null;
  gracePeriodUntil?: string | null;
  message: string;
  cached?: boolean;
}

export class LostGitPayClient {
  private licenceKey: string;
  private endpoint: string;
  private domain?: string;
  private cacheTtlMs: number;
  private lastVerification: { response: EntitlementResponse; timestamp: number } | null = null;

  constructor(config: LostGitPayConfig) {
    if (!config.licenceKey) {
      throw new Error('LostGitPayClient: licenceKey is required');
    }
    this.licenceKey = config.licenceKey;
    this.endpoint = (config.endpoint || 'https://pay.lostgit.com').replace(/\/$/, '');
    this.domain = config.domain;
    this.cacheTtlMs = config.cacheTtlMs ?? 1000 * 60 * 60; // 1 hour default
  }

  /**
   * Verifies current licence entitlement status.
   * Returns cached result if within TTL to avoid blocking high-traffic requests.
   */
  async verifyEntitlement(forceRefresh: boolean = false): Promise<EntitlementResponse> {
    const now = Date.now();

    if (!forceRefresh && this.lastVerification) {
      if (now - this.lastVerification.timestamp < this.cacheTtlMs) {
        return {
          ...this.lastVerification.response,
          cached: true,
        };
      }
    }

    try {
      const url = `${this.endpoint}/api/v1/licence/verify`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'LostGitPay-SDK/1.0',
        },
        body: JSON.stringify({
          licenceKey: this.licenceKey,
          domain: this.domain,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          valid: false,
          status: 'suspended',
          message: errorData.error || `Verification failed with HTTP ${response.status}`,
        };
      }

      const data: EntitlementResponse = await response.json();
      this.lastVerification = { response: data, timestamp: now };
      return data;
    } catch (err: any) {
      // In case of network timeout, if we had a previously valid state, allow grace
      if (this.lastVerification && this.lastVerification.response.valid) {
        return {
          ...this.lastVerification.response,
          message: 'Network offline. Using cached verification.',
          cached: true,
        };
      }

      return {
        valid: false,
        status: 'suspended',
        message: err.message || 'Network error verifying licence',
      };
    }
  }
}
