import { z } from "zod";
import { ZohoPageInfoSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// TASK LIST SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Task List from Zoho Projects API
 */
export const TaskListSchema = z.object({
  // Identification
  id: z.number(),
  id_string: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),

  // Status
  completed: z.boolean().optional(),
  is_completed: z.boolean().optional(),

  // Sequence
  sequence: z.number().optional(),

  // Milestone association
  milestone: z.object({
    id: z.number(),
    id_string: z.string().optional(),
    name: z.string(),
  }).optional(),

  // Counts
  task_count: z.object({
    open: z.number(),
    closed: z.number(),
  }).optional(),

  // Project reference
  project: z.object({
    id: z.number(),
    id_string: z.string().optional(),
    name: z.string(),
  }).optional(),

  // Links
  link: z.object({
    self: z.object({ url: z.string() }).optional(),
    task: z.object({ url: z.string() }).optional(),
  }).passthrough().optional(),

  // Timestamps
  created_time: z.string().optional(),
  created_time_long: z.number().optional(),
  last_updated_time: z.string().optional(),
  last_updated_time_long: z.number().optional(),
}).passthrough();

export type TaskList = z.infer<typeof TaskListSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const TaskListListResponseSchema = z.object({
  tasklists: z.array(TaskListSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export type TaskListListResponse = z.infer<typeof TaskListListResponseSchema>;

export const TaskListGetResponseSchema = z.object({
  tasklists: z.array(TaskListSchema),
});

export type TaskListGetResponse = z.infer<typeof TaskListGetResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS (CREATE/UPDATE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input schema for creating a task list
 */
export const CreateTaskListInputSchema = z.object({
  /** Task list name (required) */
  name: z.string().min(1),
  /** Task list description */
  description: z.string().optional(),
  /** Milestone ID to associate with */
  milestone_id: z.string().optional(),
  /** Flag: internal or external */
  flag: z.enum(["internal", "external"]).optional(),
});

export type CreateTaskListInput = z.infer<typeof CreateTaskListInputSchema>;

/**
 * Input schema for updating a task list
 */
export const UpdateTaskListInputSchema = CreateTaskListInputSchema.partial();

export type UpdateTaskListInput = z.infer<typeof UpdateTaskListInputSchema>;
