/**
 * Unit tests for timers API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import { mockTimer, mockTimers, mockPausedTimer } from "../../fixtures/timers.js";

const TEST_PORTAL_ID = "12345";
const BASE_URL = `https://projectsapi.zoho.com/api/v3/portal/${TEST_PORTAL_ID}`;

describe("timers", () => {
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
    it("should list all running timers", async () => {
      server.use(
        http.get(`${BASE_URL}/mytimers`, () => {
          return HttpResponse.json({ timers: mockTimers });
        })
      );

      const result = await client.timers.list();

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: expect.any(String),
        status: expect.any(String),
      });
    });

    it("should return empty array when no timers", async () => {
      server.use(
        http.get(`${BASE_URL}/mytimers`, () => {
          return new HttpResponse("", { status: 204 });
        })
      );

      const result = await client.timers.list();

      expect(result).toHaveLength(0);
    });
  });

  describe("getCurrent", () => {
    it("should get the current running timer", async () => {
      server.use(
        http.get(`${BASE_URL}/mytimers`, () => {
          return HttpResponse.json({ timers: [mockTimer] });
        })
      );

      const result = await client.timers.getCurrent();

      expect(result).not.toBeNull();
      expect(result?.status).toBe("running");
    });

    it("should return null when no timer is running", async () => {
      server.use(
        http.get(`${BASE_URL}/mytimers`, () => {
          return new HttpResponse("", { status: 204 });
        })
      );

      const result = await client.timers.getCurrent();

      expect(result).toBeNull();
    });
  });

  describe("start", () => {
    it("should start a timer for a task", async () => {
      server.use(
        http.post(
          `${BASE_URL}/projects/proj_001/tasks/task_123/timer/start`,
          () => {
            return HttpResponse.json({ timer: mockTimer });
          }
        )
      );

      const result = await client.timers.start({
        entity_id: "task_123",
        type: "Task",
        project_id: "proj_001",
      });

      expect(result.status).toBe("running");
    });
  });

  describe("stop", () => {
    it("should stop the current timer", async () => {
      const stoppedTimer = { ...mockTimer, status: "stopped" as const };

      server.use(
        http.post(`${BASE_URL}/mytimers/stop`, () => {
          return HttpResponse.json({ timer: stoppedTimer });
        })
      );

      const result = await client.timers.stop({});

      expect(result.status).toBe("stopped");
    });
  });

  describe("pause", () => {
    it("should pause the current timer", async () => {
      server.use(
        http.post(`${BASE_URL}/mytimers/pause`, () => {
          return HttpResponse.json({ timer: mockPausedTimer });
        })
      );

      const result = await client.timers.pause();

      expect(result.status).toBe("paused");
    });
  });

  describe("resume", () => {
    it("should resume a paused timer", async () => {
      server.use(
        http.post(`${BASE_URL}/mytimers/resume`, () => {
          return HttpResponse.json({ timer: mockTimer });
        })
      );

      const result = await client.timers.resume();

      expect(result.status).toBe("running");
    });
  });

  describe("startForTask", () => {
    it("should start a timer for a specific task", async () => {
      server.use(
        http.post(
          `${BASE_URL}/projects/proj_001/tasks/task_123/timer/start`,
          () => {
            return HttpResponse.json({ timer: mockTimer });
          }
        )
      );

      const result = await client.timers.startForTask("proj_001", "task_123", {
        notes: "Starting work",
        bill_status: "billable",
      });

      expect(result).toBeDefined();
    });
  });

  describe("startForIssue", () => {
    it("should start a timer for a specific issue", async () => {
      const issueTimer = { ...mockTimer, entity_type: "issue" as const };

      server.use(
        http.post(
          `${BASE_URL}/projects/proj_001/issues/issue_123/timer/start`,
          () => {
            return HttpResponse.json({ timer: issueTimer });
          }
        )
      );

      const result = await client.timers.startForIssue(
        "proj_001",
        "issue_123"
      );

      expect(result).toBeDefined();
    });
  });
});
