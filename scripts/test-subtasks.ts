#!/usr/bin/env npx tsx
/**
 * Integration test for subtasks using V3 API with parental_info
 */
import "dotenv/config";
import axios from "axios";
import { createZohoProjectsClient } from "../src/index.js";

const portalId = process.env.ZOHO_PORTAL_ID!;
const clientId = process.env.ZOHO_CLIENT_ID!;
const clientSecret = process.env.ZOHO_CLIENT_SECRET!;
const refreshToken = process.env.ZOHO_REFRESH_TOKEN!;
const accountsUrl = process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.eu";
const apiUrl = process.env.ZOHO_API_URL || "https://projectsapi.zoho.eu";

async function getAccessToken(): Promise<string> {
  const response = await axios.post(
    `${accountsUrl}/oauth/v2/token`,
    new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return response.data.access_token;
}

async function main() {
  console.log("=== Subtask V3 API Test ===\n");

  const client = createZohoProjectsClient({
    clientId,
    clientSecret,
    refreshToken,
    portalId,
    accountsUrl,
    apiUrl,
  });

  const timestamp = Date.now();

  // Get a project and tasklist to work with
  console.log("1. Getting project and tasklist...");
  const { data: projects } = await client.projects.list({ per_page: 10 });
  const project = projects[0];
  if (!project) {
    console.log("   ✗ No projects found");
    return;
  }
  const projectId = project.id_string || String(project.id);
  console.log(`   Using project: ${project.name} (${projectId})`);

  const { data: tasklists } = await client.tasklists.list(projectId);
  const tasklist = tasklists[0];
  if (!tasklist) {
    console.log("   ✗ No tasklists found");
    return;
  }
  const tasklistId = tasklist.id_string || String(tasklist.id);
  console.log(`   Using tasklist: ${tasklist.name} (${tasklistId})`);

  // Create a parent task
  console.log("\n2. Creating parent task...");
  let parentTask;
  try {
    parentTask = await client.tasks.create(projectId, {
      name: `Parent Task ${timestamp}`,
      tasklist: { id: tasklistId },
    });
    console.log(`   ✓ Created: ${parentTask.name} (${parentTask.id_string || parentTask.id})`);
  } catch (e: any) {
    console.log(`   ✗ Failed: ${e.message}`);
    console.log(`   Response: ${JSON.stringify(e.details || e.cause?.response?.data, null, 2)}`);
    return;
  }

  const parentTaskId = parentTask.id_string || String(parentTask.id);
  const accessToken = await getAccessToken();
  const headers = {
    Authorization: `Zoho-oauthtoken ${accessToken}`,
    "Content-Type": "application/json",
  };

  // Test V3 API with parental_info (per docs)
  console.log("\n3. Testing V3 API with parental_info...");
  try {
    const url = `${apiUrl}/api/v3/portal/${portalId}/projects/${projectId}/tasks`;
    console.log(`   URL: ${url}`);

    const response = await axios.post(
      url,
      {
        name: `Subtask via parental_info ${timestamp}`,
        parental_info: { parent_task_id: parentTaskId },
      },
      { headers }
    );
    console.log(`   ✓ SUCCESS! Response:`, JSON.stringify(response.data, null, 2));
  } catch (e: any) {
    console.log(`   ✗ Failed: ${e.response?.status} ${e.response?.statusText}`);
    console.log(`   Error: ${JSON.stringify(e.response?.data, null, 2)}`);
  }

  // Test CLIENT LIBRARY createSubtask method
  console.log("\n4. Testing CLIENT LIBRARY createSubtask method...");
  try {
    const subtask = await client.tasks.createSubtask(projectId, parentTaskId, {
      name: `Subtask via client library ${timestamp}`,
      priority: "high",
    });
    console.log(`   ✓ SUCCESS! Created subtask: ${subtask.name} (${subtask.id_string || subtask.id})`);
  } catch (e: any) {
    console.log(`   ✗ Failed: ${e.message}`);
    console.log(`   Error: ${JSON.stringify(e.details || e.cause?.response?.data, null, 2)}`);
  }

  // List subtasks using CLIENT LIBRARY
  console.log("\n5. Testing CLIENT LIBRARY listSubtasks method...");
  try {
    const { data: subtasks } = await client.tasks.listSubtasks(projectId, parentTaskId);
    console.log(`   ✓ SUCCESS! Found ${subtasks.length} subtasks:`);
    subtasks.forEach(st => console.log(`      - ${st.name} (${st.id_string || st.id})`));
  } catch (e: any) {
    console.log(`   ✗ Failed: ${e.message}`);
    console.log(`   Error: ${JSON.stringify(e.details || e.cause?.response?.data, null, 2)}`);
  }

  // Get the parent task to see its subtask info
  console.log("\n6. Getting parent task to check subtask info...");
  try {
    const fetchedParent = await client.tasks.get(projectId, parentTaskId);
    console.log(`   has_subtasks: ${fetchedParent.has_subtasks}`);
    console.log(`   subtasks: ${fetchedParent.subtasks}`);
    console.log(`   is_parent: ${fetchedParent.is_parent}`);
  } catch (e: any) {
    console.log(`   ✗ Failed: ${e.message}`);
  }

  // Clean up
  console.log("\n7. Cleaning up...");
  try {
    await client.tasks.delete(projectId, parentTaskId);
    console.log(`   ✓ Deleted parent task (and subtasks)`);
  } catch (e: any) {
    console.log(`   ✗ Failed to clean up: ${e.message}`);
  }

  console.log("\n=== Test Complete ===");
}

main().catch(e => {
  console.error("Error:", e.message);
  console.error(e.stack);
  process.exit(1);
});
