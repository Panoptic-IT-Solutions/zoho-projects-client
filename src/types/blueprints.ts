import { z } from "zod";
import { ZohoPageInfoSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// BLUEPRINT SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Blueprint field value
 */
export const BlueprintFieldValueSchema = z.object({
  id: z.union([z.number(), z.string()]),
  value: z.union([z.string(), z.number(), z.array(z.string()), z.array(z.number())]).optional(),
  is_days: z.boolean().optional(),
  attachment_ids: z.array(z.string()).optional(),
}).passthrough();

export type BlueprintFieldValue = z.infer<typeof BlueprintFieldValueSchema>;

/**
 * Blueprint transition action
 */
export const BlueprintTransitionActionSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  type: z.string().optional(),
  is_mandatory: z.boolean().optional(),
  field_id: z.string().optional(),
  field_type: z.string().optional(),
}).passthrough();

export type BlueprintTransitionAction = z.infer<typeof BlueprintTransitionActionSchema>;

/**
 * Blueprint transition
 */
export const BlueprintTransitionSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),

  // Source and target status
  source_status: z.object({
    id: z.union([z.number(), z.string()]),
    name: z.string(),
  }).optional(),
  target_status: z.object({
    id: z.union([z.number(), z.string()]),
    name: z.string(),
  }).optional(),

  // Actions
  before_actions: z.array(BlueprintTransitionActionSchema).optional(),
  during_actions: z.array(BlueprintTransitionActionSchema).optional(),
  after_actions: z.array(BlueprintTransitionActionSchema).optional(),

  // Permissions
  execution_type: z.string().optional(),
  executor_users: z.array(z.string()).optional(),
}).passthrough();

export type BlueprintTransition = z.infer<typeof BlueprintTransitionSchema>;

/**
 * Blueprint from Zoho Projects API
 */
export const BlueprintSchema = z.object({
  // Identification
  id: z.union([z.number(), z.string()]),
  id_string: z.string().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),

  // Module
  module_id: z.string().optional(),
  module_name: z.string().optional(),

  // Status
  is_active: z.boolean().optional(),

  // Transitions
  transitions: z.array(BlueprintTransitionSchema).optional(),

  // Timestamps
  created_time: z.string().optional(),
  created_time_long: z.number().optional(),
  last_modified_time: z.string().optional(),
  last_modified_time_long: z.number().optional(),
}).passthrough();

export type Blueprint = z.infer<typeof BlueprintSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// NEXT TRANSITIONS RESPONSE
// ─────────────────────────────────────────────────────────────────────────────

export const NextTransitionsResponseSchema = z.object({
  transitions: z.array(BlueprintTransitionSchema),
  blueprint: z.object({
    id: z.union([z.number(), z.string()]),
    name: z.string(),
  }).optional(),
}).passthrough();

export type NextTransitionsResponse = z.infer<typeof NextTransitionsResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// DURING ACTIONS RESPONSE
// ─────────────────────────────────────────────────────────────────────────────

export const DuringActionsResponseSchema = z.object({
  actions: z.array(BlueprintTransitionActionSchema),
}).passthrough();

export type DuringActionsResponse = z.infer<typeof DuringActionsResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const BlueprintListResponseSchema = z.object({
  blueprints: z.array(BlueprintSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export type BlueprintListResponse = z.infer<typeof BlueprintListResponseSchema>;

export const BlueprintResponseSchema = z.object({
  blueprints: z.array(BlueprintSchema),
});

export type BlueprintResponse = z.infer<typeof BlueprintResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input schema for executing a blueprint transition
 */
export const ExecuteTransitionInputSchema = z.object({
  /** Entity ID (task or issue) */
  entity_id: z.string(),
  /** Skip bug validation */
  skip_bug_validation: z.boolean().optional(),
  /** Field values for the transition */
  field_values: z.array(BlueprintFieldValueSchema).optional(),
});

export type ExecuteTransitionInput = z.infer<typeof ExecuteTransitionInputSchema>;

/**
 * Blueprint module type
 */
export type BlueprintModuleType = "Task" | "Issue";
