/**
 * Unit tests for teams API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import { mockTeam, mockTeams } from "../../fixtures/teams.js";

const TEST_PORTAL_ID = "12345";
const BASE_URL = `https://projectsapi.zoho.com/api/v3/portal/${TEST_PORTAL_ID}`;

describe("teams", () => {
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
    it("should list all teams", async () => {
      server.use(
        http.get(`${BASE_URL}/teams`, () => {
          return HttpResponse.json({
            teams: mockTeams,
            page_info: { page: 1, per_page: 100, has_more_page: false },
          });
        })
      );

      const result = await client.teams.list();

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
      });
    });
  });

  describe("get", () => {
    it("should get a single team by ID", async () => {
      server.use(
        http.get(`${BASE_URL}/teams/team_001`, () => {
          return HttpResponse.json({ teams: [mockTeam] });
        })
      );

      const result = await client.teams.get("team_001");

      expect(result.id).toBe("team_001");
      expect(result.name).toBe("Engineering Team");
      expect(result.members).toHaveLength(3);
    });
  });

  describe("create", () => {
    it("should create a team", async () => {
      let capturedBody: unknown;

      server.use(
        http.post(`${BASE_URL}/teams`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({ teams: [mockTeam] });
        })
      );

      const result = await client.teams.create({
        name: "Engineering Team",
        description: "Core engineering team",
        lead_id: "user_001",
      });

      expect(capturedBody).toMatchObject({
        name: "Engineering Team",
        description: "Core engineering team",
      });
      expect(result.name).toBe("Engineering Team");
    });
  });

  describe("update", () => {
    it("should update a team", async () => {
      const updatedTeam = { ...mockTeam, name: "Core Engineering" };

      server.use(
        http.put(`${BASE_URL}/teams/team_001`, () => {
          return HttpResponse.json({ teams: [updatedTeam] });
        })
      );

      const result = await client.teams.update("team_001", {
        name: "Core Engineering",
      });

      expect(result.name).toBe("Core Engineering");
    });
  });

  describe("delete", () => {
    it("should delete a team", async () => {
      server.use(
        http.delete(`${BASE_URL}/teams/team_001`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(client.teams.delete("team_001")).resolves.toBeUndefined();
    });
  });

  describe("addMembers", () => {
    it("should add members to a team", async () => {
      const updatedTeam = {
        ...mockTeam,
        members: [
          ...(mockTeam.members || []),
          { id: "user_005", name: "New Member", email: "new@example.com" },
        ],
        members_count: 4,
      };

      server.use(
        http.post(`${BASE_URL}/teams/team_001/members`, () => {
          return HttpResponse.json({ teams: [updatedTeam] });
        })
      );

      const result = await client.teams.addMembers("team_001", {
        members: "user_005",
      });

      expect(result.members_count).toBe(4);
    });
  });

  describe("removeMember", () => {
    it("should remove a member from a team", async () => {
      server.use(
        http.delete(`${BASE_URL}/teams/team_001/members/user_003`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(
        client.teams.removeMember("team_001", "user_003")
      ).resolves.toBeUndefined();
    });
  });
});
