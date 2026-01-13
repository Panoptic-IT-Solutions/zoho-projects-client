import { z } from "zod";
import { ZohoPageInfoSchema, OwnerRefSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// REPORT SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Report filter configuration
 */
export const ReportFilterSchema = z.object({
  field: z.string(),
  operator: z.string(),
  value: z.unknown(),
}).passthrough();

export type ReportFilter = z.infer<typeof ReportFilterSchema>;

/**
 * Report column configuration
 */
export const ReportColumnSchema = z.object({
  field: z.string(),
  label: z.string().optional(),
  width: z.number().optional(),
  sortable: z.boolean().optional(),
}).passthrough();

export type ReportColumn = z.infer<typeof ReportColumnSchema>;

/**
 * Report from Zoho Projects API
 * Reports are typically read-only with specialized query parameters
 */
export const ReportSchema = z.object({
  // Identification
  id: z.number(),
  id_string: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),

  // Type
  type: z.string().optional(), // "task", "bug", "timelog", "project", etc.
  report_type: z.string().optional(),
  category: z.string().optional(),

  // Visibility
  is_public: z.boolean().optional(),
  is_shared: z.boolean().optional(),
  is_system: z.boolean().optional(),

  // Owner
  owner: OwnerRefSchema.optional(),
  created_by: OwnerRefSchema.optional(),

  // Configuration
  filters: z.array(ReportFilterSchema).optional(),
  columns: z.array(ReportColumnSchema).optional(),
  group_by: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(["asc", "desc"]).optional(),

  // Project reference (for project-scoped reports)
  project: z.object({
    id: z.number(),
    id_string: z.string().optional(),
    name: z.string(),
  }).optional(),

  // Links
  link: z.object({
    self: z.object({ url: z.string() }).optional(),
    export: z.object({ url: z.string() }).optional(),
  }).passthrough().optional(),

  // Timestamps
  created_time: z.string().optional(),
  created_time_long: z.number().optional(),
  last_modified_time: z.string().optional(),
  last_modified_time_long: z.number().optional(),
}).passthrough();

export type Report = z.infer<typeof ReportSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const ReportListResponseSchema = z.object({
  reports: z.array(ReportSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export type ReportListResponse = z.infer<typeof ReportListResponseSchema>;

export const ReportResponseSchema = z.object({
  reports: z.array(ReportSchema),
});

export type ReportResponse = z.infer<typeof ReportResponseSchema>;

/**
 * Report data row
 */
export const ReportDataRowSchema = z.record(z.unknown());

export type ReportDataRow = z.infer<typeof ReportDataRowSchema>;

/**
 * Report data response (when executing a report)
 */
export const ReportDataResponseSchema = z.object({
  data: z.array(ReportDataRowSchema),
  columns: z.array(ReportColumnSchema).optional(),
  total_count: z.coerce.number().optional(),
  page_info: ZohoPageInfoSchema.optional(),
});

export type ReportDataResponse = z.infer<typeof ReportDataResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS (QUERY)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input schema for querying report data
 */
export const ReportQueryInputSchema = z.object({
  /** Filters to apply */
  filters: z.array(ReportFilterSchema).optional(),
  /** Column to sort by */
  sort_by: z.string().optional(),
  /** Sort order */
  sort_order: z.enum(["asc", "desc"]).optional(),
  /** Column to group by */
  group_by: z.string().optional(),
  /** Date range start */
  start_date: z.string().optional(),
  /** Date range end */
  end_date: z.string().optional(),
});

export type ReportQueryInput = z.infer<typeof ReportQueryInputSchema>;
