#!/usr/bin/env npx tsx
/**
 * Test Script: V3 Attachment API
 *
 * Note: V3 attachment uploads require WorkDrive integration.
 * The workflow is:
 * 1. Upload file to WorkDrive using workdrive.upload()
 * 2. Associate the WorkDrive file with an entity using attachments.associate()
 *
 * This script tests the listing functionality which doesn't require WorkDrive setup.
 */
import "dotenv/config";
import { createZohoProjectsClient } from "../src/client.js";

const client = createZohoProjectsClient({
  clientId: process.env.ZOHO_CLIENT_ID!,
  clientSecret: process.env.ZOHO_CLIENT_SECRET!,
  refreshToken: process.env.ZOHO_REFRESH_TOKEN!,
  portalId: process.env.ZOHO_PORTAL_ID!,
  apiUrl: process.env.ZOHO_API_URL,
  accountsUrl: process.env.ZOHO_ACCOUNTS_URL,
});

const timestamp = Date.now();

async function main() {
  console.log("============================================================");
  console.log("TEST: V3 Attachment API");
  console.log("============================================================\n");

  // 1. Create Project
  console.log("1. CREATING PROJECT...");
  const project = await client.projects.create({
    name: `Attachment Test ${timestamp}`,
  });
  console.log(`   Created project: ${project.id} - ${project.name}\n`);
  const projectId = String(project.id);

  // 2. Create Tasklist
  console.log("2. CREATING TASKLIST...");
  const tasklist = await client.tasklists.create(projectId, {
    name: `Task List ${timestamp}`,
  });
  console.log(`   Created tasklist: ${tasklist.id}\n`);

  // 3. Create Task
  console.log("3. CREATING TASK...");
  const task = await client.tasks.create(projectId, {
    name: "Task for Attachment Testing",
    tasklist: { id: String(tasklist.id) },
  });
  console.log(`   Created task: ${task.id} - ${task.name}\n`);
  const taskId = String(task.id);

  // 4. List attachments for the task (V3 API)
  console.log("4. LISTING TASK ATTACHMENTS (V3 API)...");
  try {
    const attachments = await client.attachments.listForTask(projectId, taskId);
    console.log(`   Found ${attachments.data.length} attachments for task`);
    if (attachments.data.length > 0) {
      console.log(`   First attachment: ${attachments.data[0].name}`);
    }
    console.log("   V3 attachment listing works correctly!\n");
  } catch (error) {
    console.error("   Failed to list attachments:", error);
  }

  // 5. Test listForEntity with explicit params
  console.log("5. TESTING listForEntity WITH EXPLICIT PARAMS...");
  try {
    const attachments = await client.attachments.listForEntity(projectId, {
      entity_type: "task",
      entity_id: taskId,
    });
    console.log(`   Found ${attachments.data.length} attachments`);
    console.log(`   Page info: page=${attachments.pageInfo?.page || 1}`);
    console.log("   listForEntity works correctly!\n");
  } catch (error) {
    console.error("   Failed:", error);
  }

  // 6. Fetch task to verify it exists
  console.log("6. FETCHING TASK TO VERIFY...");
  try {
    const fetchedTask = await client.tasks.get(projectId, taskId);
    console.log(`   Task: ${fetchedTask.name}`);
    console.log(`   Status: ${fetchedTask.status?.name || "N/A"}`);
  } catch (error) {
    console.error("   Failed to fetch task:", error);
  }

  console.log("\n============================================================");
  console.log("NOTE ON V3 ATTACHMENT UPLOADS");
  console.log("============================================================");
  console.log("V3 attachment uploads require WorkDrive integration:");
  console.log("1. Get a WorkDrive folder ID for your project");
  console.log("2. Upload file: client.workdrive.upload(buffer, filename, { parent_id: folderId })");
  console.log("3. Associate: client.attachments.associate(projectId, attachmentId, { entity_type: 'task', entity_id: taskId })");
  console.log("\nRequired OAuth scopes for WorkDrive:");
  console.log("- WorkDrive.team.READ");
  console.log("- WorkDrive.workspace.READ");
  console.log("- WorkDrive.files.ALL");
  console.log("- WorkDrive.teamfolders.READ");

  console.log("\n============================================================");
  console.log("TEST COMPLETE");
  console.log("============================================================");
  console.log(`Project: https://projects.zoho.eu/portal/${process.env.ZOHO_PORTAL_ID}#kanban/${projectId}`);
}

main().catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});
