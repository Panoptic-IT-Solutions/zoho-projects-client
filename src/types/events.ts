import { z } from "zod";
import { ZohoPageInfoSchema, OwnerRefSchema } from "./common.js";

// ─────────────────────────────────────────────────────────────────────────────
// EVENT SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Event recurrence pattern
 */
export const EventRecurrenceSchema = z.object({
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
  interval: z.number().optional(),
  count: z.number().optional(),
  until: z.string().optional(),
}).passthrough();

export type EventRecurrence = z.infer<typeof EventRecurrenceSchema>;

/**
 * Event participant
 */
export const EventParticipantSchema = z.object({
  id: z.union([z.number(), z.string()]),
  id_string: z.string().optional(),
  name: z.string(),
  email: z.string().optional(),
  status: z.enum(["accepted", "declined", "tentative", "pending"]).optional(),
}).passthrough();

export type EventParticipant = z.infer<typeof EventParticipantSchema>;

/**
 * Event (Calendar event) from Zoho Projects API
 */
export const EventSchema = z.object({
  // Identification
  id: z.number(),
  id_string: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),

  // Dates
  start_date: z.string().optional(),
  start_date_long: z.number().optional(),
  end_date: z.string().optional(),
  end_date_long: z.number().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),

  // All-day flag
  is_all_day: z.boolean().optional(),

  // Location
  location: z.string().nullable().optional(),

  // Scheduler/Owner
  scheduled_by: OwnerRefSchema.optional(),
  scheduler_name: z.string().optional(),

  // Participants
  participants: z.array(EventParticipantSchema).optional(),

  // Recurrence
  is_recurring: z.boolean().optional(),
  recurrence: EventRecurrenceSchema.optional(),

  // Reminder
  reminder: z.object({
    time: z.number().optional(),
    unit: z.enum(["minutes", "hours", "days"]).optional(),
  }).optional(),

  // Status
  status: z.string().optional(),

  // Flag
  flag: z.enum(["internal", "external"]).optional(),

  // Project reference
  project: z.object({
    id: z.number(),
    id_string: z.string().optional(),
    name: z.string(),
  }).optional(),

  // Links
  link: z.object({
    self: z.object({ url: z.string() }).optional(),
  }).passthrough().optional(),

  // Timestamps
  created_time: z.string().optional(),
  created_time_long: z.number().optional(),
  last_updated_time: z.string().optional(),
  last_updated_time_long: z.number().optional(),
}).passthrough();

export type Event = z.infer<typeof EventSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const EventListResponseSchema = z.object({
  events: z.array(EventSchema),
  page_info: ZohoPageInfoSchema.optional(),
});

export type EventListResponse = z.infer<typeof EventListResponseSchema>;

export const EventResponseSchema = z.object({
  events: z.array(EventSchema),
});

export type EventResponse = z.infer<typeof EventResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// INPUT SCHEMAS (CREATE/UPDATE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input schema for creating an event
 */
export const CreateEventInputSchema = z.object({
  /** Event title (required) */
  title: z.string().min(1),
  /** Event description */
  description: z.string().optional(),
  /** Start date (MM-DD-YYYY format) */
  start_date: z.string().optional(),
  /** End date (MM-DD-YYYY format) */
  end_date: z.string().optional(),
  /** Start time (HH:MM format) */
  start_time: z.string().optional(),
  /** End time (HH:MM format) */
  end_time: z.string().optional(),
  /** Whether this is an all-day event */
  is_all_day: z.boolean().optional(),
  /** Event location */
  location: z.string().optional(),
  /** Participant user IDs (comma-separated) */
  participants: z.string().optional(),
  /** Reminder minutes before event */
  reminder: z.number().optional(),
  /** Flag: internal or external */
  flag: z.enum(["internal", "external"]).optional(),
});

export type CreateEventInput = z.infer<typeof CreateEventInputSchema>;

/**
 * Input schema for updating an event
 */
export const UpdateEventInputSchema = CreateEventInputSchema.partial();

export type UpdateEventInput = z.infer<typeof UpdateEventInputSchema>;
