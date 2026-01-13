/**
 * Unit tests for attachments API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import {
  createAttachmentFixture,
  createAttachmentListFixture,
  createAttachmentListResponse,
} from "../../fixtures/attachments.js";

const TEST_PORTAL_ID = "12345";
const TEST_PROJECT_ID = "67890";
const BASE_URL = `https://projectsapi.zoho.com/api/v3/portal/${TEST_PORTAL_ID}/projects/${TEST_PROJECT_ID}`;

describe("attachments", () => {
  let client: ReturnType<typeof createZohoProjectsClient>;

  beforeEach(() => {
    client = createZohoProjectsClient({
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
      refreshToken: "test-refresh-token",
      portalId: TEST_PORTAL_ID,
    });
  });

  describe("listForEntity", () => {
    it("should list attachments for a task", async () => {
      const mockAttachments = createAttachmentListFixture(3);
      const testTaskId = "12345";

      server.use(
        http.get(`${BASE_URL}/attachments`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get("entity_type")).toBe("task");
          expect(url.searchParams.get("entity_id")).toBe(testTaskId);
          return HttpResponse.json(createAttachmentListResponse(mockAttachments));
        })
      );

      const result = await client.attachments.listForEntity(TEST_PROJECT_ID, {
        entity_type: "task",
        entity_id: testTaskId,
      });

      expect(result.data).toHaveLength(3);
      expect(result.data[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
      });
    });
  });

  describe("listForTask", () => {
    it("should list attachments for a task using convenience method", async () => {
      const mockAttachments = createAttachmentListFixture(2);
      const testTaskId = "54321";

      server.use(
        http.get(`${BASE_URL}/attachments`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get("entity_type")).toBe("task");
          expect(url.searchParams.get("entity_id")).toBe(testTaskId);
          return HttpResponse.json(createAttachmentListResponse(mockAttachments));
        })
      );

      const result = await client.attachments.listForTask(TEST_PROJECT_ID, testTaskId);

      expect(result.data).toHaveLength(2);
    });
  });

  describe("get", () => {
    it("should get a single attachment by ID", async () => {
      const mockAttachment = createAttachmentFixture({ id: "123" });

      server.use(
        http.get(`${BASE_URL}/attachments/123`, () => {
          return HttpResponse.json({ attachments: [mockAttachment] });
        })
      );

      const result = await client.attachments.get(TEST_PROJECT_ID, "123");
      expect(result.id).toBe("123");
    });
  });

  describe("delete", () => {
    it("should delete an attachment", async () => {
      server.use(
        http.delete(`${BASE_URL}/attachments/123`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(client.attachments.delete(TEST_PROJECT_ID, "123")).resolves.toBeUndefined();
    });
  });
});
