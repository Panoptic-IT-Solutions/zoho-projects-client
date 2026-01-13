/**
 * Unit tests for groups API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import {
  createGroupFixture,
  createGroupListFixture,
  createGroupListResponse,
} from "../../fixtures/groups.js";

const TEST_PORTAL_ID = "12345";
const BASE_URL = `https://projectsapi.zoho.com/api/v3/portal/${TEST_PORTAL_ID}`;

describe("groups", () => {
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
    it("should list groups", async () => {
      const mockGroups = createGroupListFixture(3);

      server.use(
        http.get(`${BASE_URL}/groups`, () => {
          return HttpResponse.json(createGroupListResponse(mockGroups));
        })
      );

      const result = await client.groups.list();

      expect(result.data).toHaveLength(3);
      expect(result.data[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
      });
    });
  });

  describe("get", () => {
    it("should get a single group by ID", async () => {
      const mockGroup = createGroupFixture({ id: "123", id_string: "123" });

      server.use(
        http.get(`${BASE_URL}/groups/123`, () => {
          return HttpResponse.json({ groups: [mockGroup] });
        })
      );

      const result = await client.groups.get("123");
      expect(result.id_string).toBe("123");
    });
  });

  describe("create", () => {
    it("should create a group", async () => {
      const newGroup = createGroupFixture({ name: "New Group" });

      server.use(
        http.post(`${BASE_URL}/groups`, async () => {
          return HttpResponse.json({ groups: [newGroup] });
        })
      );

      const result = await client.groups.create({ name: "New Group" });
      expect(result.name).toBe("New Group");
    });
  });

  describe("update", () => {
    it("should update a group", async () => {
      const updatedGroup = createGroupFixture({ id: "123", id_string: "123", name: "Updated Group" });

      server.use(
        http.put(`${BASE_URL}/groups/123`, () => {
          return HttpResponse.json({ groups: [updatedGroup] });
        })
      );

      const result = await client.groups.update("123", { name: "Updated Group" });
      expect(result.name).toBe("Updated Group");
    });
  });

  describe("delete", () => {
    it("should delete a group", async () => {
      server.use(
        http.delete(`${BASE_URL}/groups/123`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(client.groups.delete("123")).resolves.toBeUndefined();
    });
  });
});
