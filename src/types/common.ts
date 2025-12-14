import { z } from "zod";

/**
 * Common Zoho API response wrapper
 * Zoho wraps responses in a resource-specific key (e.g., "projects", "tasks")
 */
export const ZohoPageInfoSchema = z.object({
  page: z.number(),
  per_page: z.number(),
  total_count: z.number().optional(),
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
 * Pagination parameters for list requests
 */
export interface ListParams {
  index?: number;
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
 * Owner/User reference used in nested objects
 */
export const OwnerRefSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional(),
  zpuid: z.string().optional(),
});

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
