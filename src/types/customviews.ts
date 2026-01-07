import { z } from "zod";
import { ZohoPageInfoSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM VIEW SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Custom view column
 */
export const CustomViewColumnSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  sequence: z.number().optional(),
}).passthrough();

export type CustomViewColumn = z.infer<typeof CustomViewColumnSchema>;

/**
 * Custom view criteria
 */
export const CustomViewCriteriaSchema = z.object({
  cfid: z.string().optional(),
  api_name: z.string().optional(),
  field_name: z.string().optional(),
  criteria_condition: z.string().optional(),
  value: z.string().optional(),
  relative_columns: z.array(z.object({
    cfid: z.string().optional(),
    offset: z.string().optional(),
    unit: z.string().optional(),
    prior: z.string().optional(),
  })).optional(),
}).passthrough();

export type CustomViewCriteria = z.infer<typeof CustomViewCriteriaSchema>;

/**
 * Custom View from Zoho Projects API
 */
export const CustomViewSchema = z.object({
  // Identification
  id: z.union([z.number(), z.string()]),
  id_string: z.string().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),

  // Module
  module_id: z.string().optional(),
  module_name: z.string().optional(),

  // Access
  access_type: z.enum(["all", "private", "specific"]).optional(),
  accessed_by: z.array(z.string()).optional(),

  // Project accessibility
  project_accessibility_type: z.enum(["all", "specific"]).optional(),
  project_ids: z.array(z.string()).optional(),

  // View settings
  view_type: z.string().optional(), // "date", "list", etc.
  is_mytasks_view_enabled: z.boolean().optional(),
  is_customised_column_view_enabled: z.boolean().optional(),

  // Columns
  customised_columns: z.array(CustomViewColumnSchema).optional(),

  // Criteria
  criteria: z.array(CustomViewCriteriaSchema).optional(),
  criteria_pattern: z.string().optional(),

  // System flags
  is_default: z.boolean().optional(),
  is_system_view: z.boolean().optional(),

  // Timestamps
  created_time: z.string().optional(),
  created_time_long: z.number().optional(),
  last_modified_time: z.string().optional(),
  last_modified_time_long: z.number().optional(),
}).passthrough();

export type CustomView = z.infer<typeof CustomViewSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const CustomViewListResponseSchema = z.object({
  customviews: z.array(CustomViewSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export type CustomViewListResponse = z.infer<typeof CustomViewListResponseSchema>;

export const CustomViewResponseSchema = z.object({
  customviews: z.array(CustomViewSchema),
});

export type CustomViewResponse = z.infer<typeof CustomViewResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input schema for creating a custom view
 */
export const CreateCustomViewInputSchema = z.object({
  /** View name (required) */
  name: z.string().min(1),
  /** View description */
  description: z.string().optional(),
  /** Module ID */
  module_id: z.string().optional(),
  /** Access type */
  access_type: z.enum(["all", "private", "specific"]).optional(),
  /** Users who can access (for specific access) */
  accessed_by: z.array(z.string()).optional(),
  /** Project accessibility type */
  project_accessibility_type: z.enum(["all", "specific"]).optional(),
  /** Project IDs (for specific accessibility) */
  project_ids: z.array(z.string()).optional(),
  /** View type */
  view_type: z.string().optional(),
  /** Enable in My Tasks */
  is_mytasks_view_enabled: z.boolean().optional(),
  /** Enable customized columns */
  is_customised_column_view_enabled: z.boolean().optional(),
  /** Customized columns */
  customised_columns: z.array(z.object({
    id: z.string(),
    sequence: z.number(),
  })).optional(),
  /** Filter criteria */
  criteria: z.string().optional(),
  /** Criteria pattern */
  criteria_pattern: z.string().optional(),
});

export type CreateCustomViewInput = z.infer<typeof CreateCustomViewInputSchema>;

/**
 * Input schema for updating a custom view
 */
export const UpdateCustomViewInputSchema = CreateCustomViewInputSchema.partial();

export type UpdateCustomViewInput = z.infer<typeof UpdateCustomViewInputSchema>;

/**
 * Supported entity types for custom views
 */
export type CustomViewEntityType = "tasks" | "issues" | "milestones" | "mytasks";
