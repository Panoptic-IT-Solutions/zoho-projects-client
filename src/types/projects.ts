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
  custom_status_id: z.number().nullable().optional(),
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
  owner_id: z.string().optional(),
  owner_name: z.string().optional(),
  owner_zpuid: z.string().optional(),
  owner_email: z.string().optional(),
  created_by: z.string().optional(),
  created_by_zpuid: z.string().optional(),

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
