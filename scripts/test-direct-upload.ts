#!/usr/bin/env npx tsx
/**
 * Test Script: Direct file upload to task
 * Attempts to upload a file directly to a task using V3 API
 */
import "dotenv/config";
import axios from "axios";

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
  console.log("============================================================");
  console.log("TEST: Direct File Upload to Task");
  console.log("============================================================\n");

  const token = await getAccessToken();
  console.log("Got access token\n");

  const basePath = `${apiUrl}/api/v3/portal/${portalId}`;

  // 1. Create a project
  console.log("1. CREATING PROJECT...");
  const projectRes = await axios.post(
    `${basePath}/projects`,
    { name: `Upload Test ${Date.now()}` },
    { headers: { Authorization: `Zoho-oauthtoken ${token}` } }
  );
  const project = projectRes.data.projects?.[0] || projectRes.data;
  const projectId = project.id;
  console.log(`   Created project: ${projectId}\n`);

  // 2. Create a tasklist
  console.log("2. CREATING TASKLIST...");
  const tasklistRes = await axios.post(
    `${basePath}/projects/${projectId}/tasklists`,
    { name: "Test Tasklist" },
    { headers: { Authorization: `Zoho-oauthtoken ${token}` } }
  );
  const tasklist = tasklistRes.data.tasklists?.[0] || tasklistRes.data;
  const tasklistId = tasklist.id;
  console.log(`   Created tasklist: ${tasklistId}\n`);

  // 3. Create a task
  console.log("3. CREATING TASK...");
  const taskRes = await axios.post(
    `${basePath}/projects/${projectId}/tasks`,
    { name: "Task with Attachment", tasklist: { id: tasklistId } },
    { headers: { Authorization: `Zoho-oauthtoken ${token}` } }
  );
  const task = taskRes.data.tasks?.[0] || taskRes.data;
  const taskId = task.id;
  console.log(`   Created task: ${taskId}\n`);

  // 4. Try uploading a file directly to the task
  console.log("4. UPLOADING FILE...");
  const testContent = `Test file created at ${new Date().toISOString()}\nThis is a test attachment.`;
  const testBuffer = Buffer.from(testContent, "utf-8");

  const FormData = (await import("form-data")).default;
  const formData = new FormData();
  formData.append("uploaddoc", testBuffer, {
    filename: "test.txt",
    contentType: "text/plain",
  });

  try {
    // Try the tasks attachments endpoint
    const uploadRes = await axios.post(
      `${basePath}/projects/${projectId}/tasks/${taskId}/attachments`,
      formData,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
          ...formData.getHeaders(),
        },
      }
    );
    console.log("   Upload response:", JSON.stringify(uploadRes.data, null, 2));
  } catch (error: any) {
    console.log("   Tasks endpoint failed:", error.response?.data || error.message);

    // Try alternative: upload to project attachments then associate
    console.log("\n   Trying project-level upload...");
    try {
      const formData2 = new FormData();
      formData2.append("uploaddoc", testBuffer, {
        filename: "test.txt",
        contentType: "text/plain",
      });
      formData2.append("entity_type", "task");
      formData2.append("entity_id", String(taskId));

      const uploadRes2 = await axios.post(
        `${basePath}/projects/${projectId}/attachments`,
        formData2,
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${token}`,
            ...formData2.getHeaders(),
          },
        }
      );
      console.log("   Project upload response:", JSON.stringify(uploadRes2.data, null, 2));
    } catch (error2: any) {
      console.log("   Project endpoint also failed:", error2.response?.data || error2.message);
    }
  }

  // 5. List task attachments to see if it worked
  console.log("\n5. LISTING TASK ATTACHMENTS...");
  try {
    const listRes = await axios.get(
      `${basePath}/projects/${projectId}/attachments`,
      {
        params: { entity_type: "task", entity_id: taskId },
        headers: { Authorization: `Zoho-oauthtoken ${token}` },
      }
    );
    const attachments = listRes.data.attachment || listRes.data.attachments || [];
    console.log(`   Found ${attachments.length} attachments`);
    if (attachments.length > 0) {
      console.log(`   First: ${attachments[0].name}`);
    }
  } catch (error: any) {
    console.log("   List failed:", error.response?.data || error.message);
  }

  console.log("\n============================================================");
  console.log("TEST COMPLETE");
  console.log("============================================================");
  console.log(`Project: https://projects.zoho.eu/portal/${portalId}#kanban/${projectId}`);
}

main().catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});
