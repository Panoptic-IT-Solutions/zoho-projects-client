/**
 * Unit tests for profiles API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import { mockProfile, mockProfiles } from "../../fixtures/profiles.js";

const TEST_PORTAL_ID = "12345";
const BASE_URL = `https://projectsapi.zoho.com/restapi/portal/${TEST_PORTAL_ID}`;

describe("profiles", () => {
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
    it("should list all profiles", async () => {
      server.use(
        http.get(`${BASE_URL}/profiles/`, () => {
          return HttpResponse.json({
            profiles: mockProfiles,
            page_info: { page: 1, per_page: 100, has_more_page: false },
          });
        })
      );

      const result = await client.profiles.list();

      expect(result.data).toHaveLength(3);
      expect(result.data[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
      });
    });
  });

  describe("get", () => {
    it("should get a single profile by ID", async () => {
      server.use(
        http.get(`${BASE_URL}/profiles/profile_001/`, () => {
          return HttpResponse.json({ profiles: [mockProfile] });
        })
      );

      const result = await client.profiles.get("profile_001");

      expect(result.id).toBe("profile_001");
      expect(result.name).toBe("Standard User");
    });
  });

  describe("create", () => {
    it("should create a profile", async () => {
      let capturedBody: unknown;

      server.use(
        http.post(`${BASE_URL}/profiles/`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({ profiles: [mockProfile] });
        })
      );

      const result = await client.profiles.create({
        name: "Standard User",
        description: "Default profile for regular users",
      });

      expect(capturedBody).toMatchObject({
        name: "Standard User",
        description: "Default profile for regular users",
      });
      expect(result.name).toBe("Standard User");
    });
  });

  describe("update", () => {
    it("should update a profile", async () => {
      const updatedProfile = { ...mockProfile, name: "Power User" };

      server.use(
        http.put(`${BASE_URL}/profiles/profile_001/`, () => {
          return HttpResponse.json({ profiles: [updatedProfile] });
        })
      );

      const result = await client.profiles.update("profile_001", {
        name: "Power User",
      });

      expect(result.name).toBe("Power User");
    });
  });

  describe("delete", () => {
    it("should delete a profile", async () => {
      server.use(
        http.delete(`${BASE_URL}/profiles/profile_001/`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(
        client.profiles.delete("profile_001")
      ).resolves.toBeUndefined();
    });
  });
});
