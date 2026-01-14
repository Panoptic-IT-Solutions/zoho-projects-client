#!/usr/bin/env npx tsx
/**
 * Test task description formatting - newlines vs HTML
 */
import "dotenv/config";
import axios from "axios";

const portalId = process.env.ZOHO_PORTAL_ID!;
const clientId = process.env.ZOHO_CLIENT_ID!;
const clientSecret = process.env.ZOHO_CLIENT_SECRET!;
const refreshToken = process.env.ZOHO_REFRESH_TOKEN!;
const accountsUrl = process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.eu";
const apiUrl = process.env.ZOHO_API_URL || "https://projectsapi.zoho.eu";

const CLEANUP = process.argv.includes("--cleanup");

async function main() {
  console.log("=== Task Description Formatting Test ===\n");

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

  // Create test project
  const timestamp = Date.now();
  const projectName = `Description Format Test ${timestamp}`;
  console.log(`Creating project: ${projectName}`);

  const projectRes = await axios.post(
    `${apiUrl}/api/v3/portal/${portalId}/projects`,
    { name: projectName },
    { headers }
  );
  const project = Array.isArray(projectRes.data) ? projectRes.data[0] : projectRes.data;
  console.log(`Created project ID: ${project.id}\n`);

  // Get tasklist (may need to create one for new projects)
  let tasklistsRes = await axios.get(
    `${apiUrl}/api/v3/portal/${portalId}/projects/${project.id}/tasklists`,
    { headers }
  );
  let tasklists = Array.isArray(tasklistsRes.data) ? tasklistsRes.data : (tasklistsRes.data.tasklists || []);

  let tasklist = tasklists[0];
  if (!tasklist) {
    // Create a tasklist if none exists
    const createTlRes = await axios.post(
      `${apiUrl}/api/v3/portal/${portalId}/projects/${project.id}/tasklists`,
      { name: "General" },
      { headers }
    );
    tasklist = Array.isArray(createTlRes.data) ? createTlRes.data[0] : (createTlRes.data.tasklists?.[0] || createTlRes.data);
  }
  console.log(`Using tasklist: ${tasklist.name} (${tasklist.id})\n`);

  // Test descriptions
  const newlineDescription = `Line 1 of the description
Line 2 after newline
Line 3 after another newline

New paragraph after double newline

- Bullet point 1
- Bullet point 2
- Bullet point 3`;

  const htmlDescription = `<p>Paragraph 1 with <strong>bold</strong> and <em>italic</em> text.</p>
<p>Paragraph 2 with a <a href="https://example.com">link</a>.</p>
<ul>
<li>List item 1</li>
<li>List item 2</li>
<li>List item 3</li>
</ul>
<h3>A heading</h3>
<p>Final paragraph.</p>`;

  // Create Task 1 - Newlines
  console.log("=== TASK 1: Newline Test ===");
  console.log("SENT:");
  console.log("---");
  console.log(newlineDescription);
  console.log("---\n");

  const task1Res = await axios.post(
    `${apiUrl}/api/v3/portal/${portalId}/projects/${project.id}/tasks`,
    {
      name: "Newline Description Test",
      description: newlineDescription,
      tasklist: { id: tasklist.id }
    },
    { headers }
  );
  const task1 = Array.isArray(task1Res.data) ? task1Res.data[0] : task1Res.data;
  console.log(`Created task ID: ${task1.id}`);

  // Fetch task1 back
  const task1Fetch = await axios.get(
    `${apiUrl}/api/v3/portal/${portalId}/projects/${project.id}/tasks/${task1.id}`,
    { headers }
  );
  const task1Data = Array.isArray(task1Fetch.data) ? task1Fetch.data[0] : task1Fetch.data;
  console.log("RECEIVED:");
  console.log("---");
  console.log(task1Data.description || "(empty)");
  console.log("---");
  console.log(`Match: ${task1Data.description === newlineDescription ? "✓ YES" : "✗ NO"}`);
  console.log();

  // Create Task 2 - HTML
  console.log("=== TASK 2: HTML Test ===");
  console.log("SENT:");
  console.log("---");
  console.log(htmlDescription);
  console.log("---\n");

  const task2Res = await axios.post(
    `${apiUrl}/api/v3/portal/${portalId}/projects/${project.id}/tasks`,
    {
      name: "HTML Description Test",
      description: htmlDescription,
      tasklist: { id: tasklist.id }
    },
    { headers }
  );
  const task2 = Array.isArray(task2Res.data) ? task2Res.data[0] : task2Res.data;
  console.log(`Created task ID: ${task2.id}`);

  // Fetch task2 back
  const task2Fetch = await axios.get(
    `${apiUrl}/api/v3/portal/${portalId}/projects/${project.id}/tasks/${task2.id}`,
    { headers }
  );
  const task2Data = Array.isArray(task2Fetch.data) ? task2Fetch.data[0] : task2Fetch.data;
  console.log("RECEIVED:");
  console.log("---");
  console.log(task2Data.description || "(empty)");
  console.log("---");
  console.log(`Match: ${task2Data.description === htmlDescription ? "✓ YES" : "✗ NO"}`);
  console.log();

  // Summary
  console.log("=== SUMMARY ===");
  console.log(`Newlines preserved: ${task1Data.description === newlineDescription ? "YES" : "NO"}`);
  console.log(`HTML preserved: ${task2Data.description === htmlDescription ? "YES" : "NO"}`);
  console.log();
  console.log(`Project URL: Check Zoho Projects UI to see how descriptions render`);
  console.log(`Project: ${projectName}`);

  // Cleanup
  if (CLEANUP) {
    console.log("\n=== CLEANUP ===");
    try {
      await axios.post(
        `${apiUrl}/api/v3/portal/${portalId}/projects/${project.id}/trash`,
        {},
        { headers }
      );
      console.log("Project moved to trash");
    } catch (e: any) {
      console.log("Cleanup failed:", e.response?.data);
    }
  } else {
    console.log("\nRun with --cleanup to delete the test project");
  }
}

main().catch(e => {
  console.error("Error:", e.response?.data || e.message);
  process.exit(1);
});
