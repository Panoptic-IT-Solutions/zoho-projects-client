/**
 * MSW request handlers for mocking Zoho Projects API
 */
import { http, HttpResponse } from "msw";

// OAuth token handler - always returns a valid token
const oauthHandler = http.post(
  "https://accounts.zoho.com/oauth/v2/token",
  () => {
    return HttpResponse.json({
      access_token: "mock-access-token",
      token_type: "Bearer",
      expires_in: 3600,
      api_domain: "https://www.zohoapis.com",
    });
  }
);

// Default handlers - can be overridden in individual tests
export const handlers = [oauthHandler];

/**
 * Helper to create a list response with pagination
 */
export function createListResponse<T>(
  key: string,
  items: T[],
  pageInfo?: {
    page?: number;
    per_page?: number;
    has_more_page?: boolean;
    total_count?: number;
  }
) {
  return {
    [key]: items,
    page_info: {
      page: pageInfo?.page ?? 1,
      per_page: pageInfo?.per_page ?? 100,
      has_more_page: pageInfo?.has_more_page ?? false,
      total_count: pageInfo?.total_count ?? items.length,
    },
  };
}

/**
 * Helper to create a single item response
 */
export function createItemResponse<T>(key: string, item: T) {
  return {
    [key]: [item],
  };
}

/**
 * Helper to create an error response
 */
export function createErrorResponse(code: number, message: string) {
  return {
    error: {
      code,
      message,
    },
  };
}
