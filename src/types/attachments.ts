import { z } from "zod";
import { ZohoPageInfoSchema, OwnerRefSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// ATTACHMENT SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Attachment from Zoho Projects V3 API
 * Note: V3 returns IDs as strings
 */
export const AttachmentSchema = z.object({
  // Identification - V3 uses string IDs, coerce handles both string and number
  id: z.coerce.string(),
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

  // Project reference - V3 uses string IDs
  project: z.object({
    id: z.coerce.string(),
    name: z.string(),
  }).passthrough().optional(),

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

/**
 * V3 API returns "attachment" (singular) as the key, not "attachments"
 * Handle both formats with a union
 */
const V3AttachmentListResponseSchema = z.object({
  attachment: z.array(AttachmentSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

const LegacyAttachmentListResponseSchema = z.object({
  attachments: z.array(AttachmentSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export const AttachmentListResponseSchema = z.union([
  V3AttachmentListResponseSchema,
  LegacyAttachmentListResponseSchema,
]);

export type AttachmentListResponse = z.infer<typeof AttachmentListResponseSchema>;

export const AttachmentResponseSchema = z.object({
  attachments: z.array(AttachmentSchema),
});

export type AttachmentResponse = z.infer<typeof AttachmentResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS (UPLOAD)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input schema for uploading an attachment (legacy API)
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

/**
 * V3 API list attachments parameters
 * Note: V3 requires entity_type and entity_id for listing
 */
export const ListAttachmentsParamsSchema = z.object({
  /** Entity type (required for V3) */
  entity_type: z.enum(["task", "bug", "forum", "project"]),
  /** Entity ID (required for V3) */
  entity_id: z.string(),
  /** Page number (1-based) */
  page: z.number().optional(),
  /** Results per page */
  per_page: z.number().optional(),
});

export type ListAttachmentsParams = z.infer<typeof ListAttachmentsParamsSchema>;

/**
 * V3 API associate attachment input
 */
export const AssociateAttachmentInputSchema = z.object({
  /** Entity type to associate with */
  entity_type: z.enum(["task", "bug", "forum"]),
  /** Entity ID to associate with */
  entity_id: z.string(),
});

export type AssociateAttachmentInput = z.infer<typeof AssociateAttachmentInputSchema>;

/**
 * V3 API add attachments to entity input
 */
export const AddAttachmentsToEntityInputSchema = z.object({
  /** Array of attachment IDs to add */
  attachment_ids: z.array(z.string()),
});

export type AddAttachmentsToEntityInput = z.infer<typeof AddAttachmentsToEntityInputSchema>;
