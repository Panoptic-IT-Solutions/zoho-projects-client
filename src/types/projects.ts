import { z } from "zod";
import { CustomFieldSchema, OwnerRefSchema, ZohoLinkSchema, ZohoPageInfoSchema } from "./common.js";

/**
 * Task/Bug count object
 */
export const CountObjectSchema = z.object({
  open: z.number(),
  closed: z.number(),
});

/**
 * Layout details for project
 */
export const LayoutDetailsSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
}).passthrough();

/**
 * Project from Zoho Projects API
 */
export const ProjectSchema = z.object({
  // Identification
  id: z.number(),
  id_string: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  key: z.string().optional(),

  // Status
  status: z.enum(["active", "archived", "template"]).optional(),
  custom_status_id: z.union([z.number(), z.string()]).nullable().optional(),
  custom_status_name: z.string().nullable().optional(),

  // Dates - Zoho returns MM-DD-YYYY format strings and epoch timestamps
  created_date: z.string().optional(),
  created_date_long: z.number().optional(),
  updated_date: z.string().optional(),
  updated_date_long: z.number().optional(),
  start_date: z.string().nullable().optional(),
  start_date_long: z.number().nullable().optional(),
  end_date: z.string().nullable().optional(),
  end_date_long: z.number().nullable().optional(),

  // Ownership
  owner_id: z.union([z.string(), z.number()]).optional(),
  owner_name: z.string().optional(),
  owner_zpuid: z.union([z.string(), z.number()]).optional(),
  owner_email: z.string().optional(),
  created_by: z.union([z.string(), z.number()]).optional(),
  created_by_zpuid: z.union([z.string(), z.number()]).optional(),

  // Access & Visibility
  is_public: z.enum(["yes", "no"]).optional(),
  role: z.string().optional(),

  // Counts
  task_count: CountObjectSchema.optional(),
  milestone_count: CountObjectSchema.optional(),
  bug_count: CountObjectSchema.optional(),

  // Budget & Billing
  budget_type: z.string().nullable().optional(),
  budget_value: z.number().nullable().optional(),
  threshold: z.number().nullable().optional(),
  currency_code: z.string().optional(),
  project_rate: z.number().nullable().optional(),

  // Configuration
  layout_details: LayoutDetailsSchema.optional(),
  cascade_setting: z.record(z.unknown()).optional(),

  // Links
  link: z.object({
    self: z.object({ url: z.string() }).optional(),
    task: z.object({ url: z.string() }).optional(),
    activity: z.object({ url: z.string() }).optional(),
    milestone: z.object({ url: z.string() }).optional(),
    document: z.object({ url: z.string() }).optional(),
    forum: z.object({ url: z.string() }).optional(),
    timesheet: z.object({ url: z.string() }).optional(),
    status: z.object({ url: z.string() }).optional(),
    bug: z.object({ url: z.string() }).optional(),
  }).passthrough().optional(),

  // Custom fields
  custom_fields: z.array(CustomFieldSchema).optional(),

  // Group info (if applicable)
  group_name: z.string().nullable().optional(),
  group_id: z.string().nullable().optional(),
}).passthrough(); // Allow extra fields we haven't documented

export type Project = z.infer<typeof ProjectSchema>;

/**
 * Response wrapper for listing projects
 */
export const ProjectListResponseSchema = z.object({
  projects: z.array(ProjectSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export type ProjectListResponse = z.infer<typeof ProjectListResponseSchema>;

/**
 * Response wrapper for getting a single project
 */
export const ProjectResponseSchema = z.object({
  projects: z.array(ProjectSchema),
});

export type ProjectResponse = z.infer<typeof ProjectResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS (CREATE/UPDATE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input schema for creating a project
 */
export const CreateProjectInputSchema = z.object({
  /** Project name (required) */
  name: z.string().min(1),
  /** Project description */
  description: z.string().optional(),
  /** Template project ID to copy from */
  template_id: z.string().optional(),
  /** Start date (MM-DD-YYYY format) */
  start_date: z.string().optional(),
  /** End date (MM-DD-YYYY format) */
  end_date: z.string().optional(),
  /** Project owner user ID */
  owner: z.string().optional(),
  /** Project status */
  status: z.enum(["active", "archived"]).optional(),
  /** Public visibility */
  is_public: z.enum(["yes", "no"]).optional(),
  /** Budget type */
  budget_type: z.enum(["based_on_project_hours", "based_on_task_hours", "based_on_project_cost", "based_on_task_cost"]).optional(),
  /** Budget value */
  budget_value: z.number().optional(),
  /** Threshold percentage for budget alerts */
  threshold: z.number().optional(),
  /** Currency code (e.g., "USD") */
  currency_code: z.string().optional(),
  /** Project rate per hour */
  project_rate: z.number().optional(),
  /** Group ID to assign project to */
  group_id: z.string().optional(),
  /** Layout ID for custom fields */
  layout_id: z.string().optional(),
  /** Custom field values */
  custom_fields: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>;

/**
 * Input schema for updating a project (all fields optional)
 */
export const UpdateProjectInputSchema = CreateProjectInputSchema.partial();

export type UpdateProjectInput = z.infer<typeof UpdateProjectInputSchema>;
