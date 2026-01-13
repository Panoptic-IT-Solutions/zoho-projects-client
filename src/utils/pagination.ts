import type { ZohoPageInfo } from "../types/index.js";

/**
 * Default page size for Zoho Projects API
 * Maximum allowed is 200
 */
export const DEFAULT_PAGE_SIZE = 100;

/**
 * Maximum page size allowed by Zoho
 */
export const MAX_PAGE_SIZE = 200;

/**
 * Generic paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  pageInfo?: ZohoPageInfo;
}

/**
 * Options for auto-pagination
 */
export interface AutoPaginateOptions {
  /** Maximum number of items to fetch (default: unlimited) */
  maxItems?: number;
  /** Number of items per page (default: 100, max: 200) */
  pageSize?: number;
}

/**
 * Create an async generator that automatically handles pagination
 *
 * Usage (V3 API - page-based):
 * ```ts
 * for await (const project of autoPaginate((page, per_page) =>
 *   client.projects.list({ page, per_page })
 * )) {
 *   console.log(project);
 * }
 * ```
 *
 * @param fetchPage Function that fetches a page given page number (1-based) and page size
 * @param options Pagination options
 */
export async function* autoPaginate<T>(
  fetchPage: (page: number, per_page: number) => Promise<PaginatedResponse<T>>,
  options: AutoPaginateOptions = {}
): AsyncGenerator<T, void, unknown> {
  const pageSize = Math.min(options.pageSize ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const maxItems = options.maxItems ?? Infinity;

  let page = 1; // V3 API uses 1-based pages
  let itemsYielded = 0;
  let hasMore = true;

  while (hasMore && itemsYielded < maxItems) {
    const response = await fetchPage(page, pageSize);
    const items = response.data;

    if (items.length === 0) {
      // No more items
      hasMore = false;
      break;
    }

    for (const item of items) {
      if (itemsYielded >= maxItems) {
        return;
      }
      yield item;
      itemsYielded++;
    }

    // Determine if there are more pages
    if (response.pageInfo?.has_more_page === false) {
      hasMore = false;
    } else if (items.length < pageSize) {
      // Received fewer items than requested, likely last page
      hasMore = false;
    } else {
      // Move to next page
      page++;
    }
  }
}

/**
 * Collect all items from an async generator into an array
 *
 * Usage:
 * ```ts
 * const allProjects = await collectAll(autoPaginate(...));
 * ```
 */
export async function collectAll<T>(
  generator: AsyncGenerator<T, void, unknown>
): Promise<T[]> {
  const items: T[] = [];
  for await (const item of generator) {
    items.push(item);
  }
  return items;
}

/**
 * Helper to create pagination params for Zoho V3 API
 */
export function createPaginationParams(
  page: number = 1,
  per_page: number = DEFAULT_PAGE_SIZE
): { page: number; per_page: number } {
  return {
    page,
    per_page: Math.min(per_page, MAX_PAGE_SIZE),
  };
}
