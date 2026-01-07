import { z } from "zod";
import { OwnerRefSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// TIMER SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Timer from Zoho Projects API
 */
export const TimerSchema = z.object({
  // Identification
  id: z.union([z.number(), z.string()]),
  id_string: z.string().optional(),

  // Status
  status: z.enum(["running", "paused", "stopped"]).optional(),

  // Entity reference (task or issue)
  entity_id: z.string().optional(),
  entity_type: z.enum(["task", "issue"]).optional(),

  // Log reference
  log_id: z.string().optional(),

  // Times
  start_time: z.string().optional(),
  start_time_long: z.number().optional(),
  elapsed_time: z.number().optional(), // in milliseconds
  elapsed_time_string: z.string().optional(),

  // Project
  project_id: z.string().optional(),
  project: z.object({
    id: z.union([z.number(), z.string()]),
    name: z.string(),
  }).optional(),

  // Owner
  owner: OwnerRefSchema.optional(),

  // Notes
  notes: z.string().nullable().optional(),

  // Billing
  bill_status: z.enum(["billable", "non_billable"]).optional(),
}).passthrough();

export type Timer = z.infer<typeof TimerSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const TimerResponseSchema = z.object({
  timers: z.array(TimerSchema).optional(),
  timer: TimerSchema.optional(),
}).passthrough();

export type TimerResponse = z.infer<typeof TimerResponseSchema>;

export const TimerListResponseSchema = z.object({
  timers: z.array(TimerSchema),
}).passthrough();

export type TimerListResponse = z.infer<typeof TimerListResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input schema for starting a timer
 */
export const StartTimerInputSchema = z.object({
  /** Entity ID (task or issue) */
  entity_id: z.string(),
  /** Entity type */
  type: z.enum(["Task", "Issue"]),
  /** Project ID */
  project_id: z.string(),
  /** Optional notes */
  notes: z.string().optional(),
  /** Billing status */
  bill_status: z.enum(["billable", "non_billable"]).optional(),
});

export type StartTimerInput = z.infer<typeof StartTimerInputSchema>;

/**
 * Input schema for stopping a timer
 */
export const StopTimerInputSchema = z.object({
  /** Entity ID (task or issue) */
  entity_id: z.string().optional(),
  /** Entity type */
  type: z.enum(["Task", "Issue"]).optional(),
  /** Project ID */
  project_id: z.string().optional(),
  /** Log ID */
  log_id: z.string().optional(),
  /** Item ID */
  item_id: z.string().optional(),
  /** Log name */
  log_name: z.string().optional(),
  /** Date */
  date: z.string().optional(),
  /** Hours */
  hours: z.string().optional(),
  /** Start time */
  start_time: z.string().optional(),
  /** End time */
  end_time: z.string().optional(),
  /** Billing status */
  bill_status: z.enum(["billable", "non_billable"]).optional(),
  /** Notes */
  notes: z.string().optional(),
});

export type StopTimerInput = z.infer<typeof StopTimerInputSchema>;

/**
 * Input schema for pause/resume timer
 */
export const PauseResumeTimerInputSchema = z.object({
  /** Entity ID (task or issue) */
  entity_id: z.string().optional(),
  /** Entity type */
  type: z.enum(["Task", "Issue"]).optional(),
  /** Log ID */
  log_id: z.string().optional(),
  /** Notes */
  notes: z.string().optional(),
});

export type PauseResumeTimerInput = z.infer<typeof PauseResumeTimerInputSchema>;
