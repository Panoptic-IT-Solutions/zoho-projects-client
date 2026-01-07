/**
 * Integration test setup - creates a real client for testing against Zoho API
 */
import { createZohoProjectsClient, type ZohoProjectsClient } from "../../client.js";

// Cached client instance
let client: ZohoProjectsClient | null = null;

/**
 * Get or create a test client using environment variables
 */
export function getTestClient(): ZohoProjectsClient {
  if (client) {
    return client;
  }

  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
  const portalId = process.env.ZOHO_PORTAL_ID;

  if (!clientId || !clientSecret || !refreshToken || !portalId) {
    throw new Error(
      "Integration tests require environment variables: " +
        "ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, ZOHO_PORTAL_ID"
    );
  }

  client = createZohoProjectsClient({
    clientId,
    clientSecret,
    refreshToken,
    portalId,
  });

  return client;
}

/**
 * Get a test project ID - uses the first available project
 */
let testProjectId: string | null = null;

export async function getTestProjectId(): Promise<string> {
  if (testProjectId) {
    return testProjectId;
  }

  const client = getTestClient();
  const projects = await client.projects.listAll({ maxItems: 1 });

  if (projects.length === 0) {
    throw new Error("Integration tests require at least one project in the portal");
  }

  testProjectId = projects[0].id_string;
  return testProjectId;
}

/**
 * Generate a unique test name to avoid collisions
 */
export function generateTestName(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
