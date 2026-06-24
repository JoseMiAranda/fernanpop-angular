export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export class RateLimitError extends Error {
  constructor(
    public readonly retryAfterMs: number,
    public readonly action: 'send' | 'check',
  ) {
    super('rate-limit-exceeded');
    this.name = 'RateLimitError';
  }
}
