// Types
export * from "./types/index.js";

// Errors
export {
  ZohoProjectsError,
  ZohoAuthenticationError,
  ZohoRateLimitError,
  ZohoNotFoundError,
  ZohoValidationError,
  ZohoResponseValidationError,
  parseAxiosError,
  isRateLimitError,
  isAuthError,
} from "./errors.js";

// Client
export {
  createZohoProjectsClient,
  type ZohoProjectsConfig,
  type ZohoProjectsClient,
} from "./client.js";

// Utilities
export {
  autoPaginate,
  collectAll,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  type PaginatedResponse,
  type AutoPaginateOptions,
} from "./utils/pagination.js";

export {
  createRateLimiter,
  getRateLimiterStats,
  type RateLimiterConfig,
} from "./utils/rate-limiter.js";

export { TokenManager, type TokenManagerConfig } from "./auth/token-manager.js";
