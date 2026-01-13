/**
 * Unit tests for users API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import {
  createUserFixture,
  createUserListFixture,
  createUserListResponse,
} from "../../fixtures/users.js";

const TEST_PORTAL_ID = "12345";
const BASE_URL = `https://projectsapi.zoho.com/api/v3/portal/${TEST_PORTAL_ID}`;

describe("users", () => {
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
    it("should list users with default pagination", async () => {
      const mockUsers = createUserListFixture(3);

      server.use(
        http.get(`${BASE_URL}/users`, () => {
          return HttpResponse.json(createUserListResponse(mockUsers));
        })
      );

      const result = await client.users.list();

      expect(result.data).toHaveLength(3);
      expect(result.data[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
      });
    });

    it("should handle empty response", async () => {
      server.use(
        http.get(`${BASE_URL}/users`, () => {
          return HttpResponse.json(createUserListResponse([]));
        })
      );

      const result = await client.users.list();
      expect(result.data).toHaveLength(0);
    });
  });

  describe("get", () => {
    it("should get a single user by ID", async () => {
      const mockUser = createUserFixture({ id: "123" });

      server.use(
        http.get(`${BASE_URL}/users/123`, () => {
          return HttpResponse.json({ users: [mockUser] });
        })
      );

      const result = await client.users.get("123");
      expect(result.id).toBe("123");
      expect(result.name).toBeDefined();
    });
  });

  describe("listAll", () => {
    it("should auto-paginate through all users", async () => {
      const page1 = createUserListFixture(100);
      const page2 = createUserListFixture(50);
      let requestCount = 0;

      server.use(
        http.get(`${BASE_URL}/users`, ({ request }) => {
          requestCount++;
          const url = new URL(request.url);
          const page = parseInt(url.searchParams.get("page") || "1");

          if (page === 1) {
            return HttpResponse.json(createUserListResponse(page1, true));
          } else {
            return HttpResponse.json(createUserListResponse(page2, false));
          }
        })
      );

      const result = await client.users.listAll();

      expect(requestCount).toBe(2);
      expect(result).toHaveLength(150);
    });
  });

  describe("iterate", () => {
    it("should yield users one at a time", async () => {
      const mockUsers = createUserListFixture(3);

      server.use(
        http.get(`${BASE_URL}/users`, () => {
          return HttpResponse.json(createUserListResponse(mockUsers));
        })
      );

      const results: unknown[] = [];
      for await (const user of client.users.iterate()) {
        results.push(user);
      }

      expect(results).toHaveLength(3);
    });
  });
});
