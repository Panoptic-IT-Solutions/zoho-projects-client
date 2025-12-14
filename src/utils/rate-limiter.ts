import Bottleneck from "bottleneck";

/**
 * Configuration for rate limiting
 */
export interface RateLimiterConfig {
  /**
   * Redis configuration for distributed rate limiting
   * If not provided, uses in-memory limiting (single instance only)
   */
  redis?: {
    url: string;
  };
}

/**
 * Zoho Projects API rate limits:
 * - 100 requests per 2 minutes (per user/org)
 * - 429 response triggers 30-minute lockout
 */
const ZOHO_RATE_LIMIT = {
  /** Maximum requests in the time window */
  maxRequests: 100,
  /** Time window in milliseconds (2 minutes) */
  windowMs: 2 * 60 * 1000,
  /** Safety margin - we use 90 requests to avoid hitting the exact limit */
  safeMaxRequests: 90,
  /** Minimum time between requests in milliseconds (~1.3s for safety) */
  minTime: 1300,
  /** Maximum concurrent requests */
  maxConcurrent: 5,
  /** Lockout duration when rate limited (30 minutes) */
  lockoutMs: 30 * 60 * 1000,
};

/**
 * Create a rate limiter for Zoho Projects API
 *
 * Uses Bottleneck's reservoir pattern to enforce:
 * - Max 90 requests per 2 minutes (with 10 request safety margin)
 * - Min 1.3s between requests
 * - Max 5 concurrent requests
 *
 * Handles 429 responses by pausing for 30-minute lockout
 */
export function createRateLimiter(config?: RateLimiterConfig): Bottleneck {
  const limiterOptions: Bottleneck.ConstructorOptions = {
    // Reservoir pattern for request budget
    reservoir: ZOHO_RATE_LIMIT.safeMaxRequests,
    reservoirRefreshAmount: ZOHO_RATE_LIMIT.safeMaxRequests,
    reservoirRefreshInterval: ZOHO_RATE_LIMIT.windowMs,

    // Concurrency controls
    maxConcurrent: ZOHO_RATE_LIMIT.maxConcurrent,
    minTime: ZOHO_RATE_LIMIT.minTime,
  };

  // Add Redis clustering if configured
  if (config?.redis) {
    const redisConnection = new Bottleneck.IORedisConnection({
      client: createRedisClient(config.redis.url),
    });

    return new Bottleneck({
      ...limiterOptions,
      id: "zoho-projects-rate-limiter",
      datastore: "ioredis",
      clearDatastore: false,
      connection: redisConnection,
    });
  }

  const limiter = new Bottleneck(limiterOptions);

  // Handle rate limit errors with 30-minute backoff
  limiter.on("failed", async (error, jobInfo) => {
    const axiosError = error as { response?: { status?: number } };
    if (axiosError.response?.status === 429) {
      console.warn(
        `[ZohoProjectsClient] Rate limit exceeded, pausing for ${ZOHO_RATE_LIMIT.lockoutMs / 1000 / 60} minutes`
      );
      // Return retry delay in ms - Bottleneck will retry after this delay
      return ZOHO_RATE_LIMIT.lockoutMs;
    }
    // Don't retry other errors
    return undefined;
  });

  limiter.on("retry", (message, jobInfo) => {
    console.info(
      `[ZohoProjectsClient] Retrying request after rate limit cooldown`
    );
  });

  return limiter;
}

/**
 * Create Redis client for distributed rate limiting
 * Lazy import to avoid requiring ioredis when not using Redis
 */
function createRedisClient(url: string): unknown {
  // Dynamic import to avoid bundling ioredis when not needed
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Redis = require("ioredis");
  return new Redis(url);
}

/**
 * Get rate limiter stats for monitoring
 */
export function getRateLimiterStats(limiter: Bottleneck): {
  running: number;
  queued: number;
  reservoir: number | null;
} {
  const counts = limiter.counts();
  return {
    running: counts.RUNNING,
    queued: counts.QUEUED,
    reservoir: null, // Bottleneck doesn't expose current reservoir directly
  };
}
