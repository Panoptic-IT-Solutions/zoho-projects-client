/**
 * Unit tests for phases (milestones) API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import {
  createPhaseFixture,
  createPhaseListFixture,
  createPhaseListResponse,
} from "../../fixtures/phases.js";

const TEST_PORTAL_ID = "12345";
const TEST_PROJECT_ID = "67890";
const BASE_URL = `https://projectsapi.zoho.com/restapi/portal/${TEST_PORTAL_ID}/projects/${TEST_PROJECT_ID}`;

describe("phases", () => {
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
    it("should list phases for a project", async () => {
      const mockPhases = createPhaseListFixture(3);

      server.use(
        http.get(`${BASE_URL}/milestones/`, () => {
          return HttpResponse.json(createPhaseListResponse(mockPhases));
        })
      );

      const result = await client.phases.list(TEST_PROJECT_ID);

      expect(result.data).toHaveLength(3);
      expect(result.data[0]).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
      });
    });
  });

  describe("get", () => {
    it("should get a single phase by ID", async () => {
      const mockPhase = createPhaseFixture({ id: 123, id_string: "123" });

      server.use(
        http.get(`${BASE_URL}/milestones/123/`, () => {
          return HttpResponse.json({ milestones: [mockPhase] });
        })
      );

      const result = await client.phases.get(TEST_PROJECT_ID, "123");
      expect(result.id_string).toBe("123");
    });
  });

  describe("create", () => {
    it("should create a phase", async () => {
      const newPhase = createPhaseFixture({ name: "New Milestone" });

      server.use(
        http.post(`${BASE_URL}/milestones/`, async () => {
          return HttpResponse.json({ milestones: [newPhase] });
        })
      );

      const result = await client.phases.create(TEST_PROJECT_ID, {
        name: "New Milestone",
        start_date: "2025-01-01",
        end_date: "2025-01-31",
      });
      expect(result.name).toBe("New Milestone");
    });
  });

  describe("update", () => {
    it("should update a phase", async () => {
      const updatedPhase = createPhaseFixture({ id: 123, id_string: "123", name: "Updated Milestone" });

      server.use(
        http.put(`${BASE_URL}/milestones/123/`, () => {
          return HttpResponse.json({ milestones: [updatedPhase] });
        })
      );

      const result = await client.phases.update(TEST_PROJECT_ID, "123", { name: "Updated Milestone" });
      expect(result.name).toBe("Updated Milestone");
    });
  });

  describe("delete", () => {
    it("should delete a phase", async () => {
      server.use(
        http.delete(`${BASE_URL}/milestones/123/`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(client.phases.delete(TEST_PROJECT_ID, "123")).resolves.toBeUndefined();
    });
  });
});
