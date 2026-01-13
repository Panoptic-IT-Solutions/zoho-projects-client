/**
 * Unit tests for roles API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import { mockRole, mockRoles } from "../../fixtures/roles.js";

const TEST_PORTAL_ID = "12345";
const BASE_URL = `https://projectsapi.zoho.com/api/v3/portal/${TEST_PORTAL_ID}`;

describe("roles", () => {
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
    it("should list all roles", async () => {
      server.use(
        http.get(`${BASE_URL}/roles`, () => {
          return HttpResponse.json({
            roles: mockRoles,
            page_info: { page: 1, per_page: 100, has_more_page: false },
          });
        })
      );

      const result = await client.roles.list();

      expect(result.data).toHaveLength(3);
      expect(result.data[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
      });
    });
  });

  describe("get", () => {
    it("should get a single role by ID", async () => {
      server.use(
        http.get(`${BASE_URL}/roles/role_001`, () => {
          return HttpResponse.json({ roles: [mockRole] });
        })
      );

      const result = await client.roles.get("role_001");

      expect(result.id).toBe("role_001");
      expect(result.name).toBe("Project Manager");
    });
  });

  describe("create", () => {
    it("should create a role", async () => {
      let capturedBody: unknown;

      server.use(
        http.post(`${BASE_URL}/roles`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({ roles: [mockRole] });
        })
      );

      const result = await client.roles.create({
        name: "Project Manager",
        description: "Can manage projects",
      });

      expect(capturedBody).toMatchObject({
        name: "Project Manager",
        description: "Can manage projects",
      });
      expect(result.name).toBe("Project Manager");
    });
  });

  describe("update", () => {
    it("should update a role", async () => {
      const updatedRole = { ...mockRole, name: "Senior Manager" };

      server.use(
        http.put(`${BASE_URL}/roles/role_001`, () => {
          return HttpResponse.json({ roles: [updatedRole] });
        })
      );

      const result = await client.roles.update("role_001", {
        name: "Senior Manager",
      });

      expect(result.name).toBe("Senior Manager");
    });
  });

  describe("delete", () => {
    it("should delete a role", async () => {
      server.use(
        http.delete(`${BASE_URL}/roles/role_001`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(client.roles.delete("role_001")).resolves.toBeUndefined();
    });
  });
});
