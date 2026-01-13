/**
 * Unit tests for projects API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import {
  createProjectFixture,
  createProjectListFixture,
  createProjectListResponse,
} from "../../fixtures/projects.js";

const TEST_PORTAL_ID = "12345";
const BASE_URL = `https://projectsapi.zoho.com/api/v3/portal/${TEST_PORTAL_ID}`;

describe("projects", () => {
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
    it("should list projects with default pagination", async () => {
      const mockProjects = createProjectListFixture(3);

      server.use(
        http.get(`${BASE_URL}/projects`, () => {
          return HttpResponse.json(createProjectListResponse(mockProjects));
        })
      );

      const result = await client.projects.list();

      expect(result.data).toHaveLength(3);
      expect(result.data[0]).toMatchObject({
        id: expect.any(Number),
        id_string: expect.any(String),
        name: expect.any(String),
      });
      expect(result.pageInfo).toBeDefined();
    });

    it("should pass pagination parameters", async () => {
      let capturedParams: URLSearchParams | undefined;

      server.use(
        http.get(`${BASE_URL}/projects`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json(createProjectListResponse([]));
        })
      );

      await client.projects.list({ page: 2, per_page: 50 });

      expect(capturedParams?.get("page")).toBe("2");
      expect(capturedParams?.get("per_page")).toBe("50");
    });

    it("should handle empty response", async () => {
      server.use(
        http.get(`${BASE_URL}/projects`, () => {
          return HttpResponse.json(createProjectListResponse([]));
        })
      );

      const result = await client.projects.list();

      expect(result.data).toHaveLength(0);
    });
  });

  describe("get", () => {
    it("should get a single project by ID", async () => {
      const mockProject = createProjectFixture({ id: 123, id_string: "123" });

      server.use(
        http.get(`${BASE_URL}/projects/123`, () => {
          return HttpResponse.json({ projects: [mockProject] });
        })
      );

      const result = await client.projects.get("123");

      expect(result.id_string).toBe("123");
      expect(result.name).toBeDefined();
    });

    it("should throw error when project not found", async () => {
      server.use(
        http.get(`${BASE_URL}/projects/999`, () => {
          return HttpResponse.json({ projects: [] });
        })
      );

      await expect(client.projects.get("999")).rejects.toThrow(
        "Project not found: 999"
      );
    });
  });

  describe("listAll", () => {
    it("should auto-paginate through all projects", async () => {
      const page1 = createProjectListFixture(100);
      const page2 = createProjectListFixture(50);
      let requestCount = 0;

      server.use(
        http.get(`${BASE_URL}/projects`, ({ request }) => {
          requestCount++;
          const url = new URL(request.url);
          const page = parseInt(url.searchParams.get("page") || "1");

          if (page === 1) {
            return HttpResponse.json(
              createProjectListResponse(page1, true)
            );
          } else {
            return HttpResponse.json(
              createProjectListResponse(page2, false)
            );
          }
        })
      );

      const result = await client.projects.listAll();

      expect(requestCount).toBe(2);
      expect(result).toHaveLength(150);
    });

    it("should respect maxItems option", async () => {
      const projects = createProjectListFixture(100);

      server.use(
        http.get(`${BASE_URL}/projects`, () => {
          return HttpResponse.json(createProjectListResponse(projects, true));
        })
      );

      const result = await client.projects.listAll({ maxItems: 25 });

      expect(result).toHaveLength(25);
    });
  });

  describe("iterate", () => {
    it("should yield projects one at a time", async () => {
      const mockProjects = createProjectListFixture(3);

      server.use(
        http.get(`${BASE_URL}/projects`, () => {
          return HttpResponse.json(createProjectListResponse(mockProjects));
        })
      );

      const results: unknown[] = [];
      for await (const project of client.projects.iterate()) {
        results.push(project);
      }

      expect(results).toHaveLength(3);
    });
  });

  describe("create", () => {
    it("should create a project with required fields", async () => {
      const newProject = createProjectFixture({ name: "New Project" });
      let capturedBody: unknown;

      server.use(
        http.post(`${BASE_URL}/projects`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({ projects: [newProject] });
        })
      );

      const result = await client.projects.create({ name: "New Project" });

      expect(capturedBody).toMatchObject({ name: "New Project" });
      expect(result.name).toBe("New Project");
    });

    it("should create a project with all optional fields", async () => {
      const newProject = createProjectFixture({ name: "Full Project" });
      let capturedBody: unknown;

      server.use(
        http.post(`${BASE_URL}/projects`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({ projects: [newProject] });
        })
      );

      const result = await client.projects.create({
        name: "Full Project",
        description: "A test project",
        status: "active",
        is_public: "yes",
        budget_type: "based_on_project_hours",
        budget_value: 100,
      });

      expect(capturedBody).toMatchObject({
        name: "Full Project",
        description: "A test project",
        status: "active",
      });
      expect(result.name).toBe("Full Project");
    });
  });

  describe("update", () => {
    it("should update a project", async () => {
      const updatedProject = createProjectFixture({
        id: 123,
        id_string: "123",
        name: "Updated Name",
      });

      server.use(
        http.put(`${BASE_URL}/projects/123`, () => {
          return HttpResponse.json({ projects: [updatedProject] });
        })
      );

      const result = await client.projects.update("123", { name: "Updated Name" });

      expect(result.name).toBe("Updated Name");
    });
  });

  describe("delete", () => {
    it("should delete a project", async () => {
      server.use(
        http.delete(`${BASE_URL}/projects/123`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(client.projects.delete("123")).resolves.toBeUndefined();
    });
  });
});
