#!/usr/bin/env npx tsx
/**
 * Test Script: Create project, create 5 tasks, update one, delete one
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
  console.log("TEST: Create Project, 5 Tasks, Update 1, Delete 1");
  console.log("============================================================\n");

  // 1. Create Project
  console.log("1. CREATING PROJECT...");
  let project;
  try {
    project = await client.projects.create({
      name: `Test Project ${timestamp}`,
      description: "Test project for V3 API validation",
    });
    console.log(`   ✅ Created project: ${project.id} - ${project.name}`);
    console.log(`   Link: https://projects.zoho.eu/portal/${process.env.ZOHO_PORTAL_ID}#kanban/${project.id}\n`);
  } catch (error) {
    console.error("   ❌ Failed to create project:", error);
    process.exit(1);
  }

  const projectId = String(project.id);

  // 2. Create Tasklist (required for tasks in V3)
  console.log("2. CREATING TASKLIST...");
  let tasklist;
  try {
    tasklist = await client.tasklists.create(projectId, {
      name: `Task List ${timestamp}`,
    });
    console.log(`   ✅ Created tasklist: ${tasklist.id} - ${tasklist.name}\n`);
  } catch (error) {
    console.error("   ❌ Failed to create tasklist:", error);
    // Try to list existing tasklists
    try {
      const { data: tasklists } = await client.tasklists.list(projectId);
      if (tasklists.length > 0) {
        tasklist = tasklists[0];
        console.log(`   ⚠️ Using existing tasklist: ${tasklist.id} - ${tasklist.name}\n`);
      } else {
        console.error("   No tasklists available, cannot create tasks");
        process.exit(1);
      }
    } catch (listError) {
      console.error("   Failed to list tasklists:", listError);
      process.exit(1);
    }
  }

  const tasklistId = String(tasklist.id);

  // 3. Create 5 Tasks
  console.log("3. CREATING 5 TASKS...");
  const taskIds: string[] = [];
  const taskNames = [
    "Task 1: Setup environment",
    "Task 2: Design architecture",
    "Task 3: Implement core features",
    "Task 4: Write tests",
    "Task 5: Deploy to production",
  ];

  for (const taskName of taskNames) {
    try {
      const task = await client.tasks.create(projectId, {
        name: taskName,
        tasklist: { id: tasklistId },
      });
      taskIds.push(String(task.id));
      console.log(`   ✅ Created: ${task.id} - ${task.name}`);
    } catch (error) {
      console.error(`   ❌ Failed to create "${taskName}":`, error);
    }
  }
  console.log(`   Total tasks created: ${taskIds.length}\n`);

  if (taskIds.length < 2) {
    console.error("Not enough tasks created to continue test");
    process.exit(1);
  }

  // 4. Update Task 3 (mark as high priority with description)
  // Note: V3 API expects lowercase priority values ("high", "medium", "low", "none")
  console.log("4. UPDATING TASK 3...");
  const taskToUpdate = taskIds[2]; // Task 3
  try {
    const updatedTask = await client.tasks.update(projectId, taskToUpdate, {
      name: "Task 3: Implement core features [UPDATED]",
      description: "This task has been updated via V3 API",
      priority: "high",
    });
    console.log(`   ✅ Updated task: ${updatedTask.id}`);
    console.log(`   New name: ${updatedTask.name}`);
    console.log(`   Priority: ${typeof updatedTask.priority === 'object' ? updatedTask.priority?.name : updatedTask.priority}\n`);
  } catch (error) {
    console.error("   ❌ Failed to update task:", error);
  }

  // 5. Delete Task 5
  console.log("5. DELETING TASK 5...");
  const taskToDelete = taskIds[4]; // Task 5
  try {
    await client.tasks.delete(projectId, taskToDelete);
    console.log(`   ✅ Deleted task: ${taskToDelete}\n`);
  } catch (error) {
    console.error("   ❌ Failed to delete task:", error);
  }

  // 6. List remaining tasks to verify
  console.log("6. LISTING REMAINING TASKS...");
  try {
    const { data: remainingTasks } = await client.tasks.list(projectId);
    console.log(`   Found ${remainingTasks.length} tasks:`);
    for (const task of remainingTasks) {
      const priority = typeof task.priority === 'object' ? task.priority?.name : task.priority;
      console.log(`   - ${task.id}: ${task.name} (Priority: ${priority || 'None'})`);
    }
  } catch (error) {
    console.error("   ❌ Failed to list tasks:", error);
  }

  console.log("\n============================================================");
  console.log("TEST COMPLETE");
  console.log("============================================================");
  console.log(`Project ID: ${projectId}`);
  console.log(`Project Link: https://projects.zoho.eu/portal/${process.env.ZOHO_PORTAL_ID}#kanban/${projectId}`);
  console.log("\nSummary:");
  console.log("- Created 1 project");
  console.log("- Created 1 tasklist");
  console.log("- Created 5 tasks");
  console.log("- Updated 1 task (Task 3)");
  console.log("- Deleted 1 task (Task 5)");
  console.log("- Remaining tasks: 4");
}

main().catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});
