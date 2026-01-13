import { z } from "zod";
import { ZohoPageInfoSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH RESULT SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Search result item from Zoho Projects API
 * Results can be of different entity types
 */
export const SearchResultSchema = z.object({
  // Identification
  id: z.union([z.number(), z.string()]),
  id_string: z.string().optional(),
  name: z.string().optional(),
  title: z.string().optional(),

  // Entity type
  entity_type: z.string(), // "project", "task", "bug", "forum", "milestone", etc.
  module: z.string().optional(),

  // Content
  description: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  snippet: z.string().optional(), // Highlighted search match

  // Project reference
  project: z.object({
    id: z.number(),
    id_string: z.string().optional(),
    name: z.string(),
  }).optional(),

  // Status
  status: z.string().optional(),
  status_name: z.string().optional(),

  // Owner/Creator
  owner_name: z.string().optional(),
  created_by: z.string().optional(),

  // Timestamps
  created_time: z.string().optional(),
  created_time_long: z.number().optional(),
  last_modified_time: z.string().optional(),
  last_modified_time_long: z.number().optional(),

  // Links
  link: z.object({
    self: z.object({ url: z.string() }).optional(),
    web: z.object({ url: z.string() }).optional(),
  }).passthrough().optional(),
}).passthrough();

export type SearchResult = z.infer<typeof SearchResultSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const SearchResponseSchema = z.object({
  results: z.array(SearchResultSchema).optional(),
  search_results: z.array(SearchResultSchema).optional(),
  total_count: z.coerce.number().optional(),
  page_info: ZohoPageInfoSchema.optional(),
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS (QUERY)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Entity types that can be searched
 */
export type SearchableEntityType =
  | "all"
  | "project"
  | "task"
  | "bug"
  | "forum"
  | "milestone"
  | "document"
  | "user";

/**
 * Input schema for search queries
 */
export const SearchQueryInputSchema = z.object({
  /** Search term (required) */
  search_term: z.string().min(1),
  /** Entity type to search within */
  entity_type: z.enum([
    "all",
    "project",
    "task",
    "bug",
    "forum",
    "milestone",
    "document",
    "user",
  ]).optional(),
  /** Project ID to scope search */
  project_id: z.string().optional(),
  /** Status filter */
  status: z.string().optional(),
  /** Owner filter */
  owner: z.string().optional(),
  /** Date range start */
  start_date: z.string().optional(),
  /** Date range end */
  end_date: z.string().optional(),
});

export type SearchQueryInput = z.infer<typeof SearchQueryInputSchema>;
