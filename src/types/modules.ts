import { z } from "zod";
import { ZohoPageInfoSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// MODULE SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Module (entity type) from Zoho Projects API
 */
export const ModuleSchema = z.object({
  // Identification
  id: z.union([z.number(), z.string()]),
  id_string: z.string().optional(),
  name: z.string(),
  api_name: z.string().optional(),
  plural_name: z.string().optional(),

  // Type flags
  is_customized: z.boolean().optional(),
  is_default: z.boolean().optional(),
  is_web_tab: z.boolean().optional(),

  // Status
  is_enabled: z.boolean().optional(),
  is_visible: z.boolean().optional(),

  // Settings
  sequence: z.number().optional(),
  icon: z.string().optional(),
}).passthrough();

export type Module = z.infer<typeof ModuleSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// MODULE FIELD SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Field pick list option
 */
export const FieldPickListOptionSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  value: z.string(),
  sequence: z.number().optional(),
  color_code: z.string().optional(),
}).passthrough();

export type FieldPickListOption = z.infer<typeof FieldPickListOptionSchema>;

/**
 * Module Field from Zoho Projects API
 */
export const ModuleFieldSchema = z.object({
  // Identification
  id: z.union([z.number(), z.string()]),
  id_string: z.string().optional(),
  name: z.string(),
  api_name: z.string().optional(),
  display_name: z.string().optional(),

  // Type
  field_type: z.string(), // text, number, date, picklist, user_picklist, multi_select, etc.
  data_type: z.string().optional(),

  // Flags
  is_custom_field: z.boolean().optional(),
  is_mandatory: z.boolean().optional(),
  is_visible: z.boolean().optional(),
  is_editable: z.boolean().optional(),
  is_searchable: z.boolean().optional(),

  // Sequence
  sequence: z.number().optional(),

  // For picklist fields
  pick_list_values: z.array(FieldPickListOptionSchema).optional(),

  // For number fields
  decimal_places: z.number().optional(),
  max_length: z.number().optional(),

  // Default value
  default_value: z.union([z.string(), z.number(), z.boolean()]).nullable().optional(),

  // Tooltip
  tooltip: z.string().optional(),
}).passthrough();

export type ModuleField = z.infer<typeof ModuleFieldSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const ModuleListResponseSchema = z.object({
  modules: z.array(ModuleSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export type ModuleListResponse = z.infer<typeof ModuleListResponseSchema>;

export const ModuleFieldListResponseSchema = z.object({
  fields: z.array(ModuleFieldSchema),
});

export type ModuleFieldListResponse = z.infer<typeof ModuleFieldListResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Filter for listing modules
 */
export const ModuleFilterInputSchema = z.object({
  is_customized: z.boolean().optional(),
  is_default: z.boolean().optional(),
  is_web_tab: z.boolean().optional(),
});

export type ModuleFilterInput = z.infer<typeof ModuleFilterInputSchema>;
