/**
 * Unit tests for followers API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import { mockFollower, mockFollowers } from "../../fixtures/followers.js";

const TEST_PORTAL_ID = "12345";
const BASE_URL = `https://projectsapi.zoho.com/restapi/portal/${TEST_PORTAL_ID}`;

describe("followers", () => {
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
      it("should list followers for a task", async () => {
        server.use(
          http.get(
            `${BASE_URL}/projects/proj_001/tasks/task_001/followers/`,
            () => {
              return HttpResponse.json({
                followers: mockFollowers,
                page_info: { page: 1, per_page: 100, has_more_page: false },
              });
            }
          )
        );

        const taskFollowers = client.followers.forTask("proj_001", "task_001");
        const result = await taskFollowers.list();

        expect(result.data).toHaveLength(3);
        expect(result.data[0]).toMatchObject({
          id: expect.anything(),
          name: expect.any(String),
        });
      });
    });

    describe("add", () => {
      it("should add followers to a task", async () => {
        let capturedBody: unknown;

        server.use(
          http.post(
            `${BASE_URL}/projects/proj_001/tasks/task_001/followers/`,
            async ({ request }) => {
              capturedBody = await request.json();
              return HttpResponse.json({ followers: mockFollowers });
            }
          )
        );

        const taskFollowers = client.followers.forTask("proj_001", "task_001");
        const result = await taskFollowers.add({ followers: "user_001,user_002" });

        expect(capturedBody).toMatchObject({
          followers: "user_001,user_002",
        });
        expect(result).toHaveLength(3);
      });
    });

    describe("remove", () => {
      it("should remove a follower from a task", async () => {
        server.use(
          http.delete(
            `${BASE_URL}/projects/proj_001/tasks/task_001/followers/user_001/`,
            () => {
              return new HttpResponse(null, { status: 204 });
            }
          )
        );

        const taskFollowers = client.followers.forTask("proj_001", "task_001");
        await expect(taskFollowers.remove("user_001")).resolves.toBeUndefined();
      });
    });

    describe("follow", () => {
      it("should follow an entity (add current user)", async () => {
        server.use(
          http.post(
            `${BASE_URL}/projects/proj_001/tasks/task_001/followers/me/`,
            () => {
              return HttpResponse.json({});
            }
          )
        );

        const taskFollowers = client.followers.forTask("proj_001", "task_001");
        await expect(taskFollowers.follow()).resolves.toBeUndefined();
      });
    });

    describe("unfollow", () => {
      it("should unfollow an entity (remove current user)", async () => {
        server.use(
          http.delete(
            `${BASE_URL}/projects/proj_001/tasks/task_001/followers/me/`,
            () => {
              return new HttpResponse(null, { status: 204 });
            }
          )
        );

        const taskFollowers = client.followers.forTask("proj_001", "task_001");
        await expect(taskFollowers.unfollow()).resolves.toBeUndefined();
      });
    });
  });

  describe("forIssue", () => {
    it("should list followers for an issue", async () => {
      server.use(
        http.get(
          `${BASE_URL}/projects/proj_001/bugs/bug_001/followers/`,
          () => {
            return HttpResponse.json({
              followers: mockFollowers,
              page_info: { page: 1, per_page: 100, has_more_page: false },
            });
          }
        )
      );

      const issueFollowers = client.followers.forIssue("proj_001", "bug_001");
      const result = await issueFollowers.list();

      expect(result.data).toHaveLength(3);
    });
  });

  describe("forForum", () => {
    it("should list followers for a forum", async () => {
      server.use(
        http.get(
          `${BASE_URL}/projects/proj_001/forums/forum_001/followers/`,
          () => {
            return HttpResponse.json({
              followers: mockFollowers,
              page_info: { page: 1, per_page: 100, has_more_page: false },
            });
          }
        )
      );

      const forumFollowers = client.followers.forForum("proj_001", "forum_001");
      const result = await forumFollowers.list();

      expect(result.data).toHaveLength(3);
    });
  });
});
