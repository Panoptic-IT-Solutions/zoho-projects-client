/**
 * Unit tests for widgets API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import { mockWidget, mockWidgets } from "../../fixtures/widgets.js";

const TEST_PORTAL_ID = "12345";
const BASE_URL = `https://projectsapi.zoho.com/api/v3/portal/${TEST_PORTAL_ID}`;

describe("widgets", () => {
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
    it("should list widgets for a dashboard", async () => {
      server.use(
        http.get(`${BASE_URL}/dashboards/1001/widgets`, () => {
          return HttpResponse.json({
            widgets: mockWidgets,
            page_info: { page: 1, per_page: 100, has_more_page: false },
          });
        })
      );

      const widgetOps = client.dashboards.widgets("1001");
      const result = await widgetOps.list();

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
      });
    });
  });

  describe("get", () => {
    it("should get a single widget by ID", async () => {
      server.use(
        http.get(`${BASE_URL}/dashboards/1001/widgets/2001`, () => {
          return HttpResponse.json({ widgets: [mockWidget] });
        })
      );

      const widgetOps = client.dashboards.widgets("1001");
      const result = await widgetOps.get("2001");

      expect(result.id).toBe(2001);
      expect(result.name).toBe("Task Progress Chart");
    });
  });

  describe("create", () => {
    it("should create a widget", async () => {
      let capturedBody: unknown;

      server.use(
        http.post(`${BASE_URL}/dashboards/1001/widgets`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({ widgets: [mockWidget] });
        })
      );

      const widgetOps = client.dashboards.widgets("1001");
      const result = await widgetOps.create({
        name: "Task Progress Chart",
        type: "chart",
      });

      expect(capturedBody).toMatchObject({
        name: "Task Progress Chart",
        type: "chart",
      });
      expect(result.name).toBe("Task Progress Chart");
    });
  });

  describe("update", () => {
    it("should update a widget", async () => {
      const updatedWidget = { ...mockWidget, name: "Updated Chart" };

      server.use(
        http.put(`${BASE_URL}/dashboards/1001/widgets/2001`, () => {
          return HttpResponse.json({ widgets: [updatedWidget] });
        })
      );

      const widgetOps = client.dashboards.widgets("1001");
      const result = await widgetOps.update("2001", {
        name: "Updated Chart",
      });

      expect(result.name).toBe("Updated Chart");
    });
  });

  describe("delete", () => {
    it("should delete a widget", async () => {
      server.use(
        http.delete(`${BASE_URL}/dashboards/1001/widgets/2001`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      const widgetOps = client.dashboards.widgets("1001");
      await expect(widgetOps.delete("2001")).resolves.toBeUndefined();
    });
  });
});
