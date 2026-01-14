import { z } from "zod";
import { CustomFieldSchema, ZohoPageInfoSchema } from "./common.js";
import { V3UserRefSchema } from "./projects.js";

/**
 * Task status object
 */
export const TaskStatusSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  type: z.string().optional(), // "open" or "closed"
  color_code: z.string().optional(),
  color_hexcode: z.string().optional(), // V3
  is_closed_type: z.boolean().optional(), // V3
}).passthrough();

export type TaskStatus = z.infer<typeof TaskStatusSchema>;

/**
 * Task list reference
 */
export const TaskListRefSchema = z.object({
  id: z.union([z.number(), z.string()]),
  id_string: z.string().optional(),
  name: z.string(),
}).passthrough();

export type TaskListRef = z.infer<typeof TaskListRefSchema>;

/**
 * Task owner/assignee details (legacy format)
 */
export const TaskOwnerSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  zpuid: z.string().optional(),
  zuid: z.union([z.number(), z.string()]).optional(), // V3
  first_name: z.string().optional(), // V3
  last_name: z.string().optional(), // V3
  full_name: z.string().optional(), // V3
}).passthrough();

export type TaskOwner = z.infer<typeof TaskOwnerSchema>;

/**
 * V3 Duration object format
 */
export const V3DurationSchema = z.object({
  type: z.string().optional(),
  value: z.union([z.number(), z.string()]).optional(),
}).passthrough();

/**
 * Task details containing owners
 */
export const TaskDetailsSchema = z.object({
  owners: z.array(TaskOwnerSchema).optional(),
});

export type TaskDetails = z.infer<typeof TaskDetailsSchema>;

/**
 * Log hours summary
 */
export const LogHoursSchema = z.object({
  billable_hours: z.string().optional(),
  non_billable_hours: z.string().optional(),
});

export type LogHours = z.infer<typeof LogHoursSchema>;

/**
 * Task tag
 */
export const TaskTagSchema = z.object({
  id: z.number(),
  name: z.string(),
  color_class: z.string().optional(),
});

export type TaskTag = z.infer<typeof TaskTagSchema>;

/**
 * Task from Zoho Projects API (V3 compatible)
 */
export const TaskSchema = z.object({
  // Identification - V3 uses string IDs
  id: z.union([z.number(), z.string()]),
  id_string: z.string().optional(), // Legacy field, not in V3
  key: z.string().optional(), // e.g., "DC-T666"
  name: z.string(),
  description: z.string().nullable().optional(),

  // Status & Progress
  status: TaskStatusSchema.optional(),
  completed: z.boolean().optional(),
  is_completed: z.boolean().optional(), // V3
  percent_complete: z.union([z.number(), z.string()]).optional(), // 0-100
  priority: z.union([
    z.string(), // Legacy: None, Low, Medium, High, or custom
    z.object({ // V3 format
      id: z.string().optional(),
      name: z.string().optional(),
      color_hexcode: z.string().optional(),
    }).passthrough(),
  ]).optional(),

  // Dates - V3 uses ISO format, legacy uses MM-DD-YYYY
  start_date: z.string().nullable().optional(),
  start_date_long: z.number().nullable().optional(),
  end_date: z.string().nullable().optional(),
  end_date_long: z.number().nullable().optional(),
  created_time: z.string().optional(),
  created_time_long: z.number().optional(),
  created_time_format: z.string().optional(),
  last_updated_time: z.string().optional(),
  last_updated_time_long: z.number().optional(),
  modified_time: z.string().optional(), // V3

  // Duration & Work - V3 returns object format
  duration: z.union([z.number(), z.string(), V3DurationSchema]).nullable().optional(),
  duration_type: z.string().optional(), // "days", "hrs", etc.
  work: z.union([
    z.string(), // Legacy format: "208:00"
    z.object({ // V3 format
      hours: z.union([z.number(), z.string()]).optional(),
      unit: z.string().optional(),
    }).passthrough(),
  ]).nullable().optional(),
  work_type: z.string().optional(), // "work_hrs_per_day", "work_in_percentage", "work_hours"

  // Ownership & Assignment - V3 uses object format
  created_by: z.union([z.number(), z.string(), V3UserRefSchema]).optional(),
  created_person: z.string().optional(),
  owner: z.union([V3UserRefSchema, TaskOwnerSchema]).optional(), // V3
  updated_by: V3UserRefSchema.optional(), // V3
  details: TaskDetailsSchema.optional(),

  // Organization & Hierarchy
  tasklist: TaskListRefSchema.optional(),
  task_list: TaskListRefSchema.optional(), // V3 alternative name
  milestone_id: z.union([z.number(), z.string()]).nullable().optional(),
  milestone: z.object({ // V3 format
    id: z.union([z.number(), z.string()]),
    name: z.string().optional(),
  }).passthrough().nullable().optional(),
  parent_task_id: z.union([z.number(), z.string()]).nullable().optional(),
  parent_task: z.object({ // V3 format
    id: z.union([z.number(), z.string()]),
    name: z.string().optional(),
  }).passthrough().nullable().optional(),
  root_task_id: z.union([z.number(), z.string()]).nullable().optional(),
  isparent: z.boolean().optional(),
  is_parent: z.boolean().optional(), // V3
  subtasks: z.boolean().optional(),
  has_subtasks: z.boolean().optional(), // V3
  depth: z.number().optional(),
  order_sequence: z.number().optional(),

  // Billing
  billingtype: z.string().optional(),
  billing_type: z.string().optional(), // V3
  log_hours: LogHoursSchema.optional(),

  // Project reference - V3 uses string IDs
  project: z.object({
    id: z.union([z.number(), z.string()]),
    id_string: z.string().optional(),
    name: z.string().optional(),
  }).passthrough().optional(),

  // Links
  link: z.object({
    self: z.object({ url: z.string() }).optional(),
    timesheet: z.object({ url: z.string() }).optional(),
  }).passthrough().optional(),

  // Tags & Custom Fields
  tags: z.array(TaskTagSchema).optional(),
  custom_fields: z.array(CustomFieldSchema).optional(),

  // Dependency
  dependency: z.record(z.unknown()).optional(),
  task_followers: z.record(z.unknown()).optional(),
}).passthrough(); // Allow extra fields we haven't documented

