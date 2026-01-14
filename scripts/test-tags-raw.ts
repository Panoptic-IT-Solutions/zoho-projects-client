#!/usr/bin/env npx tsx
/**
 * Raw test of tag creation to debug the API format
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
  const tokenRes = await axios.post(
    `${accountsUrl}/oauth/v2/token`,
    new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  const token = tokenRes.data.access_token;
  const headers = { Authorization: `Zoho-oauthtoken ${token}` };

  const timestamp = Date.now();
  const testTagName = `test-tag-${timestamp}`;

  console.log("=== Raw Tag API Test ===\n");

  // Test 1: JSON body with { tags: [...] }
  console.log("Test 1: JSON body { tags: [{name}] }");
  try {
    const res = await axios.post(
      `${apiUrl}/api/v3/portal/${portalId}/tags`,
      { tags: [{ name: testTagName + "-json" }] },
      { headers: { ...headers, "Content-Type": "application/json" } }
    );
    console.log("✓ Success:", res.data);
  } catch (e: any) {
    console.log("✗ Failed:", e.response?.data?.error?.details || e.response?.data);
  }

  // Test 2: Form data with tags field and color
  console.log("\nTest 2: Form data with tags field and color");
  try {
    const formData = new FormData();
    formData.append("tags", JSON.stringify([{ name: testTagName + "-form", color_class: "bg0dd3d3" }]));
    const res = await axios.post(
      `${apiUrl}/api/v3/portal/${portalId}/tags`,
      formData,
      { headers }
    );
    console.log("✓ Success:", JSON.stringify(res.data, null, 2));
  } catch (e: any) {
    console.log("✗ Failed:", e.response?.data?.error?.details || e.response?.data);
  }

  // Test 3: URLSearchParams with color
  console.log("\nTest 3: URLSearchParams with color");
  try {
    const res = await axios.post(
      `${apiUrl}/api/v3/portal/${portalId}/tags`,
      new URLSearchParams({
        tags: JSON.stringify([{ name: testTagName + "-urlenc", color_class: "bgff6900" }]),
      }),
      { headers: { ...headers, "Content-Type": "application/x-www-form-urlencoded" } }
    );
    console.log("✓ Success:", JSON.stringify(res.data, null, 2));
  } catch (e: any) {
    console.log("✗ Failed:", e.response?.data?.error?.details || e.response?.data);
  }

  // Test 4: Direct JSON array
  console.log("\nTest 4: Direct JSON array [{ name }]");
  try {
    const res = await axios.post(
      `${apiUrl}/api/v3/portal/${portalId}/tags`,
      [{ name: testTagName + "-arr" }],
      { headers: { ...headers, "Content-Type": "application/json" } }
    );
    console.log("✓ Success:", res.data);
  } catch (e: any) {
    console.log("✗ Failed:", e.response?.data?.error?.details || e.response?.data);
  }

  console.log("\n=== Done ===");
}

main().catch(e => {
  console.error("Error:", e.message);
  process.exit(1);
});
