import { z } from "zod";
import { ZohoPageInfoSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// LEAVE SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Leave entry from Zoho Projects API
 */
export const LeaveSchema = z.object({
  // Identification
  id: z.string(),
  id_string: z.string().optional(),

  // User info
  user_id: z.string(),
  user_name: z.string().optional(),
  user_email: z.string().optional(),
  user_zpuid: z.string().optional(),

  // Leave details
  leave_type: z.string().optional(),
  leave_type_id: z.string().optional(),
  reason: z.string().nullable().optional(),

  // Dates
  start_date: z.string(),
  start_date_long: z.number().optional(),
  end_date: z.string(),
  end_date_long: z.number().optional(),

  // Duration
  duration: z.number().optional(), // In days
  half_day: z.boolean().optional(),
  half_day_type: z.enum(["first_half", "second_half"]).optional(),

  // Status
  status: z.enum(["pending", "approved", "rejected", "cancelled"]).optional(),
  approved_by: z.string().nullable().optional(),
  approved_time: z.string().nullable().optional(),

  // Timestamps
  created_time: z.string().optional(),
  created_time_long: z.number().optional(),
  last_modified_time: z.string().optional(),
  last_modified_time_long: z.number().optional(),
}).passthrough();

export type Leave = z.infer<typeof LeaveSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const LeaveListResponseSchema = z.object({
  leaves: z.array(LeaveSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export type LeaveListResponse = z.infer<typeof LeaveListResponseSchema>;

export const LeaveResponseSchema = z.object({
  leaves: z.array(LeaveSchema),
});

export type LeaveResponse = z.infer<typeof LeaveResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS (CREATE/UPDATE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input schema for creating a leave entry
 */
export const CreateLeaveInputSchema = z.object({
  /** User ID (required) */
  user_id: z.string(),
  /** Start date (MM-DD-YYYY format) (required) */
  start_date: z.string(),
  /** End date (MM-DD-YYYY format) (required) */
  end_date: z.string(),
  /** Leave type ID */
  leave_type_id: z.string().optional(),
  /** Reason for leave */
  reason: z.string().optional(),
  /** Is this a half day */
  half_day: z.boolean().optional(),
  /** First or second half of the day */
  half_day_type: z.enum(["first_half", "second_half"]).optional(),
});

export type CreateLeaveInput = z.infer<typeof CreateLeaveInputSchema>;

/**
 * Input schema for updating a leave entry
 */
export const UpdateLeaveInputSchema = z.object({
  /** Start date (MM-DD-YYYY format) */
  start_date: z.string().optional(),
  /** End date (MM-DD-YYYY format) */
  end_date: z.string().optional(),
  /** Leave type ID */
  leave_type_id: z.string().optional(),
  /** Reason for leave */
  reason: z.string().optional(),
  /** Is this a half day */
  half_day: z.boolean().optional(),
  /** First or second half of the day */
  half_day_type: z.enum(["first_half", "second_half"]).optional(),
  /** Approval status (admin only) */
  status: z.enum(["approved", "rejected"]).optional(),
});

export type UpdateLeaveInput = z.infer<typeof UpdateLeaveInputSchema>;
