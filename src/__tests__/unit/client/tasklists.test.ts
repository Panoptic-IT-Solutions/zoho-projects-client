/**
 * Unit tests for tasklists API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import {
  createTasklistFixture,
  createTasklistListFixture,
  createTasklistListResponse,
} from "../../fixtures/tasklists.js";

const TEST_PORTAL_ID = "12345";
const TEST_PROJECT_ID = "67890";
const BASE_URL = `https://projectsapi.zoho.com/restapi/portal/${TEST_PORTAL_ID}/projects/${TEST_PROJECT_ID}`;

describe("tasklists", () => {
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
    it("should list tasklists for a project", async () => {
      const mockTasklists = createTasklistListFixture(3);

      server.use(
        http.get(`${BASE_URL}/tasklists/`, () => {
          return HttpResponse.json(createTasklistListResponse(mockTasklists));
        })
      );

      const result = await client.tasklists.list(TEST_PROJECT_ID);

      expect(result.data).toHaveLength(3);
      expect(result.data[0]).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
      });
    });
  });

  describe("get", () => {
    it("should get a single tasklist by ID", async () => {
      const mockTasklist = createTasklistFixture({ id: 123, id_string: "123" });

      server.use(
        http.get(`${BASE_URL}/tasklists/123/`, () => {
          return HttpResponse.json({ tasklists: [mockTasklist] });
        })
      );

      const result = await client.tasklists.get(TEST_PROJECT_ID, "123");
      expect(result.id_string).toBe("123");
    });
  });

  describe("create", () => {
    it("should create a tasklist", async () => {
      const newTasklist = createTasklistFixture({ name: "New Tasklist" });

      server.use(
        http.post(`${BASE_URL}/tasklists/`, async () => {
          return HttpResponse.json({ tasklists: [newTasklist] });
        })
      );

      const result = await client.tasklists.create(TEST_PROJECT_ID, { name: "New Tasklist" });
      expect(result.name).toBe("New Tasklist");
    });
  });

  describe("update", () => {
    it("should update a tasklist", async () => {
      const updatedTasklist = createTasklistFixture({ id: 123, id_string: "123", name: "Updated Tasklist" });

      server.use(
        http.put(`${BASE_URL}/tasklists/123/`, () => {
          return HttpResponse.json({ tasklists: [updatedTasklist] });
        })
      );

      const result = await client.tasklists.update(TEST_PROJECT_ID, "123", { name: "Updated Tasklist" });
      expect(result.name).toBe("Updated Tasklist");
    });
  });

  describe("delete", () => {
    it("should delete a tasklist", async () => {
      server.use(
        http.delete(`${BASE_URL}/tasklists/123/`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(client.tasklists.delete(TEST_PROJECT_ID, "123")).resolves.toBeUndefined();
    });
  });
});
