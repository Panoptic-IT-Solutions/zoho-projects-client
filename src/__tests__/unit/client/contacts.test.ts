/**
 * Unit tests for contacts API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import { mockContact, mockContacts } from "../../fixtures/contacts.js";

const TEST_PORTAL_ID = "12345";
const BASE_URL = `https://projectsapi.zoho.com/api/v3/portal/${TEST_PORTAL_ID}`;

describe("contacts", () => {
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
    it("should list all contacts", async () => {
      server.use(
        http.get(`${BASE_URL}/contacts`, () => {
          return HttpResponse.json({
            contacts: mockContacts,
            page_info: { page: 1, per_page: 100, has_more_page: false },
          });
        })
      );

      const result = await client.contacts.list();

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toMatchObject({
        id: expect.any(String),
        first_name: expect.any(String),
      });
    });
  });

  describe("get", () => {
    it("should get a single contact by ID", async () => {
      server.use(
        http.get(`${BASE_URL}/contacts/contact_001`, () => {
          return HttpResponse.json({ contacts: [mockContact] });
        })
      );

      const result = await client.contacts.get("contact_001");

      expect(result.id).toBe("contact_001");
      expect(result.first_name).toBe("Jane");
      expect(result.last_name).toBe("Smith");
    });
  });

  describe("create", () => {
    it("should create a contact", async () => {
      let capturedBody: unknown;

      server.use(
        http.post(`${BASE_URL}/contacts`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({ contacts: [mockContact] });
        })
      );

      const result = await client.contacts.create({
        first_name: "Jane",
        last_name: "Smith",
        email: "jane.smith@acme.com",
      });

      expect(capturedBody).toMatchObject({
        first_name: "Jane",
        last_name: "Smith",
        email: "jane.smith@acme.com",
      });
      expect(result.first_name).toBe("Jane");
    });
  });

  describe("update", () => {
    it("should update a contact", async () => {
      const updatedContact = { ...mockContact, designation: "VP Engineering" };

      server.use(
        http.put(`${BASE_URL}/contacts/contact_001`, () => {
          return HttpResponse.json({ contacts: [updatedContact] });
        })
      );

      const result = await client.contacts.update("contact_001", {
        designation: "VP Engineering",
      });

      expect(result.designation).toBe("VP Engineering");
    });
  });

  describe("delete", () => {
    it("should delete a contact", async () => {
      server.use(
        http.delete(`${BASE_URL}/contacts/contact_001`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(
        client.contacts.delete("contact_001")
      ).resolves.toBeUndefined();
    });
  });
});
