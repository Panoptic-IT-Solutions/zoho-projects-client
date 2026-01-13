/**
 * Unit tests for comments API (polymorphic)
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import {
  createCommentFixture,
  createCommentListFixture,
  createCommentListResponse,
} from "../../fixtures/comments.js";

const TEST_PORTAL_ID = "12345";
const TEST_PROJECT_ID = "67890";
const TEST_TASK_ID = "11111";
const TEST_ISSUE_ID = "22222";
const BASE_URL = `https://projectsapi.zoho.com/api/v3/portal/${TEST_PORTAL_ID}/projects/${TEST_PROJECT_ID}`;

describe("comments", () => {
  let client: ReturnType<typeof createZohoProjectsClient>;

  beforeEach(() => {
    client = createZohoProjectsClient({
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
      refreshToken: "test-refresh-token",
      portalId: TEST_PORTAL_ID,
    });
  });

  describe("forTask", () => {
    describe("list", () => {
      it("should list comments for a task", async () => {
        const mockComments = createCommentListFixture(3);

        server.use(
          http.get(`${BASE_URL}/tasks/${TEST_TASK_ID}/comments`, () => {
            return HttpResponse.json(createCommentListResponse(mockComments));
          })
        );

        const taskComments = client.comments.forTask(TEST_PROJECT_ID, TEST_TASK_ID);
        const result = await taskComments.list();

        expect(result.data).toHaveLength(3);
        expect(result.data[0]).toMatchObject({
          id: expect.any(Number),
          content: expect.any(String),
        });
      });
    });

    describe("create", () => {
      it("should create a comment on a task", async () => {
        const newComment = createCommentFixture({ content: "New comment on task" });

        server.use(
          http.post(`${BASE_URL}/tasks/${TEST_TASK_ID}/comments`, async () => {
            return HttpResponse.json({ comments: [newComment] });
          })
        );

        const taskComments = client.comments.forTask(TEST_PROJECT_ID, TEST_TASK_ID);
        const result = await taskComments.create({ content: "New comment on task" });

        expect(result.content).toBe("New comment on task");
      });
    });

    describe("delete", () => {
      it("should delete a comment from a task", async () => {
        server.use(
          http.delete(`${BASE_URL}/tasks/${TEST_TASK_ID}/comments/333`, () => {
            return new HttpResponse(null, { status: 204 });
          })
        );

        const taskComments = client.comments.forTask(TEST_PROJECT_ID, TEST_TASK_ID);
        await expect(taskComments.delete("333")).resolves.toBeUndefined();
      });
    });
  });

  describe("forIssue", () => {
    describe("list", () => {
      it("should list comments for an issue", async () => {
        const mockComments = createCommentListFixture(3);

        server.use(
          http.get(`${BASE_URL}/bugs/${TEST_ISSUE_ID}/comments`, () => {
            return HttpResponse.json(createCommentListResponse(mockComments));
          })
        );

        const issueComments = client.comments.forIssue(TEST_PROJECT_ID, TEST_ISSUE_ID);
        const result = await issueComments.list();

        expect(result.data).toHaveLength(3);
      });
    });

    describe("create", () => {
      it("should create a comment on an issue", async () => {
        const newComment = createCommentFixture({ content: "New comment on bug" });

        server.use(
          http.post(`${BASE_URL}/bugs/${TEST_ISSUE_ID}/comments`, async () => {
            return HttpResponse.json({ comments: [newComment] });
          })
        );

        const issueComments = client.comments.forIssue(TEST_PROJECT_ID, TEST_ISSUE_ID);
        const result = await issueComments.create({ content: "New comment on bug" });

        expect(result.content).toBe("New comment on bug");
      });
    });

    describe("delete", () => {
      it("should delete a comment from an issue", async () => {
        server.use(
          http.delete(`${BASE_URL}/bugs/${TEST_ISSUE_ID}/comments/333`, () => {
            return new HttpResponse(null, { status: 204 });
          })
        );

        const issueComments = client.comments.forIssue(TEST_PROJECT_ID, TEST_ISSUE_ID);
        await expect(issueComments.delete("333")).resolves.toBeUndefined();
      });
    });
  });
});
