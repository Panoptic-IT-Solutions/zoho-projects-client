/**
 * Unit tests for portals API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import { mockPortal, mockPortals } from "../../fixtures/portals.js";

const TEST_PORTAL_ID = "123456789";
const BASE_URL = "https://projectsapi.zoho.com/restapi";

describe("portals", () => {
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
    it("should list all portals", async () => {
      server.use(
        http.get(`${BASE_URL}/portals`, () => {
          return HttpResponse.json({ portals: mockPortals });
        })
      );

      const result = await client.portals.list();

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
      });
    });
  });

  describe("get", () => {
    it("should get a single portal by ID", async () => {
      server.use(
        http.get(`${BASE_URL}/portals/${TEST_PORTAL_ID}`, () => {
          return HttpResponse.json({ portals: [mockPortal] });
        })
      );

      const result = await client.portals.get(TEST_PORTAL_ID);

      expect(result.id).toBe(TEST_PORTAL_ID);
      expect(result.name).toBe("Test Portal");
    });
  });

  describe("getCurrent", () => {
    it("should get the current portal configured in the client", async () => {
      server.use(
        http.get(`${BASE_URL}/portals/${TEST_PORTAL_ID}`, () => {
          return HttpResponse.json({ portals: [mockPortal] });
        })
      );

      const result = await client.portals.getCurrent();

      expect(result.id).toBe(TEST_PORTAL_ID);
    });
  });
});