export type Task = z.infer<typeof TaskSchema>;

/**
 * Response wrapper for listing tasks
 */
export const TaskListResponseSchema = z.object({
  tasks: z.array(TaskSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export type TaskListResponse = z.infer<typeof TaskListResponseSchema>;

/**
 * Response wrapper for getting a single task
 */
export const TaskResponseSchema = z.object({
  tasks: z.array(TaskSchema),
});

export type TaskResponse = z.infer<typeof TaskResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS (CREATE/UPDATE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input schema for creating a task
 */
export const CreateTaskInputSchema = z.object({
  /** Task name (required) */
  name: z.string().min(1),
  /** Task description */
  description: z.string().optional(),
  /** Task list ID to add task to (legacy) */
  tasklist_id: z.string().optional(),
  /** Task list object (V3 API) - Required for V3 */
  tasklist: z.object({ id: z.string() }).optional(),
  /** Milestone/phase ID (legacy) */
  milestone_id: z.string().optional(),
  /** Milestone object (V3 API) */
  milestone: z.object({ id: z.string() }).optional(),
  /** Parent task ID (for subtasks) */
  parent_task_id: z.string().optional(),
  /** Start date (MM-DD-YYYY format) */
  start_date: z.string().optional(),
  /** End date (MM-DD-YYYY format) */
  end_date: z.string().optional(),
  /** Duration in days */
  duration: z.number().optional(),
  /** Duration type */
  duration_type: z.enum(["days", "hrs"]).optional(),
  /** Priority level */
  priority: z.enum(["None", "Low", "Medium", "High"]).optional(),
  /** Percent complete (0-100) */
  percent_complete: z.number().min(0).max(100).optional(),
  /** Assignee user IDs (comma-separated) */
  persons: z.string().optional(),
  /** Work hours (format: "HH:MM") */
  work: z.string().optional(),
  /** Work type */
  work_type: z.enum(["work_hrs_per_day", "work_in_percentage", "work_hours"]).optional(),
  /** Billing type */
  billingtype: z.enum(["Billable", "Non Billable"]).optional(),
  /** Group name for grouping tasks */
  group_name: z.string().optional(),
  /** Recurrence settings */
  recurrence: z.object({
    frequency: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
    end_date: z.string().optional(),
    occurrences: z.number().optional(),
  }).optional(),
  /** Custom field values */
  custom_fields: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  /** Tags to add/remove */
  tags: z.object({
    add: z.array(z.string()).optional(),
    remove: z.array(z.string()).optional(),
  }).optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>;

/**
 * Input schema for updating a task (all fields optional)
 */
export const UpdateTaskInputSchema = CreateTaskInputSchema.partial();

export type UpdateTaskInput = z.infer<typeof UpdateTaskInputSchema>;
