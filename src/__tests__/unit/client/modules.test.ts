/**
 * Unit tests for modules API
 */
import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server.js";
import { createZohoProjectsClient } from "../../../client.js";
import {
  mockModule,
  mockModules,
  mockModuleField,
  mockModuleFields,
} from "../../fixtures/modules.js";

const TEST_PORTAL_ID = "12345";
const BASE_URL = `https://projectsapi.zoho.com/restapi/portal/${TEST_PORTAL_ID}`;

describe("modules", () => {
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
    it("should list all modules", async () => {
      server.use(
        http.get(`${BASE_URL}/settings/modules/`, () => {
          return HttpResponse.json({ modules: mockModules });
        })
      );

      const result = await client.modules.list();

      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
      });
    });

    it("should filter modules by is_customized", async () => {
      let capturedParams: URLSearchParams | undefined;

      server.use(
        http.get(`${BASE_URL}/settings/modules/`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            modules: mockModules.filter((m) => m.is_customized),
          });
        })
      );

      const result = await client.modules.list({ is_customized: true });

      expect(capturedParams?.get("is_customized")).toBe("true");
      expect(result).toHaveLength(1);
      expect(result[0].is_customized).toBe(true);
    });
  });

  describe("get", () => {
    it("should get a single module by ID", async () => {
      server.use(
        http.get(`${BASE_URL}/settings/modules/1001/`, () => {
          return HttpResponse.json({ modules: [mockModule] });
        })
      );

      const result = await client.modules.get("1001");

      expect(result.id).toBe("1001");
      expect(result.name).toBe("Tasks");
    });
  });

  describe("getFields", () => {
    it("should get fields for a module", async () => {
      server.use(
        http.get(`${BASE_URL}/settings/modules/1001/fields/`, () => {
          return HttpResponse.json({ fields: mockModuleFields });
        })
      );

      const result = await client.modules.getFields("1001");

      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        field_type: expect.any(String),
      });
    });
  });

  describe("getField", () => {
    it("should get a specific field", async () => {
      server.use(
        http.get(`${BASE_URL}/settings/modules/1001/fields/cf_100/`, () => {
          return HttpResponse.json({ fields: [mockModuleField] });
        })
      );

      const result = await client.modules.getField("1001", "cf_100");

      expect(result.id).toBe("cf_100");
      expect(result.field_type).toBe("picklist");
      expect(result.pick_list_values).toHaveLength(3);
    });
  });

  describe("getProjectFields", () => {
    it("should get project-specific fields", async () => {
      server.use(
        http.get(
          `${BASE_URL}/projects/proj_001/settings/modules/1001/fields/`,
          () => {
            return HttpResponse.json({ fields: mockModuleFields });
          }
        )
      );

      const result = await client.modules.getProjectFields("proj_001", "1001");

      expect(result).toHaveLength(3);
    });
  });
});
