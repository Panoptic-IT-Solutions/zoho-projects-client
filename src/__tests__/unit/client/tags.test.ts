/**
 * Unit tests for tags API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import {
  createTagFixture,
  createTagListFixture,
  createTagListResponse,
} from "../../fixtures/tags.js";

const TEST_PORTAL_ID = "12345";
const BASE_URL = `https://projectsapi.zoho.com/api/v3/portal/${TEST_PORTAL_ID}`;

describe("tags", () => {
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
    it("should list tags with default pagination", async () => {
      const mockTags = createTagListFixture(3);

      server.use(
        http.get(`${BASE_URL}/tags`, () => {
          return HttpResponse.json(createTagListResponse(mockTags));
        })
      );

      const result = await client.tags.list();

      expect(result.data).toHaveLength(3);
      expect(result.data[0]).toMatchObject({
        id: expect.any(Number),
        id_string: expect.any(String),
        name: expect.any(String),
      });
    });
  });

  describe("get", () => {
    it("should get a single tag by ID", async () => {
      const mockTag = createTagFixture({ id: 123, id_string: "123" });

      server.use(
        http.get(`${BASE_URL}/tags/123`, () => {
          return HttpResponse.json({ tags: [mockTag] });
        })
      );

      const result = await client.tags.get("123");
      expect(result.id_string).toBe("123");
    });
  });

  describe("create", () => {
    it("should create a tag", async () => {
      const newTag = createTagFixture({ name: "New Tag" });
      let capturedBody: unknown;

      server.use(
        http.post(`${BASE_URL}/tags`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({ tags: [newTag] });
        })
      );

      const result = await client.tags.create({ name: "New Tag" });

      expect(capturedBody).toMatchObject({ tags: [{ name: "New Tag" }] });
      expect(result.name).toBe("New Tag");
    });
  });

  describe("update", () => {
    it("should update a tag", async () => {
      const updatedTag = createTagFixture({ id: 123, id_string: "123", name: "Updated Tag" });

      server.use(
        http.put(`${BASE_URL}/tags/123`, () => {
          return HttpResponse.json({ tags: [updatedTag] });
        })
      );

      const result = await client.tags.update("123", { name: "Updated Tag" });
      expect(result.name).toBe("Updated Tag");
    });
  });

  describe("delete", () => {
    it("should delete a tag", async () => {
      server.use(
        http.delete(`${BASE_URL}/tags/123`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(client.tags.delete("123")).resolves.toBeUndefined();
    });
  });

  describe("listAll", () => {
    it("should auto-paginate through all tags", async () => {
      const page1 = createTagListFixture(100);
      const page2 = createTagListFixture(50);
      let requestCount = 0;

      server.use(
        http.get(`${BASE_URL}/tags`, ({ request }) => {
          requestCount++;
          const url = new URL(request.url);
          const page = parseInt(url.searchParams.get("page") || "1");

          if (page === 1) {
            return HttpResponse.json(createTagListResponse(page1, true));
          } else {
            return HttpResponse.json(createTagListResponse(page2, false));
          }
        })
      );

      const result = await client.tags.listAll();

      expect(requestCount).toBe(2);
      expect(result).toHaveLength(150);
    });
  });
});
