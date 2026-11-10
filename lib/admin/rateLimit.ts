export interface RateLimitStatus {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds?: number;
  error?: string;
}

interface AttemptRecord {
  failures: number[]; // timestamps of failed attempts (ms)
  lockedUntil?: number; // timestamp when lockout expires (ms)
}

/**
 * Enterprise in-memory sliding-window rate limiter for administrative authentication.
 * Designed with a clean interface so it can be swapped with Redis / Upstash in multi-instance production.
 */
class LoginRateLimiter {
  private attempts = new Map<string, AttemptRecord>();
  private readonly maxFailures: number = 5;
  private readonly windowMs: number = 15 * 60 * 1000; // 15-minute sliding window
  private readonly lockoutMs: number = 15 * 60 * 1000; // 15-minute lockout

  private normalizeKey(ip: string, email: string): string {
    const cleanIp = (ip || "127.0.0.1").trim();
    const cleanEmail = (email || "").trim().toLowerCase();
    return `${cleanIp}::${cleanEmail}`;
  }

  public check(ip: string, email: string): RateLimitStatus {
    const key = this.normalizeKey(ip, email);
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record) {
      return { allowed: true, remainingAttempts: this.maxFailures };
    }

    // Check if account is in active lockout
    if (record.lockedUntil && record.lockedUntil > now) {
      const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterSeconds,
        error: `Too many failed login attempts. Administrative access temporarily locked for ${Math.ceil(retryAfterSeconds / 60)} minutes.`,
      };
    }

    // Filter failures within sliding window
    const validFailures = record.failures.filter((ts) => now - ts < this.windowMs);
    record.failures = validFailures;
    record.lockedUntil = undefined;

    if (validFailures.length >= this.maxFailures) {
      record.lockedUntil = now + this.lockoutMs;
      const retryAfterSeconds = Math.ceil(this.lockoutMs / 1000);
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterSeconds,
        error: `Account temporarily locked due to excessive authentication failures. Please try again in 15 minutes.`,
      };
    }

    return {
      allowed: true,
      remainingAttempts: Math.max(0, this.maxFailures - validFailures.length),
    };
  }

  public recordFailure(ip: string, email: string): RateLimitStatus {
    const key = this.normalizeKey(ip, email);
    const now = Date.now();
    let record = this.attempts.get(key);

    if (!record) {
      record = { failures: [now] };
      this.attempts.set(key, record);
    } else {
      record.failures = record.failures.filter((ts) => now - ts < this.windowMs);
      record.failures.push(now);
    }

    if (record.failures.length >= this.maxFailures) {
      record.lockedUntil = now + this.lockoutMs;
      const retryAfterSeconds = Math.ceil(this.lockoutMs / 1000);
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterSeconds,
        error: `Too many failed login attempts. Access temporarily locked for 15 minutes.`,
      };
    }

    return {
      allowed: true,
      remainingAttempts: Math.max(0, this.maxFailures - record.failures.length),
    };
  }

  public recordSuccess(ip: string, email: string): void {
    const key = this.normalizeKey(ip, email);
    this.attempts.delete(key);
  }

  /**
   * Periodic garbage collection of expired keys to prevent memory leak
   */
  public prune(): void {
    const now = Date.now();
    for (const [key, record] of this.attempts.entries()) {
      if (record.lockedUntil && record.lockedUntil > now) continue;
      const valid = record.failures.filter((ts) => now - ts < this.windowMs);
      if (valid.length === 0) {
        this.attempts.delete(key);
      }
    }
  }

  public resetForTesting(): void {
    this.attempts.clear();
  }
}

// Global singleton instance
const loginRateLimiter = new LoginRateLimiter();

export function checkLoginRateLimit(ip: string, email: string): RateLimitStatus {
  return loginRateLimiter.check(ip, email);
}

export function recordLoginFailure(ip: string, email: string): RateLimitStatus {
  return loginRateLimiter.recordFailure(ip, email);
}

export function recordLoginSuccess(ip: string, email: string): void {
  loginRateLimiter.recordSuccess(ip, email);
}

export function resetRateLimiterForTesting(): void {
  loginRateLimiter.resetForTesting();
}
