/**
 * Unit tests for forums API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import {
  createForumFixture,
  createForumListFixture,
  createForumListResponse,
} from "../../fixtures/forums.js";

const TEST_PORTAL_ID = "12345";
const TEST_PROJECT_ID = "67890";
const BASE_URL = `https://projectsapi.zoho.com/restapi/portal/${TEST_PORTAL_ID}/projects/${TEST_PROJECT_ID}`;

describe("forums", () => {
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
    it("should list forums for a project", async () => {
      const mockForums = createForumListFixture(3);

      server.use(
        http.get(`${BASE_URL}/forums/`, () => {
          return HttpResponse.json(createForumListResponse(mockForums));
        })
      );

      const result = await client.forums.list(TEST_PROJECT_ID);

      expect(result.data).toHaveLength(3);
      expect(result.data[0]).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
      });
    });
  });

  describe("get", () => {
    it("should get a single forum by ID", async () => {
      const mockForum = createForumFixture({ id: 123, id_string: "123" });

      server.use(
        http.get(`${BASE_URL}/forums/123/`, () => {
          return HttpResponse.json({ forums: [mockForum] });
        })
      );

      const result = await client.forums.get(TEST_PROJECT_ID, "123");
      expect(result.id_string).toBe("123");
    });
  });

  describe("create", () => {
    it("should create a forum", async () => {
      const newForum = createForumFixture({ name: "New Forum" });

      server.use(
        http.post(`${BASE_URL}/forums/`, async () => {
          return HttpResponse.json({ forums: [newForum] });
        })
      );

      const result = await client.forums.create(TEST_PROJECT_ID, { name: "New Forum", content: "Content" });
      expect(result.name).toBe("New Forum");
    });
  });

  describe("update", () => {
    it("should update a forum", async () => {
      const updatedForum = createForumFixture({ id: 123, id_string: "123", name: "Updated Forum" });

      server.use(
        http.put(`${BASE_URL}/forums/123/`, () => {
          return HttpResponse.json({ forums: [updatedForum] });
        })
      );

      const result = await client.forums.update(TEST_PROJECT_ID, "123", { name: "Updated Forum" });
      expect(result.name).toBe("Updated Forum");
    });
  });

  describe("delete", () => {
    it("should delete a forum", async () => {
      server.use(
        http.delete(`${BASE_URL}/forums/123/`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(client.forums.delete(TEST_PROJECT_ID, "123")).resolves.toBeUndefined();
    });
  });
});
