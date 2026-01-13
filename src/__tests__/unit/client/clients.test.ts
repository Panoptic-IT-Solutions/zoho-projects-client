/**
 * Unit tests for clients API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import { mockClient, mockClients } from "../../fixtures/clients.js";

const TEST_PORTAL_ID = "12345";
const BASE_URL = `https://projectsapi.zoho.com/api/v3/portal/${TEST_PORTAL_ID}`;

describe("clients", () => {
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
    it("should list all clients", async () => {
      server.use(
        http.get(`${BASE_URL}/clients`, () => {
          return HttpResponse.json({
            clients: mockClients,
            page_info: { page: 1, per_page: 100, has_more_page: false },
          });
        })
      );

      const result = await client.clients.list();

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
      });
    });
  });

  describe("get", () => {
    it("should get a single client by ID", async () => {
      server.use(
        http.get(`${BASE_URL}/clients/client_001`, () => {
          return HttpResponse.json({ clients: [mockClient] });
        })
      );

      const result = await client.clients.get("client_001");

      expect(result.id).toBe("client_001");
      expect(result.name).toBe("Acme Corporation");
    });
  });

  describe("create", () => {
    it("should create a client", async () => {
      let capturedBody: unknown;

      server.use(
        http.post(`${BASE_URL}/clients`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({ clients: [mockClient] });
        })
      );

      const result = await client.clients.create({
        name: "Acme Corporation",
        email: "contact@acme.com",
        phone: "+1-555-123-4567",
      });

      expect(capturedBody).toMatchObject({
        name: "Acme Corporation",
        email: "contact@acme.com",
      });
      expect(result.name).toBe("Acme Corporation");
    });
  });

  describe("update", () => {
    it("should update a client", async () => {
      const updatedClient = { ...mockClient, name: "Acme Inc" };

      server.use(
        http.put(`${BASE_URL}/clients/client_001`, () => {
          return HttpResponse.json({ clients: [updatedClient] });
        })
      );

      const result = await client.clients.update("client_001", {
        name: "Acme Inc",
      });

      expect(result.name).toBe("Acme Inc");
    });
  });

  describe("delete", () => {
    it("should delete a client", async () => {
      server.use(
        http.delete(`${BASE_URL}/clients/client_001`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(
        client.clients.delete("client_001")
      ).resolves.toBeUndefined();
    });
  });
});
