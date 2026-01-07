/**
 * Unit tests for blueprints API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import {
  mockBlueprint,
  mockBlueprints,
  mockNextTransitionsResponse,
  mockDuringActionsResponse,
} from "../../fixtures/blueprints.js";

const TEST_PORTAL_ID = "12345";
const BASE_URL = `https://projectsapi.zoho.com/restapi/portal/${TEST_PORTAL_ID}`;

describe("blueprints", () => {
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
    it("should list all blueprints", async () => {
      server.use(
        http.get(`${BASE_URL}/settings/blueprints/`, () => {
          return HttpResponse.json({
            blueprints: mockBlueprints,
            page_info: { page: 1, per_page: 100, has_more_page: false },
          });
        })
      );

      const result = await client.blueprints.list();

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
      });
    });
  });

  describe("get", () => {
    it("should get a single blueprint by ID", async () => {
      server.use(
        http.get(`${BASE_URL}/settings/blueprints/bp_001/`, () => {
          return HttpResponse.json({ blueprints: [mockBlueprint] });
        })
      );

      const result = await client.blueprints.get("bp_001");

      expect(result.id).toBe("bp_001");
      expect(result.name).toBe("Task Workflow");
      expect(result.transitions).toHaveLength(2);
    });
  });

  describe("getNextTransitions", () => {
    it("should get available transitions for a task", async () => {
      server.use(
        http.get(`${BASE_URL}/projects/proj_001/tasks/task_123/transitions/`, () => {
          return HttpResponse.json(mockNextTransitionsResponse);
        })
      );

      const result = await client.blueprints.getNextTransitions(
        "proj_001",
        "Task",
        "task_123"
      );

      expect(result.transitions).toHaveLength(1);
      expect(result.blueprint?.name).toBe("Task Workflow");
    });

    it("should get available transitions for an issue", async () => {
      server.use(
        http.get(`${BASE_URL}/projects/proj_001/bugs/issue_123/transitions/`, () => {
          return HttpResponse.json(mockNextTransitionsResponse);
        })
      );

      const result = await client.blueprints.getNextTransitions(
        "proj_001",
        "Issue",
        "issue_123"
      );

      expect(result.transitions).toHaveLength(1);
    });
  });

  describe("getDuringActions", () => {
    it("should get required actions for a transition", async () => {
      server.use(
        http.get(
          `${BASE_URL}/projects/proj_001/tasks/task_123/transitions/trans_001/actions/`,
          () => {
            return HttpResponse.json(mockDuringActionsResponse);
          }
        )
      );

      const result = await client.blueprints.getDuringActions(
        "proj_001",
        "Task",
        "task_123",
        "trans_001"
      );

      expect(result.actions).toHaveLength(1);
      expect(result.actions[0].is_mandatory).toBe(true);
    });
  });

  describe("executeTransition", () => {
    it("should execute a blueprint transition", async () => {
      let capturedBody: unknown;

      server.use(
        http.post(
          `${BASE_URL}/projects/proj_001/tasks/task_123/transitions/trans_001/`,
          async ({ request }) => {
            capturedBody = await request.json();
            return new HttpResponse(null, { status: 200 });
          }
        )
      );

      await client.blueprints.executeTransition("proj_001", "Task", "trans_001", {
        entity_id: "task_123",
        field_values: [{ id: "comment", value: "Moving to in progress" }],
      });

      expect(capturedBody).toMatchObject({
        field_values: [{ id: "comment", value: "Moving to in progress" }],
      });
    });
  });

  describe("getTaskTransitions", () => {
    it("should get transitions for a task", async () => {
      server.use(
        http.get(`${BASE_URL}/projects/proj_001/tasks/task_123/transitions/`, () => {
          return HttpResponse.json(mockNextTransitionsResponse);
        })
      );

      const result = await client.blueprints.getTaskTransitions(
        "proj_001",
        "task_123"
      );

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Move to In Progress");
    });
  });

  describe("getIssueTransitions", () => {
    it("should get transitions for an issue", async () => {
      server.use(
        http.get(`${BASE_URL}/projects/proj_001/bugs/issue_123/transitions/`, () => {
          return HttpResponse.json(mockNextTransitionsResponse);
        })
      );

      const result = await client.blueprints.getIssueTransitions(
        "proj_001",
        "issue_123"
      );

      expect(result).toHaveLength(1);
    });
  });

  describe("executeTaskTransition", () => {
    it("should execute a task transition", async () => {
      server.use(
        http.post(
          `${BASE_URL}/projects/proj_001/tasks/task_123/transitions/trans_001/`,
          () => {
            return new HttpResponse(null, { status: 200 });
          }
        )
      );

      await expect(
        client.blueprints.executeTaskTransition(
          "proj_001",
          "task_123",
          "trans_001"
        )
      ).resolves.toBeUndefined();
    });
  });

  describe("executeIssueTransition", () => {
    it("should execute an issue transition", async () => {
      server.use(
        http.post(
          `${BASE_URL}/projects/proj_001/bugs/issue_123/transitions/trans_001/`,
          () => {
            return new HttpResponse(null, { status: 200 });
          }
        )
      );

      await expect(
        client.blueprints.executeIssueTransition(
          "proj_001",
          "issue_123",
          "trans_001"
        )
      ).resolves.toBeUndefined();
    });
  });
});
