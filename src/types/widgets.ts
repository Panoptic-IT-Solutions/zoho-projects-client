import { z } from "zod";
import { ZohoPageInfoSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// WIDGET SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Widget configuration
 */
export const WidgetConfigSchema = z.object({
  chart_type: z.string().optional(),
  data_source: z.string().optional(),
  filters: z.record(z.unknown()).optional(),
  display_options: z.record(z.unknown()).optional(),
}).passthrough();

export type WidgetConfig = z.infer<typeof WidgetConfigSchema>;

/**
 * Widget from Zoho Projects API
 * Widgets are nested under dashboards
 */
export const WidgetSchema = z.object({
  // Identification
  id: z.number(),
  id_string: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),

  // Type
  type: z.string().optional(), // "chart", "list", "summary", etc.
  widget_type: z.string().optional(),

  // Position and size
  position: z.object({
    row: z.number().optional(),
    col: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  }).optional(),

  // Configuration
  config: WidgetConfigSchema.optional(),
  settings: z.record(z.unknown()).optional(),

  // Dashboard reference
  dashboard_id: z.string().optional(),

  // Links
  link: z.object({
    self: z.object({ url: z.string() }).optional(),
  }).passthrough().optional(),

  // Timestamps
  created_time: z.string().optional(),
  created_time_long: z.number().optional(),
  last_modified_time: z.string().optional(),
  last_modified_time_long: z.number().optional(),
}).passthrough();

export type Widget = z.infer<typeof WidgetSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const WidgetListResponseSchema = z.object({
  widgets: z.array(WidgetSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export type WidgetListResponse = z.infer<typeof WidgetListResponseSchema>;

export const WidgetResponseSchema = z.object({
  widgets: z.array(WidgetSchema),
});

export type WidgetResponse = z.infer<typeof WidgetResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS (CREATE/UPDATE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input schema for creating a widget
 */
export const CreateWidgetInputSchema = z.object({
  /** Widget name (required) */
  name: z.string().min(1),
  /** Widget description */
  description: z.string().optional(),
  /** Widget type */
  type: z.string().optional(),
  /** Widget position */
  position: z.object({
    row: z.number().optional(),
    col: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  }).optional(),
  /** Widget configuration */
  config: z.record(z.unknown()).optional(),
});

export type CreateWidgetInput = z.infer<typeof CreateWidgetInputSchema>;

/**
 * Input schema for updating a widget
 */
export const UpdateWidgetInputSchema = CreateWidgetInputSchema.partial();

export type UpdateWidgetInput = z.infer<typeof UpdateWidgetInputSchema>;
