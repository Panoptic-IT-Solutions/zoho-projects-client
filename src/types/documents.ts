import { z } from "zod";
import { ZohoPageInfoSchema, OwnerRefSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Document folder
 */
export const DocumentFolderSchema = z.object({
  id: z.union([z.number(), z.string()]),
  id_string: z.string().optional(),
  name: z.string(),
  parent_folder_id: z.string().nullable().optional(),
}).passthrough();

export type DocumentFolder = z.infer<typeof DocumentFolderSchema>;

/**
 * Document from Zoho Projects API
 */
export const DocumentSchema = z.object({
  // Identification
  id: z.number(),
  id_string: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),

  // File info
  file_size: z.number().optional(),
  file_size_string: z.string().optional(),
  content_type: z.string().optional(),
  mime_type: z.string().optional(),
  extension: z.string().optional(),

  // Folder
  folder: DocumentFolderSchema.optional(),
  folder_id: z.string().nullable().optional(),

  // Version
  version: z.number().optional(),
  version_string: z.string().optional(),
  is_latest_version: z.boolean().optional(),

  // URLs
  url: z.string().optional(),
  download_url: z.string().optional(),
  preview_url: z.string().optional(),

  // Owner/Uploader
  owner: OwnerRefSchema.optional(),
  uploaded_by: OwnerRefSchema.optional(),
  uploader_name: z.string().optional(),

  // Lock status
  is_locked: z.boolean().optional(),
  locked_by: OwnerRefSchema.optional(),

  // Sharing
  is_shared: z.boolean().optional(),
  shared_with: z.array(OwnerRefSchema).optional(),

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

export type Document = z.infer<typeof DocumentSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const DocumentListResponseSchema = z.object({
  documents: z.array(DocumentSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export type DocumentListResponse = z.infer<typeof DocumentListResponseSchema>;

export const DocumentResponseSchema = z.object({
  documents: z.array(DocumentSchema),
});

export type DocumentResponse = z.infer<typeof DocumentResponseSchema>;

export const DocumentFolderListResponseSchema = z.object({
  folders: z.array(DocumentFolderSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export type DocumentFolderListResponse = z.infer<typeof DocumentFolderListResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS (CREATE/UPDATE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input schema for uploading a document
 * Note: The actual file is passed separately as FormData
 */
export const UploadDocumentInputSchema = z.object({
  /** Document name */
  name: z.string().optional(),
  /** Description */
  description: z.string().optional(),
  /** Folder ID to upload to */
  folder_id: z.string().optional(),
});

export type UploadDocumentInput = z.infer<typeof UploadDocumentInputSchema>;

/**
 * Input schema for updating a document
 */
export const UpdateDocumentInputSchema = z.object({
  /** Document name */
  name: z.string().optional(),
  /** Description */
  description: z.string().optional(),
  /** Folder ID to move to */
  folder_id: z.string().optional(),
});

export type UpdateDocumentInput = z.infer<typeof UpdateDocumentInputSchema>;

/**
 * Input schema for creating a folder
 */
export const CreateDocumentFolderInputSchema = z.object({
  /** Folder name (required) */
  name: z.string().min(1),
  /** Parent folder ID */
  parent_folder_id: z.string().optional(),
});

export type CreateDocumentFolderInput = z.infer<typeof CreateDocumentFolderInputSchema>;

/**
 * Input schema for updating a folder
 */
export const UpdateDocumentFolderInputSchema = CreateDocumentFolderInputSchema.partial();

export type UpdateDocumentFolderInput = z.infer<typeof UpdateDocumentFolderInputSchema>;
