import type { AxiosError } from "axios";

/**
 * Base error class for Zoho Projects API errors
 */
export class ZohoProjectsError extends Error {
  constructor(
    message: string,
    public readonly code?: number,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = "ZohoProjectsError";
    Object.setPrototypeOf(this, ZohoProjectsError.prototype);
  }
}

/**
 * Error thrown when authentication fails
 */
export class ZohoAuthenticationError extends ZohoProjectsError {
  constructor(message: string, cause?: Error) {
    super(message, 401, cause);
    this.name = "ZohoAuthenticationError";
    Object.setPrototypeOf(this, ZohoAuthenticationError.prototype);
  }
}

/**
 * Error thrown when rate limit is exceeded
 * Includes lockout duration for the 30-minute lockout period
 */
export class ZohoRateLimitError extends ZohoProjectsError {
  constructor(
    message: string,
    public readonly lockoutDurationMs: number = 30 * 60 * 1000, // 30 minutes default
    cause?: Error
  ) {
    super(message, 429, cause);
    this.name = "ZohoRateLimitError";
    Object.setPrototypeOf(this, ZohoRateLimitError.prototype);
  }
}

/**
 * Error thrown when a resource is not found
 */
export class ZohoNotFoundError extends ZohoProjectsError {
  constructor(
    message: string,
    public readonly resourceType?: string,
    public readonly resourceId?: string,
    cause?: Error
  ) {
    super(message, 404, cause);
    this.name = "ZohoNotFoundError";
    Object.setPrototypeOf(this, ZohoNotFoundError.prototype);
  }
}

/**
 * Error thrown when request validation fails
 */
export class ZohoValidationError extends ZohoProjectsError {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, 400, cause);
    this.name = "ZohoValidationError";
    Object.setPrototypeOf(this, ZohoValidationError.prototype);
  }
}

/**
 * Error thrown when Zod validation of API response fails
 * Indicates the API returned unexpected data structure
 */
export class ZohoResponseValidationError extends ZohoProjectsError {
  constructor(
    message: string,
    public readonly zodErrors?: unknown,
    public readonly rawResponse?: unknown
  ) {
    super(message, undefined);
    this.name = "ZohoResponseValidationError";
    Object.setPrototypeOf(this, ZohoResponseValidationError.prototype);
  }
}

/**
 * Parse Axios error into appropriate Zoho error class
 */
export function parseAxiosError(error: AxiosError): ZohoProjectsError {
  const status = error.response?.status;
  const data = error.response?.data as
    | { error?: { code?: number; message?: string } }
    | undefined;
  const message = data?.error?.message || error.message;

  switch (status) {
    case 401:
    case 403:
      return new ZohoAuthenticationError(message, error);
    case 404:
      return new ZohoNotFoundError(message, undefined, undefined, error);
    case 429:
      return new ZohoRateLimitError(message, 30 * 60 * 1000, error);
    case 400:
      return new ZohoValidationError(message, data?.error, error);
    default:
      return new ZohoProjectsError(message, status, error);
  }
}

/**
 * Type guard to check if error is a Zoho rate limit error
 */
export function isRateLimitError(
  error: unknown
): error is ZohoRateLimitError {
  return error instanceof ZohoRateLimitError;
}

/**
 * Type guard to check if error is a Zoho authentication error
 */
export function isAuthError(
  error: unknown
): error is ZohoAuthenticationError {
  return error instanceof ZohoAuthenticationError;
}
