import { z } from "zod";
import { ZohoPageInfoSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT/CUSTOMER SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Client/Customer from Zoho Projects API
 */
export const ClientSchema = z.object({
  // Identification
  id: z.string(),
  id_string: z.string().optional(),
  name: z.string(),

  // Contact info
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  website: z.string().nullable().optional(),

  // Address
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  zip_code: z.string().nullable().optional(),

  // Billing
  currency_code: z.string().optional(),

  // Associations
  projects_count: z.number().optional(),
  contacts_count: z.number().optional(),

  // Timestamps
  created_time: z.string().optional(),
  created_time_long: z.number().optional(),
  last_modified_time: z.string().optional(),
  last_modified_time_long: z.number().optional(),
}).passthrough();

export type Client = z.infer<typeof ClientSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const ClientListResponseSchema = z.object({
  clients: z.array(ClientSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export type ClientListResponse = z.infer<typeof ClientListResponseSchema>;

export const ClientResponseSchema = z.object({
  clients: z.array(ClientSchema),
});

export type ClientResponse = z.infer<typeof ClientResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS (CREATE/UPDATE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input schema for creating a client
 */
export const CreateClientInputSchema = z.object({
  /** Client/company name (required) */
  name: z.string().min(1),
  /** Email address */
  email: z.string().email().optional(),
  /** Phone number */
  phone: z.string().optional(),
  /** Website URL */
  website: z.string().url().optional(),
  /** Street address */
  address: z.string().optional(),
  /** City */
  city: z.string().optional(),
  /** State/province */
  state: z.string().optional(),
  /** Country */
  country: z.string().optional(),
  /** ZIP/postal code */
  zip_code: z.string().optional(),
  /** Currency code (e.g., "USD") */
  currency_code: z.string().optional(),
});

export type CreateClientInput = z.infer<typeof CreateClientInputSchema>;

/**
 * Input schema for updating a client
 */
export const UpdateClientInputSchema = CreateClientInputSchema.partial();

export type UpdateClientInput = z.infer<typeof UpdateClientInputSchema>;
