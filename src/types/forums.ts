import { z } from "zod";
import { ZohoPageInfoSchema, OwnerRefSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// FORUM SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Forum category
 */
export const ForumCategorySchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
});

export type ForumCategory = z.infer<typeof ForumCategorySchema>;

/**
 * Forum (Discussion) from Zoho Projects API
 */
export const ForumSchema = z.object({
  // Identification
  id: z.number(),
  id_string: z.string(),
  name: z.string(),
  content: z.string().nullable().optional(),

  // Category
  category: ForumCategorySchema.optional(),

  // Status
  is_sticky: z.boolean().optional(),
  is_announcement: z.boolean().optional(),
  is_closed: z.boolean().optional(),

  // Flag
  flag: z.enum(["internal", "external"]).optional(),

  // Creator
  posted_by: OwnerRefSchema.optional(),
  posted_person: z.string().optional(),

  // Counts
  comment_count: z.coerce.number().optional(),
  view_count: z.coerce.number().optional(),

  // Project reference
  project: z.object({
    id: z.number(),
    id_string: z.string().optional(),
    name: z.string(),
  }).optional(),

  // Links
  link: z.object({
    self: z.object({ url: z.string() }).optional(),
    comment: z.object({ url: z.string() }).optional(),
  }).passthrough().optional(),

  // Timestamps
  posted_time: z.string().optional(),
  posted_time_long: z.number().optional(),
  last_updated_time: z.string().optional(),
  last_updated_time_long: z.number().optional(),
}).passthrough();

export type Forum = z.infer<typeof ForumSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const ForumListResponseSchema = z.object({
  forums: z.array(ForumSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export type ForumListResponse = z.infer<typeof ForumListResponseSchema>;

export const ForumResponseSchema = z.object({
  forums: z.array(ForumSchema),
});

export type ForumResponse = z.infer<typeof ForumResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS (CREATE/UPDATE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input schema for creating a forum/discussion
 */
export const CreateForumInputSchema = z.object({
  /** Forum title (required) */
  name: z.string().min(1),
  /** Forum content/body */
  content: z.string().optional(),
  /** Category ID */
  category_id: z.string().optional(),
  /** Whether to pin the forum */
  is_sticky: z.boolean().optional(),
  /** Whether this is an announcement */
  is_announcement: z.boolean().optional(),
  /** Flag: internal or external */
  flag: z.enum(["internal", "external"]).optional(),
  /** Users to notify (comma-separated IDs) */
  notify: z.string().optional(),
});

export type CreateForumInput = z.infer<typeof CreateForumInputSchema>;

/**
 * Input schema for updating a forum/discussion
 */
export const UpdateForumInputSchema = CreateForumInputSchema.partial();

export type UpdateForumInput = z.infer<typeof UpdateForumInputSchema>;
