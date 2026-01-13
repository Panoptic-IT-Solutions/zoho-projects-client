/**
 * Unit tests for tasks API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import {
  createTaskFixture,
  createTaskListFixture,
  createTaskListResponse,
} from "../../fixtures/tasks.js";

const TEST_PORTAL_ID = "12345";
const TEST_PROJECT_ID = "proj-1";
const BASE_URL = `https://projectsapi.zoho.com/api/v3/portal/${TEST_PORTAL_ID}`;

describe("tasks", () => {
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
    it("should list tasks for a project", async () => {
      const mockTasks = createTaskListFixture(3);

      server.use(
        http.get(`${BASE_URL}/projects/:projectId/tasks`, () => {
          return HttpResponse.json(createTaskListResponse(mockTasks));
        })
      );

      const result = await client.tasks.list(TEST_PROJECT_ID);

      expect(result.data).toHaveLength(3);
      expect(result.data[0]).toMatchObject({
        id: expect.any(Number),
        id_string: expect.any(String),
        name: expect.any(String),
      });
    });

    it("should pass pagination and sort parameters", async () => {
      let capturedParams: URLSearchParams | undefined;

      server.use(
        http.get(`${BASE_URL}/projects/:projectId/tasks`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json(createTaskListResponse([]));
        })
      );

      await client.tasks.list(TEST_PROJECT_ID, {
        page: 2,
        per_page: 50,
        sort_column: "name",
        sort_order: "ascending",
      });

      expect(capturedParams?.get("page")).toBe("2");
      expect(capturedParams?.get("per_page")).toBe("50");
      expect(capturedParams?.get("sort_column")).toBe("name");
      expect(capturedParams?.get("sort_order")).toBe("ascending");
    });
  });

  describe("get", () => {
    it("should get a single task by ID", async () => {
      const mockTask = createTaskFixture({ id: 456, id_string: "456" });

      server.use(
        http.get(`${BASE_URL}/projects/:projectId/tasks/:taskId`, () => {
          return HttpResponse.json({ tasks: [mockTask] });
        })
      );

      const result = await client.tasks.get(TEST_PROJECT_ID, "456");

      expect(result.id_string).toBe("456");
      expect(result.name).toBeDefined();
    });

    it("should throw error when task not found", async () => {
      server.use(
        http.get(`${BASE_URL}/projects/:projectId/tasks/:taskId`, () => {
          return HttpResponse.json({ tasks: [] });
        })
      );

      await expect(client.tasks.get(TEST_PROJECT_ID, "999")).rejects.toThrow(
        "Task not found: 999"
      );
    });
  });

  describe("listAll", () => {
    it("should auto-paginate through all tasks", async () => {
      const page1 = createTaskListFixture(100);
      const page2 = createTaskListFixture(50);
      let requestCount = 0;

      server.use(
        http.get(`${BASE_URL}/projects/:projectId/tasks`, ({ request }) => {
          requestCount++;
          const url = new URL(request.url);
          const page = parseInt(url.searchParams.get("page") || "1");

          if (page === 1) {
            return HttpResponse.json(createTaskListResponse(page1, true));
          } else {
            return HttpResponse.json(createTaskListResponse(page2, false));
          }
        })
      );

      const result = await client.tasks.listAll(TEST_PROJECT_ID);

      expect(requestCount).toBe(2);
      expect(result).toHaveLength(150);
    });
  });

  describe("iterate", () => {
    it("should yield tasks one at a time", async () => {
      const mockTasks = createTaskListFixture(3);

      server.use(
        http.get(`${BASE_URL}/projects/:projectId/tasks`, () => {
          return HttpResponse.json(createTaskListResponse(mockTasks));
        })
      );

      const results: unknown[] = [];
      for await (const task of client.tasks.iterate(TEST_PROJECT_ID)) {
        results.push(task);
      }

      expect(results).toHaveLength(3);
    });
  });

  describe("create", () => {
    it("should create a task with required fields", async () => {
      const newTask = createTaskFixture({ name: "New Task" });
      let capturedBody: unknown;

      server.use(
        http.post(`${BASE_URL}/projects/:projectId/tasks`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({ tasks: [newTask] });
        })
      );

      const result = await client.tasks.create(TEST_PROJECT_ID, { name: "New Task" });

      expect(capturedBody).toMatchObject({ name: "New Task" });
      expect(result.name).toBe("New Task");
    });

    it("should create a task with optional fields", async () => {
      const newTask = createTaskFixture({ name: "Full Task" });

      server.use(
        http.post(`${BASE_URL}/projects/:projectId/tasks`, () => {
          return HttpResponse.json({ tasks: [newTask] });
        })
      );

      const result = await client.tasks.create(TEST_PROJECT_ID, {
        name: "Full Task",
        description: "A detailed task",
        priority: "High",
        start_date: "01-01-2025",
        end_date: "01-15-2025",
      });

      expect(result.name).toBe("Full Task");
    });
  });

  describe("update", () => {
    it("should update a task", async () => {
      const updatedTask = createTaskFixture({
        id: 456,
        id_string: "456",
        name: "Updated Task",
      });

      server.use(
        http.patch(`${BASE_URL}/projects/:projectId/tasks/:taskId`, () => {
          return HttpResponse.json({ tasks: [updatedTask] });
        })
      );

      const result = await client.tasks.update(TEST_PROJECT_ID, "456", {
        name: "Updated Task",
      });

      expect(result.name).toBe("Updated Task");
    });
  });

  describe("delete", () => {
    it("should delete a task", async () => {
      server.use(
        http.delete(`${BASE_URL}/projects/:projectId/tasks/:taskId`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(
        client.tasks.delete(TEST_PROJECT_ID, "456")
      ).resolves.toBeUndefined();
    });
  });
});
