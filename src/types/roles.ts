import { z } from "zod";
import { ZohoPageInfoSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// ROLE SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Role from Zoho Projects API
 */
export const RoleSchema = z.object({
  // Identification
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),

  // Type
  type: z.enum(["admin", "manager", "employee", "contractor", "client", "custom"]).optional(),
  is_default: z.boolean().optional(),
  is_system: z.boolean().optional(),

  // Permissions reference
  permissions: z.record(z.boolean()).optional(),

  // Timestamps
  created_time: z.string().optional(),
  created_time_long: z.number().optional(),
  last_modified_time: z.string().optional(),
  last_modified_time_long: z.number().optional(),
}).passthrough();

export type Role = z.infer<typeof RoleSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const RoleListResponseSchema = z.object({
  roles: z.array(RoleSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export type RoleListResponse = z.infer<typeof RoleListResponseSchema>;

export const RoleResponseSchema = z.object({
  roles: z.array(RoleSchema),
});

export type RoleResponse = z.infer<typeof RoleResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS (CREATE/UPDATE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input schema for creating a role
 */
export const CreateRoleInputSchema = z.object({
  /** Role name (required) */
  name: z.string().min(1),
  /** Role description */
  description: z.string().optional(),
  /** Copy permissions from existing role */
  copy_from_role_id: z.string().optional(),
});

export type CreateRoleInput = z.infer<typeof CreateRoleInputSchema>;

/**
 * Input schema for updating a role
 */
export const UpdateRoleInputSchema = z.object({
  /** Role name */
  name: z.string().optional(),
  /** Role description */
  description: z.string().optional(),
});

export type UpdateRoleInput = z.infer<typeof UpdateRoleInputSchema>;
