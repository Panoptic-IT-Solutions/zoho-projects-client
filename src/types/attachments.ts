import { z } from "zod";
import { ZohoPageInfoSchema, OwnerRefSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// ATTACHMENT SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Attachment from Zoho Projects API
 */
export const AttachmentSchema = z.object({
  // Identification
  id: z.number(),
  id_string: z.string(),
  name: z.string(),
  filename: z.string().optional(),

  // File info
  file_size: z.number().optional(),
  file_size_string: z.string().optional(),
  content_type: z.string().optional(),
  mime_type: z.string().optional(),
  extension: z.string().optional(),

  // URLs
  url: z.string().optional(),
  download_url: z.string().optional(),
  preview_url: z.string().optional(),
  thumbnail_url: z.string().optional(),

  // Owner/Uploader
  owner: OwnerRefSchema.optional(),
  uploaded_by: OwnerRefSchema.optional(),
  uploader_name: z.string().optional(),

  // Associated entity
  entity_type: z.string().optional(), // "task", "bug", "forum", etc.
  entity_id: z.string().optional(),
  entity_name: z.string().optional(),

  // Project reference
  project: z.object({
    id: z.number(),
    id_string: z.string().optional(),
    name: z.string(),
  }).optional(),

  // Links
  link: z.object({
    self: z.object({ url: z.string() }).optional(),
    download: z.object({ url: z.string() }).optional(),
  }).passthrough().optional(),

  // Timestamps
  created_time: z.string().optional(),
  created_time_long: z.number().optional(),
  last_modified_time: z.string().optional(),
  last_modified_time_long: z.number().optional(),
}).passthrough();

export type Attachment = z.infer<typeof AttachmentSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const AttachmentListResponseSchema = z.object({
  attachments: z.array(AttachmentSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export type AttachmentListResponse = z.infer<typeof AttachmentListResponseSchema>;

export const AttachmentResponseSchema = z.object({
  attachments: z.array(AttachmentSchema),
});

export type AttachmentResponse = z.infer<typeof AttachmentResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS (UPLOAD)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input schema for uploading an attachment
 * Note: The actual file is passed separately as FormData
 */
export const UploadAttachmentInputSchema = z.object({
  /** File name override */
  name: z.string().optional(),
  /** Description */
  description: z.string().optional(),
  /** Associated entity type */
  entity_type: z.enum(["task", "bug", "forum", "project"]).optional(),
  /** Associated entity ID */
  entity_id: z.string().optional(),
});

export type UploadAttachmentInput = z.infer<typeof UploadAttachmentInputSchema>;
