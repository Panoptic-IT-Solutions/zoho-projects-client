import { z } from "zod";
import { ZohoPageInfoSchema, OwnerRefSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dashboard from Zoho Projects API
 */
export const DashboardSchema = z.object({
  // Identification
  id: z.number(),
  id_string: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),

  // Type
  type: z.enum(["personal", "project", "portal"]).optional(),
  is_default: z.boolean().optional(),

  // Owner
  owner: OwnerRefSchema.optional(),
  created_by: OwnerRefSchema.optional(),

  // Visibility
  is_shared: z.boolean().optional(),
  shared_with: z.array(OwnerRefSchema).optional(),

  // Project reference (for project dashboards)
  project: z.object({
    id: z.number(),
    id_string: z.string().optional(),
    name: z.string(),
  }).optional(),

  // Widget count
  widget_count: z.number().optional(),

  // Layout
  layout: z.string().optional(),

  // Links
  link: z.object({
    self: z.object({ url: z.string() }).optional(),
    widgets: z.object({ url: z.string() }).optional(),
  }).passthrough().optional(),

  // Timestamps
  created_time: z.string().optional(),
  created_time_long: z.number().optional(),
  last_modified_time: z.string().optional(),
  last_modified_time_long: z.number().optional(),
}).passthrough();

export type Dashboard = z.infer<typeof DashboardSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const DashboardListResponseSchema = z.object({
  dashboards: z.array(DashboardSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export type DashboardListResponse = z.infer<typeof DashboardListResponseSchema>;

export const DashboardResponseSchema = z.object({
  dashboards: z.array(DashboardSchema),
});

export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS (CREATE/UPDATE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input schema for creating a dashboard
 */
export const CreateDashboardInputSchema = z.object({
  /** Dashboard name (required) */
  name: z.string().min(1),
  /** Dashboard description */
  description: z.string().optional(),
  /** Dashboard type */
  type: z.enum(["personal", "project", "portal"]).optional(),
  /** Whether to set as default */
  is_default: z.boolean().optional(),
  /** User IDs to share with (comma-separated) */
  shared_with: z.string().optional(),
});

export type CreateDashboardInput = z.infer<typeof CreateDashboardInputSchema>;

/**
 * Input schema for updating a dashboard
 */
export const UpdateDashboardInputSchema = CreateDashboardInputSchema.partial();

export type UpdateDashboardInput = z.infer<typeof UpdateDashboardInputSchema>;
