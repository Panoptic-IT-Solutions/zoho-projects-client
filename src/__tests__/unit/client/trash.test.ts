/**
 * Unit tests for trash API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import {
  mockTrashItems,
  mockTrashRestoreResponse,
} from "../../fixtures/trash.js";

const TEST_PORTAL_ID = "12345";
const BASE_URL = `https://projectsapi.zoho.com/restapi/portal/${TEST_PORTAL_ID}`;

describe("trash", () => {
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
    it("should list all items in trash", async () => {
      server.use(
        http.get(`${BASE_URL}/trash/`, () => {
          return HttpResponse.json({
            trash: mockTrashItems,
            page_info: { page: 1, per_page: 100, has_more_page: false },
          });
        })
      );

      const result = await client.trash.list();

      expect(result.data).toHaveLength(3);
      expect(result.data[0]).toMatchObject({
        id: expect.anything(),
        entity_type: expect.any(String),
      });
    });

    it("should filter trash by entity type", async () => {
      let capturedParams: URLSearchParams | undefined;

      server.use(
        http.get(`${BASE_URL}/trash/`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            trash: mockTrashItems.filter((i) => i.entity_type === "task"),
            page_info: { page: 1, per_page: 100, has_more_page: false },
          });
        })
      );

      const result = await client.trash.list({ entity_type: "task" });

      expect(capturedParams?.get("entity_type")).toBe("task");
      expect(result.data).toHaveLength(1);
    });
  });

  describe("restore", () => {
    it("should restore an item from trash", async () => {
      server.use(
        http.post(`${BASE_URL}/trash/task/task_deleted_001/restore/`, () => {
          return HttpResponse.json(mockTrashRestoreResponse);
        })
      );

      const result = await client.trash.restore("task", "task_deleted_001");

      expect(result.restored).toBe(true);
      expect(result.message).toBe("Item restored successfully");
    });
  });

  describe("permanentDelete", () => {
    it("should permanently delete an item from trash", async () => {
      server.use(
        http.delete(`${BASE_URL}/trash/task/task_deleted_001/`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(
        client.trash.permanentDelete("task", "task_deleted_001")
      ).resolves.toBeUndefined();
    });
  });

  describe("empty", () => {
    it("should empty all trash", async () => {
      server.use(
        http.delete(`${BASE_URL}/trash/`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(client.trash.empty()).resolves.toBeUndefined();
    });

    it("should empty trash for a specific entity type", async () => {
      server.use(
        http.delete(`${BASE_URL}/trash/task/`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(client.trash.empty("task")).resolves.toBeUndefined();
    });
  });

  describe("listForProject", () => {
    it("should list trash for a specific project", async () => {
      server.use(
        http.get(`${BASE_URL}/trash/`, ({ request }) => {
          const url = new URL(request.url);
          const projectId = url.searchParams.get("project_id");
          if (projectId === "proj_001") {
            return HttpResponse.json({
              trash: mockTrashItems,
              page_info: { page: 1, per_page: 100, has_more_page: false },
            });
          }
          return HttpResponse.json({
            trash: [],
            page_info: { page: 1, per_page: 100, has_more_page: false },
          });
        })
      );

      const result = await client.trash.listForProject("proj_001");

      expect(result.data).toHaveLength(3);
    });
  });
});
