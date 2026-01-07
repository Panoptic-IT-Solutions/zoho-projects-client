/**
 * Unit tests for timelogs API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import {
  createTimeLogFixture,
  createTimeLogListFixture,
  createTimeLogListResponse,
} from "../../fixtures/timelogs.js";

const TEST_PORTAL_ID = "12345";
const BASE_URL = `https://projectsapi.zoho.com/restapi/portal/${TEST_PORTAL_ID}`;

describe("timelogs", () => {
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
    it("should list timelogs for a project", async () => {
      const mockTimelogs = createTimeLogListFixture(3);

      server.use(
        http.get(`${BASE_URL}/projects/proj_001/logs/`, () => {
          return HttpResponse.json(createTimeLogListResponse(mockTimelogs));
        })
      );

      const result = await client.timelogs.list("proj_001", {
        users_list: "all",
        view_type: "week",
        date: "01-15-2024",
        bill_status: "All",
        component_type: "task",
      });

      expect(result.data).toBeDefined();
    });
  });

  describe("createForTask", () => {
    it("should create a timelog for a task", async () => {
      const mockTimelog = createTimeLogFixture();

      server.use(
        http.post(`${BASE_URL}/projects/proj_001/logs/`, () => {
          return HttpResponse.json({
            timelogs: { tasklogs: [mockTimelog] },
          });
        })
      );

      const result = await client.timelogs.createForTask("proj_001", {
        task_id: "task_001",
        date: "01-15-2024",
        hours: "2",
        bill_status: "Billable",
      });

      expect(result).toBeDefined();
      expect(result.hours).toBeDefined();
    });
  });

  describe("createForBug", () => {
    it("should create a timelog for a bug", async () => {
      const mockTimelog = createTimeLogFixture();

      server.use(
        http.post(`${BASE_URL}/projects/proj_001/logs/`, () => {
          return HttpResponse.json({
            timelogs: { buglogs: [mockTimelog] },
          });
        })
      );

      const result = await client.timelogs.createForBug("proj_001", {
        bug_id: "bug_001",
        date: "01-15-2024",
        hours: "1",
        bill_status: "Non Billable",
      });

      expect(result).toBeDefined();
    });
  });

  describe("createGeneral", () => {
    it("should create a general timelog", async () => {
      const mockTimelog = createTimeLogFixture();

      server.use(
        http.post(`${BASE_URL}/projects/proj_001/logs/`, () => {
          return HttpResponse.json({
            timelogs: { generallogs: [mockTimelog] },
          });
        })
      );

      const result = await client.timelogs.createGeneral("proj_001", {
        name: "General work",
        date: "01-15-2024",
        hours: "3",
        bill_status: "Billable",
      });

      expect(result).toBeDefined();
    });
  });

  describe("update", () => {
    it("should update a timelog", async () => {
      const mockTimelog = createTimeLogFixture({ hours: 4 });

      server.use(
        http.put(`${BASE_URL}/projects/proj_001/logs/log_001/`, () => {
          return HttpResponse.json({
            timelogs: { tasklogs: [mockTimelog] },
          });
        })
      );

      const result = await client.timelogs.update("proj_001", "log_001", {
        hours: "4",
      });

      expect(result).toBeDefined();
    });
  });

  describe("delete", () => {
    it("should delete a timelog", async () => {
      server.use(
        http.delete(`${BASE_URL}/projects/proj_001/logs/log_001/`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(
        client.timelogs.delete("proj_001", "log_001")
      ).resolves.toBeUndefined();
    });
  });
});
