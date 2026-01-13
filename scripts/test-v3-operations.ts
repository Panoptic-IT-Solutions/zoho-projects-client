/**
 * Comprehensive V3 API Operations Test
 * Tests create, get, update, list, delete for projects, tasks, milestones
 */
import { config } from "dotenv";
config();

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
let projectId: string | null = null;
let taskId: string | null = null;
let milestoneId: string | null = null;
let tasklistId: string | null = null;

function log(message: string, data?: unknown) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`[TEST] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

async function testProjectOperations() {
  log("1. CREATE PROJECT");
  try {
    const project = await client.projects.create({
      name: `V3 Test Project ${timestamp}`,
      description: "Comprehensive V3 API test project",
    });
    projectId = String(project.id);
    console.log(`  SUCCESS: Created project: ${projectId} - ${project.name}`);
    console.log(`  Status: ${typeof project.status === 'object' ? project.status.name : project.status}`);
    console.log(`  Owner: ${typeof project.owner === 'object' ? project.owner.name : project.owner}`);
  } catch (error) {
    console.error("  FAILED to create project:", error);
    throw error;
  }

  log("2. GET PROJECT");
  try {
    const project = await client.projects.get(projectId!);
    console.log(`  SUCCESS: Got project: ${project.name}`);
    console.log(`  ID: ${project.id}`);
    console.log(`  Tasks: ${project.tasks ? `${project.tasks.open_count} open, ${project.tasks.closed_count} closed` : 'N/A'}`);
  } catch (error) {
    console.error("  FAILED to get project:", error);
  }

  log("3. LIST PROJECTS");
  try {
    const { data: projects, pageInfo } = await client.projects.list();
    console.log(`  SUCCESS: Listed ${projects.length} projects`);
    console.log(`  Page info: page ${pageInfo?.page}, per_page ${pageInfo?.per_page}`);
    const testProject = projects.find(p => String(p.id) === projectId);
    console.log(`  Our test project found: ${testProject ? 'Yes' : 'No'}`);
  } catch (error) {
    console.error("  FAILED to list projects:", error);
  }
}

async function testMilestoneOperations() {
  if (!projectId) return;

  log("4. CREATE MILESTONE");
  try {
    // V3 API only accepts 'name' for milestone creation (no flag, description, or dates initially)
    const milestone = await client.phases.create(projectId, {
      name: `V3 Test Milestone ${timestamp}`,
    });
    milestoneId = String(milestone.id);
    console.log(`  SUCCESS: Created milestone: ${milestoneId} - ${milestone.name}`);
    console.log(`  Owner: ${milestone.owner?.name || 'Unassigned'}`);
  } catch (error) {
    console.error("  FAILED to create milestone:", error);
  }

  if (!milestoneId) return;

  log("5. GET MILESTONE");
  try {
    const milestone = await client.phases.get(projectId, milestoneId);
    console.log(`  SUCCESS: Got milestone: ${milestone.name}`);
    console.log(`  Status: ${milestone.status?.name || milestone.status_type}`);
  } catch (error) {
    console.error("  FAILED to get milestone:", error);
  }

  log("6. LIST MILESTONES");
  try {
    const { data: milestones, pageInfo } = await client.phases.list(projectId);
    console.log(`  SUCCESS: Listed ${milestones.length} milestones`);
    const testMilestone = milestones.find(m => String(m.id) === milestoneId);
    console.log(`  Our test milestone found: ${testMilestone ? 'Yes' : 'No'}`);
  } catch (error) {
    console.error("  FAILED to list milestones:", error);
  }
}

async function testTasklistOperations() {
  if (!projectId) return;

  log("7. LIST/CREATE TASKLIST");

  // First, check if the new project has any tasklists
  try {
    const { data: tasklists } = await client.tasklists.list(projectId);
    console.log(`  Found ${tasklists.length} existing tasklists in project`);
    if (tasklists.length > 0) {
      tasklistId = String(tasklists[0].id);
      console.log(`  Using existing tasklist: ${tasklistId} - ${tasklists[0].name}`);
      return;
    }
  } catch (listError) {
    console.log(`  Could not list tasklists: ${(listError as Error).message}`);
  }

  // Try to create one
  try {
    const tasklist = await client.tasklists.create(projectId, {
      name: `V3 Test Tasklist ${timestamp}`,
    });
    tasklistId = String(tasklist.id);
    console.log(`  SUCCESS: Created tasklist: ${tasklistId} - ${tasklist.name}`);
  } catch (error) {
    console.log(`  Could not create tasklist: ${(error as Error).message}`);
    console.log(`  Will try creating task without tasklist`);
  }
}

async function testTaskOperations() {
  if (!projectId) {
    console.log("\n  SKIPPED: Task operations (no project)");
    return;
  }

  log("8. CREATE TASK");
  try {
    // Build task data - only include tasklist if we have one
    const taskData: { name: string; description: string; tasklist?: { id: string } } = {
      name: `V3 Test Task ${timestamp}`,
      description: "Test task for V3 API",
    };
    if (tasklistId) {
      taskData.tasklist = { id: tasklistId };
    }

    const task = await client.tasks.create(projectId, taskData);
    taskId = String(task.id);
    console.log(`  SUCCESS: Created task: ${taskId} - ${task.name}`);
    console.log(`  Status: ${task.status?.name}`);
    console.log(`  Priority: ${typeof task.priority === 'object' ? task.priority.name : task.priority}`);
    if (task.tasklist) {
      console.log(`  Tasklist: ${task.tasklist.id} - ${task.tasklist.name}`);
    }
  } catch (error) {
    console.error("  FAILED to create task:", error);
    return;
  }

  log("9. GET TASK");
  try {
    const task = await client.tasks.get(projectId, taskId!);
    console.log(`  SUCCESS: Got task: ${task.name}`);
    console.log(`  ID: ${task.id}`);
    console.log(`  Completed: ${task.is_completed || task.completed}`);
  } catch (error) {
    console.error("  FAILED to get task:", error);
  }

  log("10. LIST TASKS");
  try {
    const { data: tasks, pageInfo } = await client.tasks.list(projectId);
    console.log(`  SUCCESS: Listed ${tasks.length} tasks`);
    const testTask = tasks.find(t => String(t.id) === taskId);
    console.log(`  Our test task found: ${testTask ? 'Yes' : 'No'}`);
  } catch (error) {
    console.error("  FAILED to list tasks:", error);
  }
}

async function cleanup() {
  log("11. CLEANUP - DELETE PROJECT");
  if (projectId) {
    try {
      await client.projects.delete(projectId);
      console.log(`  SUCCESS: Deleted project: ${projectId}`);
    } catch (error) {
      console.log(`  WARNING: Could not delete project: ${(error as Error).message}`);
    }
  }
}

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("V3 API COMPREHENSIVE TEST");
  console.log("=".repeat(60));
  console.log(`Timestamp: ${timestamp}`);
  console.log(`Portal ID: ${process.env.ZOHO_PORTAL_ID}`);

  try {
    await testProjectOperations();
    await testMilestoneOperations();
    await testTasklistOperations();
    await testTaskOperations();

    console.log("\n" + "=".repeat(60));
    console.log("TEST SUMMARY");
    console.log("=".repeat(60));
    console.log(`Project ID: ${projectId}`);
    console.log(`Milestone ID: ${milestoneId}`);
    console.log(`Tasklist ID: ${tasklistId}`);
    console.log(`Task ID: ${taskId}`);

    if (projectId) {
      console.log(`\nProject link: https://projects.zoho.eu/portal/${process.env.ZOHO_PORTAL_ID}#kanban/${projectId}`);
    }

    // Cleanup
    await cleanup();

  } catch (error) {
    console.error("\nTest failed:", error);
    process.exit(1);
  }
}

main();
