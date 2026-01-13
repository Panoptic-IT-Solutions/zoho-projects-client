import { z } from "zod";
import { ZohoPageInfoSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// TAG SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tag from Zoho Projects API
 */
export const TagSchema = z.object({
  // Identification
  id: z.number(),
  id_string: z.string(),
  name: z.string(),

  // Appearance
  color_class: z.string().optional(),
  color_code: z.string().optional(),

  // Counts
  count: z.coerce.number().optional(),

  // Timestamps
  created_time: z.string().optional(),
  created_time_long: z.number().optional(),
}).passthrough();

export type Tag = z.infer<typeof TagSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const TagListResponseSchema = z.object({
  tags: z.array(TagSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export type TagListResponse = z.infer<typeof TagListResponseSchema>;

export const TagResponseSchema = z.object({
  tags: z.array(TagSchema),
});

export type TagResponse = z.infer<typeof TagResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS (CREATE/UPDATE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input schema for creating a tag
 */
export const CreateTagInputSchema = z.object({
  /** Tag name (required) */
  name: z.string().min(1),
  /** Color class for styling */
  color_class: z.string().optional(),
});

export type CreateTagInput = z.infer<typeof CreateTagInputSchema>;

/**
 * Input schema for updating a tag
 */
export const UpdateTagInputSchema = CreateTagInputSchema.partial();

export type UpdateTagInput = z.infer<typeof UpdateTagInputSchema>;
