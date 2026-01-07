/**
 * Unit tests for search API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import { mockSearchResults, mockSearchResponse } from "../../fixtures/search.js";

const TEST_PORTAL_ID = "12345";
const BASE_URL = `https://projectsapi.zoho.com/restapi/portal/${TEST_PORTAL_ID}`;

describe("search", () => {
  let client: ReturnType<typeof createZohoProjectsClient>;

  beforeEach(() => {
    client = createZohoProjectsClient({
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
      refreshToken: "test-refresh-token",
      portalId: TEST_PORTAL_ID,
    });
  });

  describe("query", () => {
    it("should search across all entities", async () => {
      server.use(
        http.get(`${BASE_URL}/search/`, () => {
          return HttpResponse.json(mockSearchResponse);
        })
      );

      const result = await client.search.query({ search_term: "search" });

      expect(result.data).toHaveLength(3);
    });

    it("should search with entity type filter", async () => {
      let capturedParams: URLSearchParams | undefined;

      server.use(
        http.get(`${BASE_URL}/search/`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            ...mockSearchResponse,
            results: mockSearchResults.filter((r) => r.entity_type === "task"),
          });
        })
      );

      const result = await client.search.query({
        search_term: "search",
        entity_type: "task",
      });

      expect(capturedParams?.get("entity_type")).toBe("task");
      expect(result.data).toBeDefined();
    });
  });

  describe("inProject", () => {
    it("should search within a specific project", async () => {
      let capturedParams: URLSearchParams | undefined;

      server.use(
        http.get(`${BASE_URL}/search/`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json(mockSearchResponse);
        })
      );

      const result = await client.search.inProject("proj_001", {
        search_term: "search",
      });

      expect(capturedParams?.get("project_id")).toBe("proj_001");
      expect(result.data).toBeDefined();
    });
  });

  describe("tasks", () => {
    it("should search only tasks", async () => {
      const taskResults = mockSearchResults.filter(
        (r) => r.entity_type === "task"
      );

      server.use(
        http.get(`${BASE_URL}/search/`, () => {
          return HttpResponse.json({
            ...mockSearchResponse,
            results: taskResults,
            search_results: taskResults,
            total_count: taskResults.length,
          });
        })
      );

      const result = await client.search.tasks("search");

      expect(result.data).toBeDefined();
    });
  });

  describe("issues", () => {
    it("should search only bugs/issues", async () => {
      const bugResults = mockSearchResults.filter(
        (r) => r.entity_type === "bug"
      );

      server.use(
        http.get(`${BASE_URL}/search/`, () => {
          return HttpResponse.json({
            ...mockSearchResponse,
            results: bugResults,
            search_results: bugResults,
            total_count: bugResults.length,
          });
        })
      );

      const result = await client.search.issues("search");

      expect(result.data).toBeDefined();
    });
  });

  describe("projects", () => {
    it("should search only projects", async () => {
      const projectResults = mockSearchResults.filter(
        (r) => r.entity_type === "project"
      );

      server.use(
        http.get(`${BASE_URL}/search/`, () => {
          return HttpResponse.json({
            ...mockSearchResponse,
            results: projectResults,
            search_results: projectResults,
            total_count: projectResults.length,
          });
        })
      );

      const result = await client.search.projects("search");

      expect(result.data).toBeDefined();
    });
  });
});
