import { z } from "zod";
import { ZohoPageInfoSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT GROUP SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Project Group from Zoho Projects API
 */
export const ProjectGroupSchema = z.object({
  // Identification
  id: z.string(),
  id_string: z.string().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),

  // Counts
  projects_count: z.coerce.number().optional(),

  // Owner
  owner_id: z.string().optional(),
  owner_name: z.string().optional(),

  // Timestamps
  created_time: z.string().optional(),
  created_time_long: z.number().optional(),
  last_modified_time: z.string().optional(),
  last_modified_time_long: z.number().optional(),
}).passthrough();

export type ProjectGroup = z.infer<typeof ProjectGroupSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const ProjectGroupListResponseSchema = z.object({
  groups: z.array(ProjectGroupSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export type ProjectGroupListResponse = z.infer<typeof ProjectGroupListResponseSchema>;

export const ProjectGroupResponseSchema = z.object({
  groups: z.array(ProjectGroupSchema),
});

export type ProjectGroupResponse = z.infer<typeof ProjectGroupResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS (CREATE/UPDATE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input schema for creating a project group
 */
export const CreateProjectGroupInputSchema = z.object({
  /** Group name (required) */
  name: z.string().min(1),
  /** Group description */
  description: z.string().optional(),
});

export type CreateProjectGroupInput = z.infer<typeof CreateProjectGroupInputSchema>;

/**
 * Input schema for updating a project group
 */
export const UpdateProjectGroupInputSchema = CreateProjectGroupInputSchema.partial();

export type UpdateProjectGroupInput = z.infer<typeof UpdateProjectGroupInputSchema>;
