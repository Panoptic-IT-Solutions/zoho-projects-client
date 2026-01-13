import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// WORKDRIVE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * WorkDrive file upload response
 */
export const WorkDriveFileSchema = z.object({
  id: z.string(),
  type: z.string().optional(),
  attributes: z.object({
    name: z.string(),
    type: z.string().optional(),
    extn: z.string().optional(),
    resource_id: z.string().optional(),
    parent_id: z.string().optional(),
    storage_info: z.object({
      size: z.string().optional(),
      files_count: z.string().optional(),
      folders_count: z.string().optional(),
    }).optional(),
    download_url: z.string().optional(),
    permalink: z.string().optional(),
    created_time: z.string().optional(),
    modified_time: z.string().optional(),
  }).passthrough(),
}).passthrough();

export type WorkDriveFile = z.infer<typeof WorkDriveFileSchema>;

/**
 * WorkDrive upload response schema
 */
export const WorkDriveUploadResponseSchema = z.object({
  data: z.array(WorkDriveFileSchema),
}).passthrough();

export type WorkDriveUploadResponse = z.infer<typeof WorkDriveUploadResponseSchema>;

/**
 * WorkDrive team folder schema
 */
export const WorkDriveTeamFolderSchema = z.object({
  id: z.string(),
  type: z.string().optional(),
  attributes: z.object({
    name: z.string(),
    is_default: z.boolean().optional(),
    parent_id: z.string().optional(),
  }).passthrough(),
}).passthrough();

export type WorkDriveTeamFolder = z.infer<typeof WorkDriveTeamFolderSchema>;

/**
 * WorkDrive team schema
 */
export const WorkDriveTeamSchema = z.object({
  id: z.string(),
  type: z.string().optional(),
  attributes: z.object({
    name: z.string(),
  }).passthrough(),
}).passthrough();

export type WorkDriveTeam = z.infer<typeof WorkDriveTeamSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input for uploading a file to WorkDrive
 */
export const WorkDriveUploadInputSchema = z.object({
  /** Parent folder ID in WorkDrive */
  parent_id: z.string(),
  /** Optional custom filename (URL-encoded with UTF-8) */
  filename: z.string().optional(),
  /** If true, overwrites existing file with same name as new version */
  override_name_exist: z.boolean().optional(),
});

export type WorkDriveUploadInput = z.infer<typeof WorkDriveUploadInputSchema>;
