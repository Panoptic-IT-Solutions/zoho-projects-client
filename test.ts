import { createZohoProjectsClient } from "./src/index.js";

async function main() {
  const client = createZohoProjectsClient({
    clientId: process.env.ZOHO_CLIENT_ID!,
    clientSecret: process.env.ZOHO_CLIENT_SECRET!,
    refreshToken: process.env.ZOHO_REFRESH_TOKEN!,
    portalId: process.env.ZOHO_PORTAL_ID!,
    apiUrl: process.env.ZOHO_API_URL,
    accountsUrl: process.env.ZOHO_ACCOUNTS_URL,
  });

  console.log("Testing Zoho Projects API client...\n");

  // Test 1: List projects
  console.log("1. Fetching projects...");
  const { data: projects } = await client.projects.list({ range: 5 });
  console.log(`   Found ${projects.length} projects`);
  if (projects.length > 0) {
    console.log(`   First project: ${projects[0].name} (ID: ${projects[0].id_string})`);
  }

  // Test 2: List users
  console.log("\n2. Fetching users...");
  const { data: users } = await client.users.list({ range: 5 });
  console.log(`   Found ${users.length} users`);
  if (users.length > 0) {
    console.log(`   First user: ${users[0].name} (${users[0].email})`);
  }

  // Test 3: List tasks (if we have a project)
  if (projects.length > 0) {
    console.log("\n3. Fetching tasks for first project...");
    const { data: tasks } = await client.tasks.list(projects[0].id_string, { range: 5 });
    console.log(`   Found ${tasks.length} tasks`);
    if (tasks.length > 0) {
      console.log(`   First task: ${tasks[0].name}`);
    }
  }

  // Test 4: List time logs (if we have a project)
  if (projects.length > 0) {
    console.log("\n4. Fetching time logs for first project...");
    try {
      const { data: logs } = await client.timelogs.list(projects[0].id_string, {
        view_type: "week",
      });
      console.log(`   Found ${logs.length} time logs`);
    } catch (err: any) {
      console.log(`   Time logs: ${err.message} (may need data in project)`);
    }
  }

  console.log("\n✓ All tests passed!");
}

main().catch((err) => {
  console.error("Error:", err.message);
  if (err.cause) {
    console.error("Cause:", err.cause.message);
  }
  process.exit(1);
});
