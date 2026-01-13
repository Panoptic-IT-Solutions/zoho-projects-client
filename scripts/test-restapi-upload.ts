#!/usr/bin/env npx tsx
/**
 * Test Script: Compare /restapi/ vs /api/v3/ for attachments
 */
import "dotenv/config";
import axios from "axios";
import FormData from "form-data";

const portalId = process.env.ZOHO_PORTAL_ID!;
const clientId = process.env.ZOHO_CLIENT_ID!;
const clientSecret = process.env.ZOHO_CLIENT_SECRET!;
const refreshToken = process.env.ZOHO_REFRESH_TOKEN!;
const accountsUrl = process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.eu";
const apiUrl = process.env.ZOHO_API_URL || "https://projectsapi.zoho.eu";

async function getAccessToken(): Promise<string> {
  const response = await axios.post(`${accountsUrl}/oauth/v2/token`, null, {
    params: {
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    },
  });
  return response.data.access_token;
}

async function main() {
  console.log("Testing /restapi/ (legacy) vs /api/v3/ for attachments...\n");

  const token = await getAccessToken();
  const authHeader = { Authorization: `Zoho-oauthtoken ${token}` };

  // Get existing project (use restapi because v3 has different pagination)
  const projectsRes = await axios.get(`${apiUrl}/restapi/portal/${portalId}/projects/`, {
    headers: authHeader,
    params: { index: 0, range: 5 }
  });
  const project = projectsRes.data.projects?.[0];
  if (!project) {
    console.log("No projects found");
    return;
  }
  const projectId = project.id_string || project.id;
  console.log("Using project:", projectId, project.name);

  // Create a task to attach to
  const tasklistRes = await axios.get(`${apiUrl}/api/v3/portal/${portalId}/projects/${projectId}/tasklists`, {
    headers: authHeader
  });
  const tasklist = tasklistRes.data.tasklists?.[0];

  const taskRes = await axios.post(
    `${apiUrl}/api/v3/portal/${portalId}/projects/${projectId}/tasks`,
    { name: `Attachment Test ${Date.now()}`, tasklist: { id: String(tasklist.id) } },
    { headers: authHeader }
  );
  const task = taskRes.data.tasks?.[0] || taskRes.data;
  const taskId = String(task.id);
  console.log("Created task:", taskId);

  const testBuffer = Buffer.from("Test content for attachment", "utf-8");

  // Method 1: Try /restapi/ with uploaddoc (legacy documented method)
  console.log("\n1. Testing /restapi/ task attachment with uploaddoc...");
  try {
    const formData1 = new FormData();
    formData1.append("uploaddoc", testBuffer, {
      filename: "test-restapi.txt",
      contentType: "text/plain",
    });

    const res1 = await axios.post(
      `${apiUrl}/restapi/portal/${portalId}/projects/${projectId}/tasks/${taskId}/attachments/`,
      formData1,
      { headers: { ...authHeader, ...formData1.getHeaders() } }
    );
    console.log("SUCCESS:", JSON.stringify(res1.data, null, 2));
  } catch (err: any) {
    console.log("FAILED:", err.response?.status, err.response?.data?.error?.title || err.message);
    if (err.response?.data) {
      console.log("Details:", JSON.stringify(err.response.data, null, 2));
    }
  }

  // Method 2: Try project-level document upload with /restapi/
  console.log("\n2. Testing /restapi/ project documents...");
  try {
    const formData2 = new FormData();
    formData2.append("uploaddoc", testBuffer, {
      filename: "test-document.txt",
      contentType: "text/plain",
    });

    const res2 = await axios.post(
      `${apiUrl}/restapi/portal/${portalId}/projects/${projectId}/documents/`,
      formData2,
      { headers: { ...authHeader, ...formData2.getHeaders() } }
    );
    console.log("SUCCESS:", JSON.stringify(res2.data, null, 2));
  } catch (err: any) {
    console.log("FAILED:", err.response?.status, err.response?.data?.error?.title || err.message);
  }

  // Method 3: Try /api/v3/ project documents endpoint
  console.log("\n3. Testing /api/v3/ project documents...");
  try {
    const formData3 = new FormData();
    formData3.append("uploaddoc", testBuffer, {
      filename: "test-v3-doc.txt",
      contentType: "text/plain",
    });

    const res3 = await axios.post(
      `${apiUrl}/api/v3/portal/${portalId}/projects/${projectId}/documents`,
      formData3,
      { headers: { ...authHeader, ...formData3.getHeaders() } }
    );
    console.log("SUCCESS:", JSON.stringify(res3.data, null, 2));
  } catch (err: any) {
    console.log("FAILED:", err.response?.status, err.response?.data?.error?.title || err.message);
  }

  // Method 4: List task attachments via /restapi/
  console.log("\n4. Listing task attachments via /restapi/...");
  try {
    const res4 = await axios.get(
      `${apiUrl}/restapi/portal/${portalId}/projects/${projectId}/tasks/${taskId}/attachments/`,
      { headers: authHeader }
    );
    console.log("Task attachments:", JSON.stringify(res4.data, null, 2));
  } catch (err: any) {
    console.log("FAILED:", err.response?.status, err.response?.data);
  }

  console.log("\n--- Done ---");
}

main().catch(err => console.error("Error:", err.message));
