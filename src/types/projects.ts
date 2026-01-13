import { z } from "zod";
import { CustomFieldSchema, OwnerRefSchema, ZohoLinkSchema, ZohoPageInfoSchema } from "./common.js";

/**
 * Task/Bug count object (legacy format)
 */
export const CountObjectSchema = z.object({
  open: z.coerce.number(),
  closed: z.coerce.number(),
});

/**
 * V3 count object format (open_count/closed_count)
 */
export const V3CountObjectSchema = z.object({
  open_count: z.coerce.number(),
  closed_count: z.coerce.number(),
});

/**
 * User reference in V3 API
 */
export const V3UserRefSchema = z.object({
  zuid: z.union([z.number(), z.string()]),
  zpuid: z.string(),
  name: z.string(),
  email: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  full_name: z.string().optional(),
}).passthrough();

/**
 * Status reference in V3 API
 */
export const V3StatusRefSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().optional(),
  color_hexcode: z.string().optional(),
  is_closed_type: z.boolean().optional(),
}).passthrough();

/**
 * Layout reference in V3 API
 */
export const V3LayoutRefSchema = z.object({
  id: z.string(),
  name: z.string(),
  is_default: z.boolean().optional(),
  type: z.string().optional(),
}).passthrough();

/**
 * Budget info in V3 API
 */
export const V3BudgetInfoSchema = z.object({
  tracking_method: z.string().optional(),
}).passthrough();

/**
 * Project group in V3 API
 */
export const V3ProjectGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string().optional(),
}).passthrough();

/**
 * Layout details for project (legacy)
 */
export const LayoutDetailsSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
}).passthrough();

/**
 * Project from Zoho Projects V3 API
 */
export const ProjectSchema = z.object({
  // Identification - V3 uses string IDs
  id: z.union([z.string(), z.number()]),
  id_string: z.string().optional(), // Legacy field, not in V3
  name: z.string(),
  description: z.string().nullable().optional(),
  key: z.string().optional(),

  // Project type (V3) / Status
  project_type: z.string().optional(), // V3: "active"
  status: z.union([
    z.enum(["active", "archived", "template"]), // Legacy
    V3StatusRefSchema, // V3
  ]).optional(),
  custom_status_id: z.union([z.number(), z.string()]).nullable().optional(),
  custom_status_name: z.string().nullable().optional(),

  // Dates - V3 uses ISO format, legacy uses MM-DD-YYYY
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  created_time: z.string().optional(), // V3
  modified_time: z.string().optional(), // V3
  completed_time: z.string().optional(), // V3
  // Legacy date fields
  created_date: z.string().optional(),
  created_date_long: z.number().optional(),
  updated_date: z.string().optional(),
  updated_date_long: z.number().optional(),
  start_date_long: z.number().nullable().optional(),
  end_date_long: z.number().nullable().optional(),

  // Ownership - V3 uses object, legacy uses flat fields
  owner: z.union([V3UserRefSchema, z.string(), z.number()]).optional(), // V3
  owner_id: z.union([z.string(), z.number()]).optional(), // Legacy
  owner_name: z.string().optional(), // Legacy
  owner_zpuid: z.union([z.string(), z.number()]).optional(), // Legacy
  owner_email: z.string().optional(), // Legacy
  created_by: z.union([V3UserRefSchema, z.string(), z.number()]).optional(),
  created_by_zpuid: z.union([z.string(), z.number()]).optional(), // Legacy
  updated_by: V3UserRefSchema.optional(), // V3

  // Access & Visibility
  is_public: z.enum(["yes", "no"]).optional(), // Legacy
  is_public_project: z.boolean().optional(), // V3
  is_strict_project: z.boolean().optional(), // V3
  is_rollup_project: z.boolean().optional(), // V3
  is_completed: z.boolean().optional(), // V3
  percent_complete: z.number().optional(), // V3
  role: z.string().optional(),

  // Counts - V3 uses different structure
  tasks: V3CountObjectSchema.optional(), // V3
  issues: V3CountObjectSchema.optional(), // V3
  milestones: V3CountObjectSchema.optional(), // V3
  task_count: CountObjectSchema.optional(), // Legacy
  milestone_count: CountObjectSchema.optional(), // Legacy
  bug_count: CountObjectSchema.optional(), // Legacy

  // Budget & Billing
  budget_info: V3BudgetInfoSchema.optional(), // V3
  budget_type: z.string().nullable().optional(), // Legacy
  budget_value: z.number().nullable().optional(),
  threshold: z.number().nullable().optional(),
  currency_code: z.string().optional(),
  project_rate: z.number().nullable().optional(),

  // Configuration
  layout: V3LayoutRefSchema.optional(), // V3
  layout_details: LayoutDetailsSchema.optional(), // Legacy
  cascade_setting: z.record(z.unknown()).optional(),
  business_hours_id: z.string().optional(), // V3

  // Project group
  project_group: V3ProjectGroupSchema.optional(), // V3
  group_name: z.string().nullable().optional(), // Legacy
  group_id: z.string().nullable().optional(), // Legacy

  // Links (legacy)
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
}).passthrough(); // Allow extra fields we haven't documented

export type Project = z.infer<typeof ProjectSchema>;

/**
 * Response wrapper for listing projects (V3 API returns array directly)
 */
export const ProjectListResponseSchema = z.union([
  // V3 API returns array directly
  z.array(ProjectSchema),
  // Legacy API wraps in object
  z.object({
    projects: z.array(ProjectSchema),
    page_info: ZohoPageInfoSchema.optional(),
  }),
]);

export type ProjectListResponse = z.infer<typeof ProjectListResponseSchema>;

/**
 * Response wrapper for getting a single project
 */
export const ProjectResponseSchema = z.union([
  // V3 API returns array directly
  z.array(ProjectSchema),
  // Legacy API wraps in object
  z.object({
    projects: z.array(ProjectSchema),
  }),
]);

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
