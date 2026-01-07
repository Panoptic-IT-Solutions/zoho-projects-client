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
const BASE_URL = `https://projectsapi.zoho.com/restapi/portal/${TEST_PORTAL_ID}/projects/${TEST_PROJECT_ID}`;

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

  describe("list", () => {
    it("should list attachments for a project", async () => {
      const mockAttachments = createAttachmentListFixture(3);

      server.use(
        http.get(`${BASE_URL}/attachments/`, () => {
          return HttpResponse.json(createAttachmentListResponse(mockAttachments));
        })
      );

      const result = await client.attachments.list(TEST_PROJECT_ID);

      expect(result.data).toHaveLength(3);
      expect(result.data[0]).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
      });
    });
  });

  describe("get", () => {
    it("should get a single attachment by ID", async () => {
      const mockAttachment = createAttachmentFixture({ id: 123, id_string: "123" });

      server.use(
        http.get(`${BASE_URL}/attachments/123/`, () => {
          return HttpResponse.json({ attachments: [mockAttachment] });
        })
      );

      const result = await client.attachments.get(TEST_PROJECT_ID, "123");
      expect(result.id_string).toBe("123");
    });
  });

  describe("delete", () => {
    it("should delete an attachment", async () => {
      server.use(
        http.delete(`${BASE_URL}/attachments/123/`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(client.attachments.delete(TEST_PROJECT_ID, "123")).resolves.toBeUndefined();
    });
  });
});
