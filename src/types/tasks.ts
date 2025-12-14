import { z } from "zod";
import { CustomFieldSchema, ZohoPageInfoSchema } from "./common.js";

/**
 * Task status object
 */
export const TaskStatusSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  type: z.string().optional(), // "open" or "closed"
  color_code: z.string().optional(),
});

export type TaskStatus = z.infer<typeof TaskStatusSchema>;

/**
 * Task list reference
 */
export const TaskListRefSchema = z.object({
  id: z.union([z.number(), z.string()]),
  id_string: z.string().optional(),
  name: z.string(),
});

export type TaskListRef = z.infer<typeof TaskListRefSchema>;

/**
 * Task owner/assignee details
 */
export const TaskOwnerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional(),
  zpuid: z.string().optional(),
});

export type TaskOwner = z.infer<typeof TaskOwnerSchema>;

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
 * Task from Zoho Projects API
 */
export const TaskSchema = z.object({
  // Identification
  id: z.number(),
  id_string: z.string(),
  key: z.string().optional(), // e.g., "DC-T666"
  name: z.string(),
  description: z.string().nullable().optional(),

  // Status & Progress
  status: TaskStatusSchema.optional(),
  completed: z.boolean().optional(),
  percent_complete: z.union([z.number(), z.string()]).optional(), // 0-100
  priority: z.string().optional(), // None, Low, Medium, High, or custom

  // Dates - Zoho returns MM-DD-YYYY format strings and epoch timestamps
  start_date: z.string().nullable().optional(),
  start_date_long: z.number().nullable().optional(),
  end_date: z.string().nullable().optional(),
  end_date_long: z.number().nullable().optional(),
  created_time: z.string().optional(),
  created_time_long: z.number().optional(),
  created_time_format: z.string().optional(),
  last_updated_time: z.string().optional(),
  last_updated_time_long: z.number().optional(),

  // Duration & Work
  duration: z.union([z.number(), z.string()]).nullable().optional(),
  duration_type: z.string().optional(), // "days", "hrs", etc.
  work: z.string().nullable().optional(), // Format: "208:00"
  work_type: z.string().optional(), // "work_hrs_per_day", "work_in_percentage", "work_hours"

  // Ownership & Assignment
  created_by: z.union([z.number(), z.string()]).optional(),
  created_person: z.string().optional(),
  details: TaskDetailsSchema.optional(),

  // Organization & Hierarchy
  tasklist: TaskListRefSchema.optional(),
  milestone_id: z.union([z.number(), z.string()]).nullable().optional(),
  parent_task_id: z.union([z.number(), z.string()]).nullable().optional(),
  root_task_id: z.union([z.number(), z.string()]).nullable().optional(),
  isparent: z.boolean().optional(),
  subtasks: z.boolean().optional(),
  depth: z.number().optional(),
  order_sequence: z.number().optional(),

  // Billing
  billingtype: z.string().optional(),
  log_hours: LogHoursSchema.optional(),

  // Project reference
  project: z.object({
    id: z.number(),
    id_string: z.string().optional(),
    name: z.string(),
  }).optional(),

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
