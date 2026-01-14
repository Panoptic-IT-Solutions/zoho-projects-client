#!/usr/bin/env npx tsx
/**
 * Integration test for tags - create, update, delete
 */
import "dotenv/config";
import { createZohoProjectsClient } from "../src/index.js";

const portalId = process.env.ZOHO_PORTAL_ID!;
const clientId = process.env.ZOHO_CLIENT_ID!;
const clientSecret = process.env.ZOHO_CLIENT_SECRET!;
const refreshToken = process.env.ZOHO_REFRESH_TOKEN!;
const accountsUrl = process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.eu";
const apiUrl = process.env.ZOHO_API_URL || "https://projectsapi.zoho.eu";

async function main() {
  console.log("=== Tag Operations Integration Test ===\n");

  const client = createZohoProjectsClient({
    clientId,
    clientSecret,
    refreshToken,
    portalId,
    accountsUrl,
    apiUrl,
  });

  const timestamp = Date.now();
  const testTagName = `test-tag-${timestamp}`;
  const updatedTagName = `updated-tag-${timestamp}`;

  // 1. Create a tag
  console.log("1. Creating tag...");
  console.log(`   Name: ${testTagName}`);

  let createdTag;
  let tagId: string;
  try {
    createdTag = await client.tags.create({ name: testTagName });
    tagId = tagId || String(createdTag.id);
    console.log(`   ✓ Created tag: ${createdTag.name} (ID: ${tagId})`);
  } catch (e: any) {
    console.log(`   ✗ Failed to create tag: ${e.message}`);
    console.log(`   Response: ${JSON.stringify(e.response?.data || e.cause?.response?.data, null, 2)}`);
    return;
  }

  // 2. Get the tag (V3 API may not support single tag fetch)
  console.log("\n2. Fetching tag...");
  try {
    const fetchedTag = await client.tags.get(tagId);
    console.log(`   ✓ Fetched tag: ${fetchedTag.name}`);
  } catch (e: any) {
    console.log(`   ⚠ Single tag fetch not supported in V3 API (expected)`);
  }

  // 3. Update the tag
  console.log("\n3. Updating tag...");
  console.log(`   New name: ${updatedTagName}`);
  try {
    const updatedTag = await client.tags.update(tagId, { name: updatedTagName, color_class: "bg-tag2" });
    console.log(`   ✓ Updated tag: ${updatedTag.name}`);
  } catch (e: any) {
    console.log(`   ✗ Failed to update tag: ${e.message}`);
    console.log(`   Response: ${JSON.stringify(e.response?.data || e.cause?.response?.data, null, 2)}`);
  }

  // 4. List all tags to verify
  console.log("\n4. Listing tags...");
  try {
    const { data: tags } = await client.tags.list({ per_page: 100 });
    // Look for tag by ID (id_string may be missing in V3)
    const ourTag = tags.find(t => String(t.id) === tagId || t.id_string === tagId);
    if (ourTag) {
      console.log(`   ✓ Found our tag in list: ${ourTag.name}`);
    } else {
      console.log(`   ✗ Tag not found in list`);
      console.log(`   Available tags: ${tags.map(t => `${t.name} (${t.id})`).join(", ")}`);
    }
    console.log(`   Total tags: ${tags.length}`);
  } catch (e: any) {
    console.log(`   ✗ Failed to list tags: ${e.message}`);
  }

  // 5. Test adding tag to a task (using tag_ids)
  console.log("\n5. Testing tag association with task...");

  // Get first project with tasks
  const { data: projects } = await client.projects.list({ per_page: 10 });
  const project = projects.find(p => (p as any).tasks?.open_count > 0) || projects[0];

  if (project) {
    console.log(`   Using project: ${project.name}`);

    // Get a tasklist
    const { data: tasklists } = await client.tasklists.list(project.id_string);
    const tasklist = tasklists[0];

    if (tasklist) {
      // Create a test task with the tag
      try {
        const task = await client.tasks.create(project.id_string, {
          name: `Tag Test Task ${timestamp}`,
          tasklist: { id: tasklist.id_string },
          tag_ids: [tagId],
        });
        console.log(`   ✓ Created task with tag: ${task.name} (ID: ${task.id_string})`);

        // Verify tag is on the task
        const fetchedTask = await client.tasks.get(project.id_string, task.id_string);
        const taskTags = (fetchedTask as any).tags || [];
        const hasTag = taskTags.some((t: any) => t.id_string === tagId || t.name === updatedTagName);
        if (hasTag) {
          console.log(`   ✓ Tag verified on task`);
        } else {
          console.log(`   ? Tag not found on task (tags: ${JSON.stringify(taskTags)})`);
        }

        // Clean up - delete the test task
        await client.tasks.delete(project.id_string, task.id_string);
        console.log(`   ✓ Cleaned up test task`);
      } catch (e: any) {
        console.log(`   ✗ Task tag test failed: ${e.message}`);
        const errorData = e.response?.data || e.cause?.response?.data || e.details || e;
        console.log(`   Response: ${JSON.stringify(errorData, null, 2)}`);
      }
    }
  }

  // 6. Delete the tag
  console.log("\n6. Deleting tag...");
  try {
    await client.tags.delete(tagId);
    console.log(`   ✓ Deleted tag`);
  } catch (e: any) {
    console.log(`   ✗ Failed to delete tag: ${e.message}`);
    console.log(`   Response: ${JSON.stringify(e.response?.data || e.cause?.response?.data, null, 2)}`);
  }

  // 7. Verify deletion
  console.log("\n7. Verifying deletion...");
  try {
    await client.tags.get(tagId);
    console.log(`   ✗ Tag still exists (should have been deleted)`);
  } catch (e: any) {
    if (e.message.includes("not found") || e.statusCode === 404) {
      console.log(`   ✓ Tag successfully deleted (404 as expected)`);
    } else {
      console.log(`   ? Unexpected error: ${e.message}`);
    }
  }

  console.log("\n=== Test Complete ===");
}

main().catch(e => {
  console.error("Error:", e.message);
  process.exit(1);
});
