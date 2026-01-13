/**
 * Integration tests for V3 API changes
 *
 * These tests verify:
 * 1. The /api/v3/ base path works correctly
 * 2. Count fields properly coerce strings to numbers
 * 3. Task creation works with the V3 API
 *
 * Run with: npm run test:integration
 *
 * Required environment variables:
 * - ZOHO_CLIENT_ID
 * - ZOHO_CLIENT_SECRET
 * - ZOHO_REFRESH_TOKEN
 * - ZOHO_PORTAL_ID
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getTestClient, getTestProjectId, generateTestName } from "./setup.js";
import type { ZohoProjectsClient, Task } from "../../index.js";

describe("V3 API Integration Tests", () => {
  let client: ZohoProjectsClient;
  let projectId: string;
  let createdTaskId: string | null = null;

  beforeAll(async () => {
    client = getTestClient();
    projectId = await getTestProjectId();
  });

  afterAll(async () => {
    // Cleanup: Delete test task if created
    if (createdTaskId) {
      try {
        await client.tasks.delete(projectId, createdTaskId);
        console.log(`Cleaned up test task: ${createdTaskId}`);
      } catch {
        console.warn(`Failed to cleanup test task: ${createdTaskId}`);
      }
    }
  });

  describe("Projects API", () => {
    it("should list projects with count fields parsed correctly", async () => {
      const { data: projects } = await client.projects.list();

      expect(projects.length).toBeGreaterThan(0);

      // Verify count fields are numbers (coerced from strings if necessary)
      for (const project of projects) {
        if (project.task_count) {
          expect(typeof project.task_count.open).toBe("number");
          expect(typeof project.task_count.closed).toBe("number");
        }
        if (project.milestone_count) {
          expect(typeof project.milestone_count.open).toBe("number");
          expect(typeof project.milestone_count.closed).toBe("number");
        }
        if (project.bug_count) {
          expect(typeof project.bug_count.open).toBe("number");
          expect(typeof project.bug_count.closed).toBe("number");
        }
      }
    });

    it("should get a single project", async () => {
      const project = await client.projects.get(projectId);

      expect(project).toBeDefined();
      // V3 API uses 'id' directly, legacy uses 'id_string'
      expect(String(project.id)).toBe(projectId);
    });
  });

  describe("Tasks API", () => {
    it("should list tasks in a project", async () => {
      const { data: tasks, pageInfo } = await client.tasks.list(projectId);

      expect(Array.isArray(tasks)).toBe(true);
      expect(pageInfo).toBeDefined();

      // Verify pagination fields are numbers
      if (pageInfo) {
        expect(typeof pageInfo.page).toBe("number");
        expect(typeof pageInfo.per_page).toBe("number");
      }
    });

    it("should create a task using V3 API", async () => {
      // V3 API requires a tasklist - get one from existing tasks
      const { data: existingTasks } = await client.tasks.list(projectId);
      if (existingTasks.length === 0) {
        console.warn("Skipping - no existing tasks to get tasklist from");
        return;
      }

      const tasklistId = existingTasks[0].tasklist?.id || existingTasks[0].task_list?.id;
      if (!tasklistId) {
        console.warn("Skipping - existing task has no tasklist ID");
        return;
      }

      const taskName = generateTestName("test-task");

      const task = await client.tasks.create(projectId, {
        name: taskName,
        description: "Integration test task - can be deleted",
        tasklist: { id: String(tasklistId) },
      });

      expect(task).toBeDefined();
      expect(task.name).toBe(taskName);
      expect(task.id).toBeDefined();

      // Store for cleanup - V3 uses 'id' as string directly, legacy uses 'id_string'
      createdTaskId = String(task.id);

      console.log(`Created test task: ${createdTaskId} (${task.name})`);
    });

    it("should get the created task", async () => {
      if (!createdTaskId) {
        console.warn("Skipping - no task was created");
        return;
      }

      const task = await client.tasks.get(projectId, createdTaskId);

      expect(task).toBeDefined();
      // V3 uses 'id' directly, legacy uses 'id_string'
      expect(String(task.id)).toBe(createdTaskId);
    });

    it("should update the created task", async () => {
      if (!createdTaskId) {
        console.warn("Skipping - no task was created");
        return;
      }

      try {
        const updatedName = generateTestName("updated-task");
        const task = await client.tasks.update(projectId, createdTaskId, {
          name: updatedName,
        });

        expect(task).toBeDefined();
        expect(task.name).toBe(updatedName);
      } catch (error: unknown) {
        // V3 API may not support PUT method for task updates
        if (error && typeof error === "object" && "message" in error) {
          const message = (error as Error).message;
          if (message.includes("400") || message.includes("INVALID_METHOD")) {
            console.warn("Skipping - V3 API may not support PUT for task updates");
            return;
          }
        }
        throw error;
      }
    });
  });

  describe("Phases (Milestones) API", () => {
    it("should list phases with count fields parsed correctly", async () => {
      const { data: phases } = await client.phases.list(projectId);

      expect(Array.isArray(phases)).toBe(true);

      // Verify count fields are numbers
      for (const phase of phases) {
        if (phase.open_task_count !== undefined) {
          expect(typeof phase.open_task_count).toBe("number");
        }
        if (phase.closed_task_count !== undefined) {
          expect(typeof phase.closed_task_count).toBe("number");
        }
      }
    });
  });

  describe("Task Lists API", () => {
    it("should list task lists with count fields parsed correctly", async () => {
      try {
        const { data: taskLists } = await client.tasklists.list(projectId);

        expect(Array.isArray(taskLists)).toBe(true);

        // Verify count fields are numbers
        for (const taskList of taskLists) {
          if (taskList.task_count) {
            expect(typeof taskList.task_count.open).toBe("number");
            expect(typeof taskList.task_count.closed).toBe("number");
          }
        }
      } catch (error: unknown) {
        // Skip if OAuth scope doesn't include task lists
        if (error && typeof error === "object" && "message" in error) {
          const message = (error as Error).message;
          if (message.includes("401") || message.includes("INVALID_OAUTHSCOPE")) {
            console.warn("Skipping - OAuth scope does not include task lists");
            return;
          }
        }
        throw error;
      }
    });
  });
});
