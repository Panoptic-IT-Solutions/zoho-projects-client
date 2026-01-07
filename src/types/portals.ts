import { z } from "zod";
import { ZohoPageInfoSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// PORTAL SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Portal from Zoho Projects API
 */
export const PortalSchema = z.object({
  // Identification
  id: z.union([z.number(), z.string()]),
  id_string: z.string().optional(),
  name: z.string(),

  // Settings
  default: z.boolean().optional(),
  gmt_time_zone: z.string().optional(),
  role: z.string().optional(),

  // Plan info
  plan: z.string().optional(),
  plan_type: z.string().optional(),

  // Locale
  locale: z.object({
    code: z.string().optional(),
    language: z.string().optional(),
    country: z.string().optional(),
  }).optional(),

  // Settings
  settings: z.object({
    company_name: z.string().optional(),
    website_url: z.string().optional(),
    time_zone: z.string().optional(),
    date_format: z.string().optional(),
  }).passthrough().optional(),

  // Links
  link: z.object({
    project: z.object({ url: z.string() }).optional(),
  }).passthrough().optional(),

  // Counts
  project_count: z.object({
    template: z.number().optional(),
    archived: z.number().optional(),
    active: z.number().optional(),
  }).optional(),

  // Availability
  available_projects: z.number().optional(),
  available_users: z.number().optional(),

  // Extensions
  extensions: z.array(z.string()).optional(),
}).passthrough();

export type Portal = z.infer<typeof PortalSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const PortalListResponseSchema = z.object({
  portals: z.array(PortalSchema),
});

export type PortalListResponse = z.infer<typeof PortalListResponseSchema>;

export const PortalResponseSchema = z.object({
  portals: z.array(PortalSchema),
});

export type PortalResponse = z.infer<typeof PortalResponseSchema>;
