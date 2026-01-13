/**
 * Unit tests for reports API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import { mockReport, mockReports, mockReportData } from "../../fixtures/reports.js";

const TEST_PORTAL_ID = "12345";
const BASE_URL = `https://projectsapi.zoho.com/api/v3/portal/${TEST_PORTAL_ID}`;

describe("reports", () => {
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
    it("should list all reports", async () => {
      server.use(
        http.get(`${BASE_URL}/reports`, () => {
          return HttpResponse.json({
            reports: mockReports,
            page_info: { page: 1, per_page: 100, has_more_page: false },
          });
        })
      );

      const result = await client.reports.list();

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
      });
    });
  });

  describe("get", () => {
    it("should get a single report by ID", async () => {
      server.use(
        http.get(`${BASE_URL}/reports/3001`, () => {
          return HttpResponse.json({ reports: [mockReport] });
        })
      );

      const result = await client.reports.get("3001");

      expect(result.id).toBe(3001);
      expect(result.name).toBe("Task Status Report");
    });
  });

  describe("execute", () => {
    it("should execute a report and return data", async () => {
      server.use(
        http.get(`${BASE_URL}/reports/3001/data`, () => {
          return HttpResponse.json(mockReportData);
        })
      );

      const result = await client.reports.execute("3001");

      expect(result.data).toHaveLength(3);
      expect(result.total_count).toBe(3);
    });
  });

  describe("listForProject", () => {
    it("should list reports for a specific project", async () => {
      server.use(
        http.get(`${BASE_URL}/projects/proj_001/reports`, () => {
          return HttpResponse.json({
            reports: mockReports,
            page_info: { page: 1, per_page: 100, has_more_page: false },
          });
        })
      );

      const result = await client.reports.listForProject("proj_001");

      expect(result.data).toHaveLength(2);
    });
  });

  describe("list with pagination", () => {
    it("should list reports with pagination params", async () => {
      let capturedParams: URLSearchParams | undefined;

      server.use(
        http.get(`${BASE_URL}/reports`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            reports: mockReports,
            page_info: { page: 1, per_page: 10, has_more_page: true },
          });
        })
      );

      const result = await client.reports.list({ page: 1, per_page: 10 });

      expect(capturedParams?.get("page")).toBe("1");
      expect(capturedParams?.get("per_page")).toBe("10");
      expect(result.data).toBeDefined();
    });
  });
});
