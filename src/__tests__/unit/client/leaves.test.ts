/**
 * Unit tests for leaves API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import { mockLeave, mockLeaves } from "../../fixtures/leaves.js";

const TEST_PORTAL_ID = "12345";
const BASE_URL = `https://projectsapi.zoho.com/api/v3/portal/${TEST_PORTAL_ID}`;

describe("leaves", () => {
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
    it("should list all leaves", async () => {
      server.use(
        http.get(`${BASE_URL}/leaves`, () => {
          return HttpResponse.json({
            leaves: mockLeaves,
            page_info: { page: 1, per_page: 100, has_more_page: false },
          });
        })
      );

      const result = await client.leaves.list();

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toMatchObject({
        id: expect.any(String),
        user_id: expect.any(String),
        start_date: expect.any(String),
      });
    });
  });

  describe("get", () => {
    it("should get a single leave by ID", async () => {
      server.use(
        http.get(`${BASE_URL}/leaves/leave_001`, () => {
          return HttpResponse.json({ leaves: [mockLeave] });
        })
      );

      const result = await client.leaves.get("leave_001");

      expect(result.id).toBe("leave_001");
      expect(result.status).toBe("approved");
      expect(result.reason).toBe("Family vacation");
    });
  });

  describe("create", () => {
    it("should create a leave request", async () => {
      let capturedBody: unknown;

      server.use(
        http.post(`${BASE_URL}/leaves`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({ leaves: [mockLeave] });
        })
      );

      const result = await client.leaves.create({
        user_id: "user_001",
        start_date: "01-15-2024",
        end_date: "01-22-2024",
        reason: "Family vacation",
      });

      expect(capturedBody).toMatchObject({
        user_id: "user_001",
        start_date: "01-15-2024",
        end_date: "01-22-2024",
      });
      expect(result.user_id).toBe("user_001");
    });
  });

  describe("update", () => {
    it("should update a leave request", async () => {
      const updatedLeave = { ...mockLeave, status: "rejected" as const };

      server.use(
        http.put(`${BASE_URL}/leaves/leave_001`, () => {
          return HttpResponse.json({ leaves: [updatedLeave] });
        })
      );

      const result = await client.leaves.update("leave_001", {
        status: "rejected",
      });

      expect(result.status).toBe("rejected");
    });
  });

  describe("delete", () => {
    it("should delete a leave request", async () => {
      server.use(
        http.delete(`${BASE_URL}/leaves/leave_001`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(client.leaves.delete("leave_001")).resolves.toBeUndefined();
    });
  });
});
