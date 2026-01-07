/**
 * Unit tests for events API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import {
  createEventFixture,
  createEventListFixture,
  createEventListResponse,
} from "../../fixtures/events.js";

const TEST_PORTAL_ID = "12345";
const TEST_PROJECT_ID = "67890";
const BASE_URL = `https://projectsapi.zoho.com/restapi/portal/${TEST_PORTAL_ID}/projects/${TEST_PROJECT_ID}`;

describe("events", () => {
  let client: ReturnType<typeof createZohoProjectsClient>;

  beforeEach(() => {
    client = createZohoProjectsClient({
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
      refreshToken: "test-refresh-token",
      portalId: TEST_PORTAL_ID,
    });
  });

  describe("list", () => {
    it("should list events for a project", async () => {
      const mockEvents = createEventListFixture(3);

      server.use(
        http.get(`${BASE_URL}/events/`, () => {
          return HttpResponse.json(createEventListResponse(mockEvents));
        })
      );

      const result = await client.events.list(TEST_PROJECT_ID);

      expect(result.data).toHaveLength(3);
      expect(result.data[0]).toMatchObject({
        id: expect.any(Number),
        title: expect.any(String),
      });
    });
  });

  describe("get", () => {
    it("should get a single event by ID", async () => {
      const mockEvent = createEventFixture({ id: 123, id_string: "123" });

      server.use(
        http.get(`${BASE_URL}/events/123/`, () => {
          return HttpResponse.json({ events: [mockEvent] });
        })
      );

      const result = await client.events.get(TEST_PROJECT_ID, "123");
      expect(result.id_string).toBe("123");
    });
  });

  describe("create", () => {
    it("should create an event", async () => {
      const newEvent = createEventFixture({ title: "New Event" });

      server.use(
        http.post(`${BASE_URL}/events/`, async () => {
          return HttpResponse.json({ events: [newEvent] });
        })
      );

      const result = await client.events.create(TEST_PROJECT_ID, {
        title: "New Event",
        start_date: "2025-01-01",
        end_date: "2025-01-01",
      });
      expect(result.title).toBe("New Event");
    });
  });

  describe("update", () => {
    it("should update an event", async () => {
      const updatedEvent = createEventFixture({ id: 123, id_string: "123", title: "Updated Event" });

      server.use(
        http.put(`${BASE_URL}/events/123/`, () => {
          return HttpResponse.json({ events: [updatedEvent] });
        })
      );

      const result = await client.events.update(TEST_PROJECT_ID, "123", { title: "Updated Event" });
      expect(result.title).toBe("Updated Event");
    });
  });

  describe("delete", () => {
    it("should delete an event", async () => {
      server.use(
        http.delete(`${BASE_URL}/events/123/`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(client.events.delete(TEST_PROJECT_ID, "123")).resolves.toBeUndefined();
    });
  });
});
