import { z } from "zod";
import { ZohoPageInfoSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Contact from Zoho Projects API
 */
export const ContactSchema = z.object({
  // Identification
  id: z.string(),
  id_string: z.string().optional(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  name: z.string().optional(), // Full name

  // Contact info
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  mobile: z.string().nullable().optional(),

  // Role
  designation: z.string().nullable().optional(),
  department: z.string().nullable().optional(),

  // Associated client
  client_id: z.string().nullable().optional(),
  client_name: z.string().nullable().optional(),

  // Address
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  zip_code: z.string().nullable().optional(),

  // Timestamps
  created_time: z.string().optional(),
  created_time_long: z.number().optional(),
  last_modified_time: z.string().optional(),
  last_modified_time_long: z.number().optional(),
}).passthrough();

export type Contact = z.infer<typeof ContactSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const ContactListResponseSchema = z.object({
  contacts: z.array(ContactSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export type ContactListResponse = z.infer<typeof ContactListResponseSchema>;

export const ContactResponseSchema = z.object({
  contacts: z.array(ContactSchema),
});

export type ContactResponse = z.infer<typeof ContactResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS (CREATE/UPDATE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input schema for creating a contact
 */
export const CreateContactInputSchema = z.object({
  /** First name (required) */
  first_name: z.string().min(1),
  /** Last name */
  last_name: z.string().optional(),
  /** Email address */
  email: z.string().email().optional(),
  /** Phone number */
  phone: z.string().optional(),
  /** Mobile number */
  mobile: z.string().optional(),
  /** Job title */
  designation: z.string().optional(),
  /** Department */
  department: z.string().optional(),
  /** Associated client ID */
  client_id: z.string().optional(),
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
});

export type CreateContactInput = z.infer<typeof CreateContactInputSchema>;

/**
 * Input schema for updating a contact
 */
export const UpdateContactInputSchema = CreateContactInputSchema.partial();

export type UpdateContactInput = z.infer<typeof UpdateContactInputSchema>;
