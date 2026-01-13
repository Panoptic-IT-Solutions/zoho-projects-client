import { z } from "zod";
import { ZohoPageInfoSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Profile (permission set) from Zoho Projects API
 */
export const ProfileSchema = z.object({
  // Identification
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),

  // Type
  type: z.union([z.string(), z.number()]).optional(),
  is_default: z.boolean().optional(),
  is_system: z.boolean().optional(),

  // User count
  users_count: z.coerce.number().optional(),

  // Timestamps
  created_time: z.string().optional(),
  created_time_long: z.number().optional(),
  last_modified_time: z.string().optional(),
  last_modified_time_long: z.number().optional(),
}).passthrough();

export type Profile = z.infer<typeof ProfileSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const ProfileListResponseSchema = z.object({
  profiles: z.array(ProfileSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export type ProfileListResponse = z.infer<typeof ProfileListResponseSchema>;

export const ProfileResponseSchema = z.object({
  profiles: z.array(ProfileSchema),
});

export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS (CREATE/UPDATE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input schema for creating a profile
 */
export const CreateProfileInputSchema = z.object({
  /** Profile name (required) */
  name: z.string().min(1),
  /** Profile description */
  description: z.string().optional(),
  /** Copy permissions from existing profile */
  copy_from_profile_id: z.string().optional(),
});

export type CreateProfileInput = z.infer<typeof CreateProfileInputSchema>;

/**
 * Input schema for updating a profile
 */
export const UpdateProfileInputSchema = z.object({
  /** Profile name */
  name: z.string().optional(),
  /** Profile description */
  description: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;
