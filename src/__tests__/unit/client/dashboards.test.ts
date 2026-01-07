/**
 * Unit tests for dashboards API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import { mockDashboard, mockDashboards } from "../../fixtures/dashboards.js";

const TEST_PORTAL_ID = "12345";
const BASE_URL = `https://projectsapi.zoho.com/restapi/portal/${TEST_PORTAL_ID}`;

describe("dashboards", () => {
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
    it("should list all dashboards", async () => {
      server.use(
        http.get(`${BASE_URL}/dashboards/`, () => {
          return HttpResponse.json({
            dashboards: mockDashboards,
            page_info: { page: 1, per_page: 100, has_more_page: false },
          });
        })
      );

      const result = await client.dashboards.list();

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
      });
    });
  });

  describe("get", () => {
    it("should get a single dashboard by ID", async () => {
      server.use(
        http.get(`${BASE_URL}/dashboards/1001/`, () => {
          return HttpResponse.json({ dashboards: [mockDashboard] });
        })
      );

      const result = await client.dashboards.get("1001");

      expect(result.id).toBe(1001);
      expect(result.name).toBe("Project Overview");
    });
  });

  describe("create", () => {
    it("should create a dashboard", async () => {
      let capturedBody: unknown;

      server.use(
        http.post(`${BASE_URL}/dashboards/`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({ dashboards: [mockDashboard] });
        })
      );

      const result = await client.dashboards.create({
        name: "Project Overview",
        description: "Main project dashboard",
        type: "project",
      });

      expect(capturedBody).toMatchObject({
        name: "Project Overview",
        type: "project",
      });
      expect(result.name).toBe("Project Overview");
    });
  });

  describe("update", () => {
    it("should update a dashboard", async () => {
      const updatedDashboard = { ...mockDashboard, name: "Team Overview" };

      server.use(
        http.put(`${BASE_URL}/dashboards/1001/`, () => {
          return HttpResponse.json({ dashboards: [updatedDashboard] });
        })
      );

      const result = await client.dashboards.update("1001", {
        name: "Team Overview",
      });

      expect(result.name).toBe("Team Overview");
    });
  });

  describe("delete", () => {
    it("should delete a dashboard", async () => {
      server.use(
        http.delete(`${BASE_URL}/dashboards/1001/`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(
        client.dashboards.delete("1001")
      ).resolves.toBeUndefined();
    });
  });
});
