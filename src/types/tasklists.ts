import { z } from "zod";
import { ZohoPageInfoSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// TASK LIST SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * V3 Sequence object (different from V2 which was just a number)
 */
export const TaskListSequenceSchema = z.object({
  milestone_sequence: z.number().optional(),
  project_sequence: z.number().optional(),
}).passthrough();

/**
 * Task List from Zoho Projects V3 API
 * Note: V3 returns IDs as strings, not numbers
 */
export const TaskListSchema = z.object({
  // Identification - V3 uses string IDs, coerce handles both string and number
  id: z.coerce.string(),
  name: z.string(),
  description: z.string().nullable().optional(),

  // Status
  completed: z.boolean().optional(),
  is_completed: z.boolean().optional(),
  flag: z.string().optional(), // "internal" | "external"
  status: z.string().optional(), // "active" | "completed"

  // Sequence - V3 returns object, not number
  sequence: z.union([
    z.number(),
    TaskListSequenceSchema,
  ]).optional(),

  // Milestone association - V3 uses string IDs
  milestone: z.object({
    id: z.coerce.string(),
    name: z.string(),
  }).passthrough().optional(),

  // Counts
  task_count: z.object({
    open: z.coerce.number(),
    closed: z.coerce.number(),
  }).optional(),

  // Project reference - V3 uses string IDs
  project: z.object({
    id: z.coerce.string(),
    name: z.string(),
  }).passthrough().optional(),

  // Links
  link: z.object({
    self: z.object({ url: z.string() }).optional(),
    task: z.object({ url: z.string() }).optional(),
  }).passthrough().optional(),

  // V3 specific fields
  created_via: z.string().optional(),
  created_by: z.object({
    zuid: z.union([z.string(), z.number()]).optional(),
    zpuid: z.string().optional(),
    name: z.string().optional(),
    email: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
  }).passthrough().optional(),
  meta_info: z.object({
    is_completed: z.boolean().optional(),
    is_rolled: z.boolean().optional(),
    is_general: z.boolean().optional(),
    has_comments: z.boolean().optional(),
    is_none_milestone_tasklist: z.boolean().optional(),
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
