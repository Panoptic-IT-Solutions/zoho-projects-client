import { z } from "zod";
import { ZohoPageInfoSchema, OwnerRefSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// COMMENT SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Comment from Zoho Projects API
 * Comments can be attached to tasks, bugs, forums, milestones, and events
 */
export const CommentSchema = z.object({
  // Identification
  id: z.number(),
  id_string: z.string(),
  content: z.string(),

  // Author
  posted_by: OwnerRefSchema.optional(),
  posted_person: z.string().optional(),
  author_name: z.string().optional(),

  // Parent entity reference
  entity_type: z.string().optional(), // "task", "bug", "forum", "milestone", "event"
  entity_id: z.string().optional(),

  // Attachments
  attachments: z.array(z.object({
    id: z.number(),
    id_string: z.string().optional(),
    name: z.string(),
    url: z.string().optional(),
  })).optional(),

  // Mentions
  mentions: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })).optional(),

  // Links
  link: z.object({
    self: z.object({ url: z.string() }).optional(),
  }).passthrough().optional(),

  // Timestamps
  posted_time: z.string().optional(),
  posted_time_long: z.number().optional(),
  last_modified_time: z.string().optional(),
  last_modified_time_long: z.number().optional(),
}).passthrough();

export type Comment = z.infer<typeof CommentSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const CommentListResponseSchema = z.object({
  comments: z.array(CommentSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export type CommentListResponse = z.infer<typeof CommentListResponseSchema>;

export const CommentResponseSchema = z.object({
  comments: z.array(CommentSchema),
});

export type CommentResponse = z.infer<typeof CommentResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS (CREATE/UPDATE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input schema for creating a comment
 */
export const CreateCommentInputSchema = z.object({
  /** Comment content (required) */
  content: z.string().min(1),
  /** User IDs to mention (comma-separated) */
  mentions: z.string().optional(),
});

export type CreateCommentInput = z.infer<typeof CreateCommentInputSchema>;

/**
 * Input schema for updating a comment
 */
export const UpdateCommentInputSchema = z.object({
  /** Updated comment content */
  content: z.string().min(1),
});

export type UpdateCommentInput = z.infer<typeof UpdateCommentInputSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// SUPPORTED ENTITY TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Entity types that support comments
 */
export type CommentableEntityType = "tasks" | "bugs" | "forums" | "milestones" | "events";
