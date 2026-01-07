import { z } from "zod";
import { ZohoPageInfoSchema, CustomFieldSchema, OwnerRefSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// ISSUE (BUG) SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Issue status
 */
export const IssueStatusSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  type: z.string().optional(), // "open" or "closed"
  color_code: z.string().optional(),
});

export type IssueStatus = z.infer<typeof IssueStatusSchema>;

/**
 * Issue severity
 */
export const IssueSeveritySchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
});

export type IssueSeverity = z.infer<typeof IssueSeveritySchema>;

/**
 * Issue classification
 */
export const IssueClassificationSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
});

export type IssueClassification = z.infer<typeof IssueClassificationSchema>;

/**
 * Issue module
 */
export const IssueModuleSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
});

export type IssueModule = z.infer<typeof IssueModuleSchema>;

/**
 * Issue (Bug) from Zoho Projects API
 * Note: Zoho calls these "bugs" in the API
 */
export const IssueSchema = z.object({
  // Identification
  id: z.number(),
  id_string: z.string(),
  key: z.string().optional(), // e.g., "PROJ-B1"
  title: z.string(),
  description: z.string().nullable().optional(),

  // Status & Classification
  status: IssueStatusSchema.optional(),
  severity: IssueSeveritySchema.optional(),
  classification: IssueClassificationSchema.optional(),
  reproducible: z.enum(["Always", "Sometimes", "Rarely", "Unable"]).optional(),
  module: IssueModuleSchema.optional(),

  // Priority
  priority: z.string().optional(),

  // Dates
  due_date: z.string().nullable().optional(),
  due_date_long: z.number().nullable().optional(),
  created_time: z.string().optional(),
  created_time_long: z.number().optional(),
  last_updated_time: z.string().optional(),
  last_updated_time_long: z.number().optional(),
  closed_time: z.string().nullable().optional(),
  closed_time_long: z.number().nullable().optional(),

  // Reporter
  reported_by: z.string().optional(),
  reported_person: z.string().optional(),
  reporter: OwnerRefSchema.optional(),

  // Assignee
  assignee: OwnerRefSchema.optional(),
  assignee_name: z.string().optional(),

  // Milestone
  milestone: z.object({
    id: z.number(),
    id_string: z.string().optional(),
    name: z.string(),
  }).nullable().optional(),

  // Flag
  flag: z.enum(["internal", "external"]).optional(),

  // Project reference
  project: z.object({
    id: z.number(),
    id_string: z.string().optional(),
    name: z.string(),
  }).optional(),

  // Linked tasks
  linked_tasks_count: z.number().optional(),

  // Attachments
  attachment_count: z.number().optional(),

  // Comments
  comment_count: z.number().optional(),

  // Links
  link: z.object({
    self: z.object({ url: z.string() }).optional(),
    timesheet: z.object({ url: z.string() }).optional(),
  }).passthrough().optional(),

  // Custom fields
  custom_fields: z.array(CustomFieldSchema).optional(),
}).passthrough();

export type Issue = z.infer<typeof IssueSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const IssueListResponseSchema = z.object({
  bugs: z.array(IssueSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export type IssueListResponse = z.infer<typeof IssueListResponseSchema>;

export const IssueResponseSchema = z.object({
  bugs: z.array(IssueSchema),
});

export type IssueResponse = z.infer<typeof IssueResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS (CREATE/UPDATE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input schema for creating an issue/bug
 */
export const CreateIssueInputSchema = z.object({
  /** Issue title (required) */
  title: z.string().min(1),
  /** Issue description */
  description: z.string().optional(),
  /** Assignee user ID */
  assignee: z.string().optional(),
  /** Due date (MM-DD-YYYY format) */
  due_date: z.string().optional(),
  /** Priority */
  priority: z.enum(["None", "Low", "Medium", "High"]).optional(),
  /** Status ID */
  status_id: z.string().optional(),
  /** Severity ID */
  severity_id: z.string().optional(),
  /** Classification ID */
  classification_id: z.string().optional(),
  /** Module ID */
  module_id: z.string().optional(),
  /** Reproducibility */
  reproducible: z.enum(["Always", "Sometimes", "Rarely", "Unable"]).optional(),
  /** Milestone ID */
  milestone_id: z.string().optional(),
  /** Flag: internal or external */
  flag: z.enum(["internal", "external"]).optional(),
  /** Custom field values */
  custom_fields: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
});

export type CreateIssueInput = z.infer<typeof CreateIssueInputSchema>;

/**
 * Input schema for updating an issue/bug
 */
export const UpdateIssueInputSchema = CreateIssueInputSchema.partial();

export type UpdateIssueInput = z.infer<typeof UpdateIssueInputSchema>;
