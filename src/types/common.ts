import { z } from "zod";

/**
 * Common Zoho API response wrapper
 * Zoho wraps responses in a resource-specific key (e.g., "projects", "tasks")
 */
export const ZohoPageInfoSchema = z.object({
  page: z.coerce.number(),
  per_page: z.coerce.number(),
  total_count: z.coerce.number().optional(),
  has_more_page: z.boolean().optional(),
});

export type ZohoPageInfo = z.infer<typeof ZohoPageInfoSchema>;

/**
 * Zoho error response format
 */
export const ZohoErrorSchema = z.object({
  error: z.object({
    code: z.number(),
    message: z.string(),
  }),
});

export type ZohoError = z.infer<typeof ZohoErrorSchema>;

/**
 * Pagination parameters for list requests (V3 API)
 */
export interface ListParams {
  /** Page number (1-indexed) - V3 API */
  page?: number;
  /** Number of items per page - V3 API */
  per_page?: number;
  /** @deprecated Use page instead - for backwards compatibility */
  index?: number;
  /** @deprecated Use per_page instead - for backwards compatibility */
  range?: number;
  sort_column?: string;
  sort_order?: "ascending" | "descending";
}

/**
 * Custom fields that may appear on any resource
 * Zoho allows custom fields which we type loosely
 */
export const CustomFieldSchema = z.object({
  label_name: z.string(),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
});

export type CustomField = z.infer<typeof CustomFieldSchema>;

/**
 * Link object used throughout Zoho API responses
 */
export const ZohoLinkSchema = z.object({
  self: z.object({ url: z.string() }).optional(),
  project: z.object({ url: z.string() }).optional(),
  task: z.object({ url: z.string() }).optional(),
  status: z.object({ url: z.string() }).optional(),
});

export type ZohoLink = z.infer<typeof ZohoLinkSchema>;

/**
 * Owner/User reference used in nested objects (V3 compatible)
 */
export const OwnerRefSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  zpuid: z.string().optional(),
  // V3 fields
  zuid: z.union([z.number(), z.string()]).optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  full_name: z.string().optional(),
}).passthrough();

export type OwnerRef = z.infer<typeof OwnerRefSchema>;

/**
 * Status reference object
 */
export const StatusRefSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string().optional(),
  color_code: z.string().optional(),
});

export type StatusRef = z.infer<typeof StatusRefSchema>;
