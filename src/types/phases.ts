import { z } from "zod";
import { ZohoPageInfoSchema, OwnerRefSchema } from "./common.js";
import { V3UserRefSchema } from "./projects.js";

// ─────────────────────────────────────────────────────────────────────────────
// PHASE (MILESTONE) SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Phase status (V3 compatible)
 * V3 API returns different field names: statusId, statusName, statusColor, etc.
 */
export const PhaseStatusSchema = z.object({
  // Standard format
  id: z.union([z.number(), z.string()]).optional(),
  name: z.string().optional(),
  color_code: z.string().optional(),
  color_hexcode: z.string().optional(),
  is_closed_type: z.boolean().optional(),
  // V3 format - different field names
  statusId: z.string().optional(),
  statusName: z.string().optional(),
  statusColor: z.string().optional(),
  statusColorHexCode: z.string().optional(),
  sequence: z.union([z.number(), z.string()]).optional(),
  defaultValue: z.boolean().optional(),
  closed: z.boolean().optional(),
  layoutId: z.string().optional(),
}).passthrough();

export type PhaseStatus = z.infer<typeof PhaseStatusSchema>;

/**
 * V3 owner/user format for milestones
 * Used for owner, created_by, addedby fields
 */
export const V3MilestoneOwnerSchema = z.object({
  zuid: z.union([z.number(), z.string()]).optional(),
  zpuid: z.string().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  full_name: z.string().optional(),
  // V3 additional fields
  is_client_user: z.boolean().optional(),
  business_hours_id: z.string().optional(),
  // Legacy fields
  id: z.union([z.string(), z.number()]).optional(),
}).passthrough();

/**
 * Phase (Milestone) from Zoho Projects API (V3 compatible)
 * Note: Zoho calls these "milestones" in the API response
 */
export const PhaseSchema = z.object({
  // Identification - V3 uses string IDs
  id: z.union([z.number(), z.string()]),
  id_string: z.string().optional(), // Legacy field, not in V3
  name: z.string(),
  description: z.string().nullable().optional(),

  // Sequence - V3 returns as string
  sequence: z.coerce.number().optional(),

  // Dates - V3 uses ISO format
  start_date: z.string().nullable().optional(),
  start_date_long: z.number().nullable().optional(),
  end_date: z.string().nullable().optional(),
  end_date_long: z.number().nullable().optional(),
  created_time: z.string().optional(),
  created_time_long: z.number().optional(),
  last_updated_time: z.string().optional(),
  last_updated_time_long: z.number().optional(),
  modified_time: z.string().optional(), // V3

  // Status
  status: PhaseStatusSchema.optional(),
  status_name: z.string().optional(),
  completed: z.boolean().optional(),
  is_completed: z.boolean().optional(), // V3
  percent_complete: z.number().optional(),

  // Owner - V3 uses object format, legacy uses flat fields
  owner: z.union([V3MilestoneOwnerSchema, OwnerRefSchema]).optional(),
  owner_id: z.string().optional(),
  owner_name: z.string().optional(),
  created_by: z.union([V3MilestoneOwnerSchema, V3UserRefSchema, z.string(), z.number()]).optional(),
  updated_by: z.union([V3MilestoneOwnerSchema, V3UserRefSchema]).optional(),
  addedby: V3MilestoneOwnerSchema.optional(), // V3 alternative name for created_by

  // Flag
  flag: z.enum(["internal", "external"]).optional(),

  // Counts
  open_task_count: z.coerce.number().optional(),
  closed_task_count: z.coerce.number().optional(),
  tasks: z.object({ // V3 format
    open_count: z.coerce.number().optional(),
    closed_count: z.coerce.number().optional(),
  }).optional(),

  // Project reference - V3 uses number IDs sometimes
  project: z.object({
    id: z.union([z.number(), z.string()]),
    id_string: z.string().optional(),
    name: z.string().optional(),
  }).passthrough().optional(),

  // V3 additional fields
  status_type: z.string().optional(), // "open" or "closed"
  last_modified_time: z.string().optional(), // V3 alternative for last_updated_time
  updated_time: z.string().optional(), // V3 alternative for last_updated_time
  budget_info: z.object({
    is_workfield_removed: z.boolean().optional(),
  }).passthrough().optional(),
  budget_details: z.object({
    is_budget_enabled: z.boolean().optional(),
    is_workfield_removed: z.boolean().optional(),
  }).passthrough().optional(),
  completion_percent: z.number().optional(), // V3 alternative to percent_complete
  color_code: z.string().optional(), // V3
  isTrashed: z.union([z.string(), z.boolean()]).optional(), // V3 returns "0" or "1"
  is_editable: z.boolean().optional(), // V3
  percent_type: z.number().optional(), // V3
  custom_fields: z.record(z.unknown()).optional(), // V3
  tab_info: z.object({
    comment_count: z.number().optional(),
    invoice_tab_enabled: z.boolean().optional(),
    statustimeline_tab_enabled: z.boolean().optional(),
    task_tab_enabled: z.boolean().optional(),
    bug_tab_enabled: z.boolean().optional(),
  }).passthrough().optional(), // V3
  followers: z.array(z.unknown()).optional(), // V3
  tags: z.array(z.unknown()).optional(), // V3

  // Links
  link: z.object({
    self: z.object({ url: z.string() }).optional(),
    task: z.object({ url: z.string() }).optional(),
  }).passthrough().optional(),
}).passthrough();

export type Phase = z.infer<typeof PhaseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * V3 page_info element (returned as array)
 */
export const V3PageInfoElementSchema = z.object({
  page: z.coerce.number(),
  per_page: z.coerce.number(),
  has_next_page: z.boolean().optional(),
}).passthrough();

export const PhaseListResponseSchema = z.object({
  milestones: z.array(PhaseSchema),
  // V3 API returns page_info as an array, legacy returns object
  page_info: z.union([
    ZohoPageInfoSchema,
    z.array(V3PageInfoElementSchema),
  ]).optional(),
});

export type PhaseListResponse = z.infer<typeof PhaseListResponseSchema>;

export const PhaseResponseSchema = z.object({
  milestones: z.array(PhaseSchema),
});

export type PhaseResponse = z.infer<typeof PhaseResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS (CREATE/UPDATE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input schema for creating a phase/milestone
 */
export const CreatePhaseInputSchema = z.object({
  /** Phase name (required) */
  name: z.string().min(1),
  /** Phase description */
  description: z.string().optional(),
  /** Start date (MM-DD-YYYY format) */
  start_date: z.string().optional(),
  /** End date (MM-DD-YYYY format) */
  end_date: z.string().optional(),
  /** Owner user ID */
  owner_id: z.string().optional(),
  /** Flag: internal or external */
  flag: z.enum(["internal", "external"]).optional(),
  /** Status ID */
  status_id: z.string().optional(),
});

export type CreatePhaseInput = z.infer<typeof CreatePhaseInputSchema>;

/**
 * Input schema for updating a phase/milestone
 */
export const UpdatePhaseInputSchema = CreatePhaseInputSchema.partial();

export type UpdatePhaseInput = z.infer<typeof UpdatePhaseInputSchema>;
