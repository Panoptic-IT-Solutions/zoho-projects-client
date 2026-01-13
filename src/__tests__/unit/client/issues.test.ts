/**
 * Unit tests for issues (bugs) API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import {
  createIssueFixture,
  createIssueListFixture,
  createIssueListResponse,
} from "../../fixtures/issues.js";

const TEST_PORTAL_ID = "12345";
const TEST_PROJECT_ID = "67890";
const BASE_URL = `https://projectsapi.zoho.com/api/v3/portal/${TEST_PORTAL_ID}/projects/${TEST_PROJECT_ID}`;

describe("issues", () => {
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
    it("should list issues for a project", async () => {
      const mockIssues = createIssueListFixture(3);

      server.use(
        http.get(`${BASE_URL}/bugs`, () => {
          return HttpResponse.json(createIssueListResponse(mockIssues));
        })
      );

      const result = await client.issues.list(TEST_PROJECT_ID);

      expect(result.data).toHaveLength(3);
      expect(result.data[0]).toMatchObject({
        id: expect.any(Number),
        title: expect.any(String),
      });
    });
  });

  describe("get", () => {
    it("should get a single issue by ID", async () => {
      const mockIssue = createIssueFixture({ id: 123, id_string: "123" });

      server.use(
        http.get(`${BASE_URL}/bugs/123`, () => {
          return HttpResponse.json({ bugs: [mockIssue] });
        })
      );

      const result = await client.issues.get(TEST_PROJECT_ID, "123");
      expect(result.id_string).toBe("123");
    });
  });

  describe("create", () => {
    it("should create an issue", async () => {
      const newIssue = createIssueFixture({ title: "New Bug" });

      server.use(
        http.post(`${BASE_URL}/bugs`, async () => {
          return HttpResponse.json({ bugs: [newIssue] });
        })
      );

      const result = await client.issues.create(TEST_PROJECT_ID, { title: "New Bug" });
      expect(result.title).toBe("New Bug");
    });
  });

  describe("update", () => {
    it("should update an issue", async () => {
      const updatedIssue = createIssueFixture({ id: 123, id_string: "123", title: "Updated Bug" });

      server.use(
        http.put(`${BASE_URL}/bugs/123`, () => {
          return HttpResponse.json({ bugs: [updatedIssue] });
        })
      );

      const result = await client.issues.update(TEST_PROJECT_ID, "123", { title: "Updated Bug" });
      expect(result.title).toBe("Updated Bug");
    });
  });

  describe("delete", () => {
    it("should delete an issue", async () => {
      server.use(
        http.delete(`${BASE_URL}/bugs/123`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(client.issues.delete(TEST_PROJECT_ID, "123")).resolves.toBeUndefined();
    });
  });
});
