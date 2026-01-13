#!/usr/bin/env npx tsx
/**
 * Delete project named "test" using V3 API
 *
 * V3 API uses POST /projects/{projectId}/trash to move to trash,
 * not DELETE /projects/{projectId}
 */
import "dotenv/config";
import axios from "axios";

const portalId = process.env.ZOHO_PORTAL_ID!;
const clientId = process.env.ZOHO_CLIENT_ID!;
const clientSecret = process.env.ZOHO_CLIENT_SECRET!;
const refreshToken = process.env.ZOHO_REFRESH_TOKEN!;
const accountsUrl = process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.eu";
const apiUrl = process.env.ZOHO_API_URL || "https://projectsapi.zoho.eu";

async function main() {
  // Get access token
  const tokenRes = await axios.post(`${accountsUrl}/oauth/v2/token`, null, {
    params: {
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    },
  });
  const token = tokenRes.data.access_token;
  const authHeader = { Authorization: `Zoho-oauthtoken ${token}` };

  // List projects to find "test"
  const projectsRes = await axios.get(`${apiUrl}/api/v3/portal/${portalId}/projects`, {
    headers: authHeader,
    params: { page: 1, per_page: 100 },
  });

  // V3 API returns projects as a direct array, not wrapped in { projects: [...] }
  const projects = Array.isArray(projectsRes.data) ? projectsRes.data : (projectsRes.data.projects || []);
  console.log(`Found ${projects.length} projects`);

  // Find project named "test" (case insensitive)
  const testProject = projects.find((p: any) => p.name.toLowerCase() === "test");

  if (!testProject) {
    console.log('No project named "test" found');
    console.log("Available projects:");
    for (const p of projects) {
      console.log(`  - ${p.id}: ${p.name}`);
    }
    return;
  }

  console.log(`Found project: ${testProject.id} - ${testProject.name}`);
  console.log("Moving to trash via V3 API...");

  // V3 API: POST /api/v3/portal/{portalId}/projects/{projectId}/trash
  await axios.post(
    `${apiUrl}/api/v3/portal/${portalId}/projects/${testProject.id}/trash`,
    {},
    { headers: authHeader }
  );

  console.log("Moved to trash successfully!");
}

main().catch((e: any) => console.error("Error:", e.response?.data || e.message));
