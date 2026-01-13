import { z } from "zod";
import { CustomFieldSchema, ZohoPageInfoSchema } from "./common.js";

/**
 * Task reference in time log
 */
export const TimeLogTaskRefSchema = z.object({
  id: z.number(),
  id_string: z.string().optional(),
  name: z.string(),
  is_sub_task: z.boolean().optional(),
  sub_task_level: z.number().optional(),
  is_parent: z.boolean().optional(),
});

export type TimeLogTaskRef = z.infer<typeof TimeLogTaskRefSchema>;

/**
 * Project reference in time log
 */
export const TimeLogProjectRefSchema = z.object({
  id: z.number(),
  id_string: z.string().optional(),
  name: z.string(),
});

export type TimeLogProjectRef = z.infer<typeof TimeLogProjectRefSchema>;

/**
 * Bug reference in time log (for bug time logs)
 */
export const TimeLogBugRefSchema = z.object({
  id: z.number(),
  id_string: z.string().optional(),
  title: z.string(),
});

export type TimeLogBugRef = z.infer<typeof TimeLogBugRefSchema>;

/**
 * Time log entry from Zoho Projects API
 */
export const TimeLogSchema = z.object({
  // Identification
  id: z.number(),
  id_string: z.string(),

  // Duration
  hours: z.number(),
  minutes: z.number(),
  hours_display: z.string().optional(), // Format: "hh:mm"
  total_minutes: z.number().optional(),

  // Date info - Zoho returns MM-DD-YYYY format strings and epoch timestamps
  log_date: z.string().optional(),
  log_date_long: z.number().optional(),
  log_date_format: z.string().optional(),
  date: z.string().optional(), // Alternative date field

  // Notes
  notes: z.string().nullable().optional(),
  name: z.string().optional(), // For general logs - activity/task name

  // Owner
  owner_id: z.number(),
  owner_name: z.string(),
  owner_zpuid: z.string().optional(),

  // Billing
  bill_status: z.enum(["Billable", "Non Billable"]).optional(),
  cost: z.string().optional(), // With currency symbol

  // Approval
  approval_status: z.enum(["Approved", "Pending", "Rejected"]).optional(),
  approver_name: z.string().nullable().optional(),
  approver_zpuid: z.string().nullable().optional(),

  // Timestamps
  created_date: z.string().optional(),
  created_time_long: z.number().optional(),
  created_time_format: z.string().optional(),
  last_modified_date: z.string().optional(),
  last_modified_time_long: z.number().optional(),
  last_modified_time_format: z.string().optional(),

  // Time range (for bug logs)
  start_time: z.string().optional(), // Format: "HH:MM AM/PM"
  end_time: z.string().optional(),

  // References
  task: TimeLogTaskRefSchema.optional(),
  task_list: z.object({
    id: z.number(),
    name: z.string(),
  }).optional(),
  project: TimeLogProjectRefSchema.optional(),
  bug: TimeLogBugRefSchema.optional(),
  invoice_id: z.number().nullable().optional(),

  // Links
  link: z.object({
    self: z.object({ url: z.string() }).optional(),
  }).passthrough().optional(),

  // Custom fields
  custom_fields: z.array(CustomFieldSchema).optional(),
}).passthrough(); // Allow extra fields we haven't documented

export type TimeLog = z.infer<typeof TimeLogSchema>;

/**
 * Date group containing time logs
 * The API returns time logs grouped by date
 */
export const TimeLogDateGroupSchema = z.object({
  date: z.string(),
  display_format: z.string().optional(),
  date_long: z.number().optional(),
  total_hours: z.string().optional(),
  tasklogs: z.array(TimeLogSchema).optional(),
  buglogs: z.array(TimeLogSchema).optional(),
  generallogs: z.array(TimeLogSchema).optional(),
});

export type TimeLogDateGroup = z.infer<typeof TimeLogDateGroupSchema>;

/**
 * Response wrapper for listing time logs
 */
export const TimeLogListResponseSchema = z.object({
  timelogs: z.object({
    date: z.array(TimeLogDateGroupSchema).optional(),
    grandtotal: z.string().optional(),
    role: z.string().optional(),
  }).optional(),
  // Alternative flat structure for some endpoints
  tasklogs: z.array(TimeLogSchema).optional(),
  buglogs: z.array(TimeLogSchema).optional(),
  generallogs: z.array(TimeLogSchema).optional(),
  page_info: ZohoPageInfoSchema.optional(),
}).passthrough();

export type TimeLogListResponse = z.infer<typeof TimeLogListResponseSchema>;

/**
 * Parameters for listing time logs
 * Note: users_list, view_type, date, bill_status, and component_type are required by Zoho API
 */
export interface TimeLogParams {
  /** Page number (1-indexed) - V3 API */
  page?: number;
  /** Number of items per page - V3 API */
  per_page?: number;
  /** User IDs - use "all" for all users, or comma-separated user IDs */
  users_list: string;
  /** View type for date range */
  view_type: "day" | "week" | "month" | "custom_date";
  /** Date in MM-DD-YYYY format */
  date: string;
  /** Billing status filter */
  bill_status: "All" | "Billable" | "Non Billable";
  /** Component type filter */
  component_type: "task" | "bug" | "general";
}

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS (CREATE/UPDATE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input schema for creating a time log
 */
export const CreateTimeLogInputSchema = z.object({
  /** Date of the log (MM-DD-YYYY format) (required) */
  date: z.string(),
  /** Billing status (required) */
  bill_status: z.enum(["Billable", "Non Billable"]),
  /** Hours logged */
  hours: z.union([z.number(), z.string()]),
  /** Minutes logged (0-59) */
  minutes: z.union([z.number(), z.string()]).optional(),
  /** Notes/description */
  notes: z.string().optional(),
  /** User ID who logged the time */
  owner: z.string().optional(),
  /** Start time (HH:MM format) */
  start_time: z.string().optional(),
  /** End time (HH:MM format) */
  end_time: z.string().optional(),
  /** Approval status */
  set_approval_status: z.enum(["Approved", "Pending", "Rejected"]).optional(),
  /** Custom field values */
  custom_fields: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
});

export type CreateTimeLogInput = z.infer<typeof CreateTimeLogInputSchema>;

/**
 * Input schema for creating a task time log (includes task_id)
 */
export const CreateTaskTimeLogInputSchema = CreateTimeLogInputSchema.extend({
  /** Task ID to log time against (required) */
  task_id: z.string(),
});

export type CreateTaskTimeLogInput = z.infer<typeof CreateTaskTimeLogInputSchema>;

/**
 * Input schema for creating a bug time log (includes bug_id)
 */
export const CreateBugTimeLogInputSchema = CreateTimeLogInputSchema.extend({
  /** Bug ID to log time against (required) */
  bug_id: z.string(),
});

export type CreateBugTimeLogInput = z.infer<typeof CreateBugTimeLogInputSchema>;

/**
 * Input schema for creating a general time log (includes name)
 */
export const CreateGeneralTimeLogInputSchema = CreateTimeLogInputSchema.extend({
  /** Activity name (required) */
  name: z.string().min(1),
});

export type CreateGeneralTimeLogInput = z.infer<typeof CreateGeneralTimeLogInputSchema>;

/**
 * Input schema for updating a time log (all fields optional)
 */
export const UpdateTimeLogInputSchema = CreateTimeLogInputSchema.partial();

export type UpdateTimeLogInput = z.infer<typeof UpdateTimeLogInputSchema>;
