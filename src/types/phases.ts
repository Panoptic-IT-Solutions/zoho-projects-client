import { z } from "zod";
import { ZohoPageInfoSchema, OwnerRefSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// PHASE (MILESTONE) SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Phase status
 */
export const PhaseStatusSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  color_code: z.string().optional(),
});

export type PhaseStatus = z.infer<typeof PhaseStatusSchema>;

/**
 * Phase (Milestone) from Zoho Projects API
 * Note: Zoho calls these "milestones" in the API response
 */
export const PhaseSchema = z.object({
  // Identification
  id: z.number(),
  id_string: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),

  // Sequence
  sequence: z.number().optional(),

  // Dates
  start_date: z.string().nullable().optional(),
  start_date_long: z.number().nullable().optional(),
  end_date: z.string().nullable().optional(),
  end_date_long: z.number().nullable().optional(),

  // Status
  status: PhaseStatusSchema.optional(),
  status_name: z.string().optional(),
  completed: z.boolean().optional(),
  percent_complete: z.number().optional(),

  // Owner
  owner: OwnerRefSchema.optional(),
  owner_id: z.string().optional(),
  owner_name: z.string().optional(),

  // Flag
  flag: z.enum(["internal", "external"]).optional(),

  // Counts
  open_task_count: z.number().optional(),
  closed_task_count: z.number().optional(),

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

export type Phase = z.infer<typeof PhaseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const PhaseListResponseSchema = z.object({
  milestones: z.array(PhaseSchema),
  page_info: ZohoPageInfoSchema.optional(),
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
