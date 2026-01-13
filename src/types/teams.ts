import { z } from "zod";
import { ZohoPageInfoSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// TEAM SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Team member reference
 */
export const TeamMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional(),
  zpuid: z.string().optional(),
});

export type TeamMember = z.infer<typeof TeamMemberSchema>;

/**
 * Team from Zoho Projects API
 */
export const TeamSchema = z.object({
  // Identification
  id: z.string(),
  id_string: z.string().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),

  // Members
  members: z.array(TeamMemberSchema).optional(),
  members_count: z.coerce.number().optional(),

  // Lead
  lead_id: z.string().optional(),
  lead_name: z.string().optional(),

  // Associated projects
  projects_count: z.coerce.number().optional(),

  // Timestamps
  created_time: z.string().optional(),
  created_time_long: z.number().optional(),
  last_modified_time: z.string().optional(),
  last_modified_time_long: z.number().optional(),
}).passthrough();

export type Team = z.infer<typeof TeamSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const TeamListResponseSchema = z.object({
  teams: z.array(TeamSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export type TeamListResponse = z.infer<typeof TeamListResponseSchema>;

export const TeamResponseSchema = z.object({
  teams: z.array(TeamSchema),
});

export type TeamResponse = z.infer<typeof TeamResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS (CREATE/UPDATE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input schema for creating a team
 */
export const CreateTeamInputSchema = z.object({
  /** Team name (required) */
  name: z.string().min(1),
  /** Team description */
  description: z.string().optional(),
  /** Team lead user ID */
  lead_id: z.string().optional(),
  /** Member user IDs (comma-separated) */
  members: z.string().optional(),
});

export type CreateTeamInput = z.infer<typeof CreateTeamInputSchema>;

/**
 * Input schema for updating a team
 */
export const UpdateTeamInputSchema = CreateTeamInputSchema.partial();

export type UpdateTeamInput = z.infer<typeof UpdateTeamInputSchema>;

/**
 * Input schema for adding members to a team
 */
export const AddTeamMembersInputSchema = z.object({
  /** Member user IDs (comma-separated) */
  members: z.string(),
});

export type AddTeamMembersInput = z.infer<typeof AddTeamMembersInputSchema>;
