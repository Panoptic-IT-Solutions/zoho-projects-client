import { z } from "zod";
import { ZohoPageInfoSchema, OwnerRefSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// TRASH ITEM SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Trash item from Zoho Projects API
 * Items in trash can be restored or permanently deleted
 */
export const TrashItemSchema = z.object({
  // Identification
  id: z.union([z.number(), z.string()]),
  id_string: z.string().optional(),
  name: z.string().optional(),
  title: z.string().optional(),

  // Entity type
  entity_type: z.string(), // "project", "task", "bug", "tasklist", "milestone", etc.
  module: z.string().optional(),

  // Original data
  description: z.string().nullable().optional(),

  // Project reference (for project-scoped items)
  project: z.object({
    id: z.number(),
    id_string: z.string().optional(),
    name: z.string(),
  }).optional(),

  // Deletion info
  deleted_by: OwnerRefSchema.optional(),
  deleted_person: z.string().optional(),
  deleted_time: z.string().optional(),
  deleted_time_long: z.number().optional(),

  // Original creation info
  created_by: OwnerRefSchema.optional(),
  created_time: z.string().optional(),
  created_time_long: z.number().optional(),

  // Auto-delete countdown (days until permanent deletion)
  days_remaining: z.number().optional(),

  // Links
  link: z.object({
    self: z.object({ url: z.string() }).optional(),
    restore: z.object({ url: z.string() }).optional(),
  }).passthrough().optional(),
}).passthrough();

export type TrashItem = z.infer<typeof TrashItemSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const TrashListResponseSchema = z.object({
  trash: z.array(TrashItemSchema).optional(),
  deleted_items: z.array(TrashItemSchema).optional(),
  page_info: ZohoPageInfoSchema.optional(),
});

export type TrashListResponse = z.infer<typeof TrashListResponseSchema>;

export const TrashRestoreResponseSchema = z.object({
  restored: z.boolean().optional(),
  message: z.string().optional(),
});

export type TrashRestoreResponse = z.infer<typeof TrashRestoreResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Entity types that can be in trash
 */
export type TrashableEntityType =
  | "all"
  | "project"
  | "task"
  | "bug"
  | "tasklist"
  | "milestone"
  | "forum"
  | "event"
  | "document";

/**
 * Input schema for filtering trash
 */
export const TrashFilterInputSchema = z.object({
  /** Filter by entity type */
  entity_type: z.enum([
    "all",
    "project",
    "task",
    "bug",
    "tasklist",
    "milestone",
    "forum",
    "event",
    "document",
  ]).optional(),
  /** Filter by project ID */
  project_id: z.string().optional(),
  /** Filter by deleted by user ID */
  deleted_by: z.string().optional(),
});

export type TrashFilterInput = z.infer<typeof TrashFilterInputSchema>;
