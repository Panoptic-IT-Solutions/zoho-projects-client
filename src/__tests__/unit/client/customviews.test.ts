/**
 * Unit tests for custom views API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import { mockCustomView, mockCustomViews } from "../../fixtures/customviews.js";

const TEST_PORTAL_ID = "12345";
const BASE_URL = `https://projectsapi.zoho.com/api/v3/portal/${TEST_PORTAL_ID}`;

describe("customViews", () => {
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
    it("should list custom views for tasks", async () => {
      server.use(
        http.get(`${BASE_URL}/tasks/customviews`, () => {
          return HttpResponse.json({
            customviews: mockCustomViews,
            page_info: { page: 1, per_page: 100, has_more_page: false },
          });
        })
      );

      const result = await client.customViews.list("tasks");

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
      });
    });
  });

  describe("get", () => {
    it("should get a single custom view by ID", async () => {
      server.use(
        http.get(`${BASE_URL}/tasks/customviews/cv_001`, () => {
          return HttpResponse.json({ customviews: [mockCustomView] });
        })
      );

      const result = await client.customViews.get("tasks", "cv_001");

      expect(result.id).toBe("cv_001");
      expect(result.name).toBe("My Active Tasks");
    });
  });

  describe("create", () => {
    it("should create a custom view", async () => {
      let capturedBody: unknown;

      server.use(
        http.post(`${BASE_URL}/tasks/customviews`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({ customviews: [mockCustomView] });
        })
      );

      const result = await client.customViews.create("tasks", {
        name: "My Active Tasks",
        description: "All active tasks assigned to me",
      });

      expect(capturedBody).toMatchObject({
        name: "My Active Tasks",
        description: "All active tasks assigned to me",
      });
      expect(result.name).toBe("My Active Tasks");
    });
  });

  describe("update", () => {
    it("should update a custom view", async () => {
      const updatedView = { ...mockCustomView, name: "Updated View" };

      server.use(
        http.put(`${BASE_URL}/tasks/customviews/cv_001`, () => {
          return HttpResponse.json({ customviews: [updatedView] });
        })
      );

      const result = await client.customViews.update("tasks", "cv_001", {
        name: "Updated View",
      });

      expect(result.name).toBe("Updated View");
    });
  });

  describe("delete", () => {
    it("should delete a custom view", async () => {
      server.use(
        http.delete(`${BASE_URL}/tasks/customviews/cv_001`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(
        client.customViews.delete("tasks", "cv_001")
      ).resolves.toBeUndefined();
    });
  });

  describe("forTasks", () => {
    it("should provide a convenience method for task views", async () => {
      server.use(
        http.get(`${BASE_URL}/tasks/customviews`, () => {
          return HttpResponse.json({
            customviews: mockCustomViews,
            page_info: { page: 1, per_page: 100, has_more_page: false },
          });
        })
      );

      const taskViews = client.customViews.forTasks();
      const result = await taskViews.list();

      expect(result.data).toHaveLength(2);
    });
  });

  describe("forIssues", () => {
    it("should provide a convenience method for issue views", async () => {
      server.use(
        http.get(`${BASE_URL}/issues/customviews`, () => {
          return HttpResponse.json({
            customviews: mockCustomViews,
            page_info: { page: 1, per_page: 100, has_more_page: false },
          });
        })
      );

      const issueViews = client.customViews.forIssues();
      const result = await issueViews.list();

      expect(result.data).toHaveLength(2);
    });
  });
});
