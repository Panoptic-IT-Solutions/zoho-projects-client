import { z } from "zod";
import { ZohoPageInfoSchema, OwnerRefSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// FOLLOWER SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Follower from Zoho Projects API
 * Followers can be attached to tasks, bugs, forums, milestones, and events
 */
export const FollowerSchema = z.object({
  // User info (extends OwnerRef)
  id: z.union([z.number(), z.string()]),
  id_string: z.string().optional(),
  name: z.string(),
  email: z.string().optional(),
  zpuid: z.string().optional(),

  // Profile
  profile_photo: z.string().optional(),
  profile_url: z.string().optional(),

  // Following metadata
  followed_time: z.string().optional(),
  followed_time_long: z.number().optional(),
}).passthrough();

export type Follower = z.infer<typeof FollowerSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const FollowerListResponseSchema = z.object({
  followers: z.array(FollowerSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export type FollowerListResponse = z.infer<typeof FollowerListResponseSchema>;

export const FollowerResponseSchema = z.object({
  followers: z.array(FollowerSchema),
});

export type FollowerResponse = z.infer<typeof FollowerResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS (ADD/REMOVE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input schema for adding followers
 */
export const AddFollowersInputSchema = z.object({
  /** User IDs to add as followers (comma-separated) */
  followers: z.string().min(1),
});

export type AddFollowersInput = z.infer<typeof AddFollowersInputSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// SUPPORTED ENTITY TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Entity types that support followers
 */
export type FollowableEntityType = "tasks" | "bugs" | "forums" | "milestones" | "events";
