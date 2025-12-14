import { z } from "zod";
import { ZohoPageInfoSchema } from "./common.js";

/**
 * User role - Zoho has many role types including custom ones
 */
export const UserRoleSchema = z.string();

export type UserRole = z.infer<typeof UserRoleSchema>;

/**
 * User from Zoho Projects API
 */
export const UserSchema = z.object({
  // Identification
  id: z.string(),
  zpuid: z.string().optional(),
  name: z.string(),
  email: z.string(),

  // Status
  active: z.boolean().optional(),

  // Role & Profile
  role: UserRoleSchema.optional(),
  role_name: z.string().optional(),
  role_id: z.string().optional(),
  profile_id: z.string().optional(),
  profile_name: z.string().optional(),
  profile_type: z.union([z.string(), z.number()]).optional(),

  // Billing & Budget
  rate: z.union([z.string(), z.number()]).nullable().optional(), // Hourly rate
  cost_per_hour: z.union([z.string(), z.number()]).nullable().optional(),
  user_budget: z.union([z.string(), z.number()]).nullable().optional(),
  revenue_budget: z.union([z.string(), z.number()]).nullable().optional(),
  budget_threshold: z.union([z.string(), z.number()]).nullable().optional(),
  invoice: z.string().nullable().optional(),
  currency_code: z.string().optional(),

  // Client-specific fields
  client_company_name: z.string().nullable().optional(),
  client_company_id: z.string().nullable().optional(),

  // Project associations
  associated_projects: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })).optional(),

  // Timestamps
  added_time: z.string().optional(),
  added_time_long: z.number().optional(),
}).passthrough(); // Allow extra fields we haven't documented

export type User = z.infer<typeof UserSchema>;

/**
 * Response wrapper for listing portal users
 */
export const UserListResponseSchema = z.object({
  users: z.array(UserSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export type UserListResponse = z.infer<typeof UserListResponseSchema>;

/**
 * Response wrapper for getting a single user
 */
export const UserResponseSchema = z.object({
  users: z.array(UserSchema),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;

/**
 * Response wrapper for listing project users
 */
export const ProjectUserListResponseSchema = z.object({
  users: z.array(UserSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export type ProjectUserListResponse = z.infer<typeof ProjectUserListResponseSchema>;
