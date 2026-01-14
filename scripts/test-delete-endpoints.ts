#!/usr/bin/env npx tsx
/**
 * Test V3 delete endpoints for various entities
 */
import "dotenv/config";
import axios from "axios";

const portalId = process.env.ZOHO_PORTAL_ID!;
const clientId = process.env.ZOHO_CLIENT_ID!;
const clientSecret = process.env.ZOHO_CLIENT_SECRET!;
const refreshToken = process.env.ZOHO_REFRESH_TOKEN!;
const accountsUrl = process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.eu";
const apiUrl = process.env.ZOHO_API_URL || "https://projectsapi.zoho.eu";

async function main() {
  const tokenRes = await axios.post(`${accountsUrl}/oauth/v2/token`, null, {
    params: {
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    },
  });
  const token = tokenRes.data.access_token;
  const headers = { Authorization: `Zoho-oauthtoken ${token}` };

  // Get a project with tasks
  const projectsRes = await axios.get(`${apiUrl}/api/v3/portal/${portalId}/projects`, { headers });
  const projects = Array.isArray(projectsRes.data) ? projectsRes.data : [];
  const project = projects.find((p: any) => p.tasks?.open_count > 0) || projects[0];

  if (!project) {
    console.log("No project found");
    return;
  }

  console.log("Using project:", project.name, project.id);

  // Get a tasklist for creating tasks
  const tasklistsRes = await axios.get(
    `${apiUrl}/api/v3/portal/${portalId}/projects/${project.id}/tasklists`,
    { headers }
  );
  const tasklists = Array.isArray(tasklistsRes.data) ? tasklistsRes.data : (tasklistsRes.data.tasklists || []);
  const tasklist = tasklists[0];
  console.log("Using tasklist:", tasklist?.name, tasklist?.id);

  // Test task delete
  console.log("\n=== Testing TASK delete ===");
  try {
    const createRes = await axios.post(
      `${apiUrl}/api/v3/portal/${portalId}/projects/${project.id}/tasks`,
      { name: "TEST_DELETE_TASK", tasklist: { id: tasklist.id } },
      { headers }
    );
    const task = Array.isArray(createRes.data) ? createRes.data[0] : createRes.data;
    console.log("Created task:", task.id);

    // Try DELETE
    try {
      await axios.delete(
        `${apiUrl}/api/v3/portal/${portalId}/projects/${project.id}/tasks/${task.id}`,
        { headers }
      );
      console.log("✓ DELETE /tasks/{id} works");
    } catch (e: any) {
      console.log("✗ DELETE failed:", e.response?.status, e.response?.data?.error?.[0]?.title);

      // Try POST /trash
      try {
        await axios.post(
          `${apiUrl}/api/v3/portal/${portalId}/projects/${project.id}/tasks/${task.id}/trash`,
          {},
          { headers }
        );
        console.log("✓ POST /tasks/{id}/trash works");
      } catch (e2: any) {
        console.log("✗ POST /trash failed:", e2.response?.status, e2.response?.data?.error?.[0]?.title);
      }
    }
  } catch (e: any) {
    console.log("Failed to create task:", e.response?.data);
  }

  // Test issue/bug delete
  console.log("\n=== Testing ISSUE/BUG delete ===");
  try {
    const createRes = await axios.post(
      `${apiUrl}/api/v3/portal/${portalId}/projects/${project.id}/bugs`,
      { title: "TEST_DELETE_BUG" },
      { headers }
    );
    const bug = Array.isArray(createRes.data) ? createRes.data[0] : createRes.data;
    console.log("Created bug:", bug.id);

    // Try DELETE
    try {
      await axios.delete(
        `${apiUrl}/api/v3/portal/${portalId}/projects/${project.id}/bugs/${bug.id}`,
        { headers }
      );
      console.log("✓ DELETE /bugs/{id} works");
    } catch (e: any) {
      console.log("✗ DELETE failed:", e.response?.status, e.response?.data?.error?.[0]?.title);

      // Try POST /trash
      try {
        await axios.post(
          `${apiUrl}/api/v3/portal/${portalId}/projects/${project.id}/bugs/${bug.id}/trash`,
          {},
          { headers }
        );
        console.log("✓ POST /bugs/{id}/trash works");
      } catch (e2: any) {
        console.log("✗ POST /trash failed:", e2.response?.status, e2.response?.data?.error?.[0]?.title);
      }
    }
  } catch (e: any) {
    console.log("Failed to create bug:", e.response?.data);
  }

  // Test milestone/phase delete
  console.log("\n=== Testing MILESTONE delete ===");
  try {
    const createRes = await axios.post(
      `${apiUrl}/api/v3/portal/${portalId}/projects/${project.id}/milestones`,
      { name: "TEST_DELETE_MILESTONE", start_date: "2026-01-20", end_date: "2026-01-25" },
      { headers }
    );
    const milestone = createRes.data.milestones?.[0] || (Array.isArray(createRes.data) ? createRes.data[0] : createRes.data);
    console.log("Created milestone:", milestone.id);

    // Try DELETE
    try {
      await axios.delete(
        `${apiUrl}/api/v3/portal/${portalId}/projects/${project.id}/milestones/${milestone.id}`,
        { headers }
      );
      console.log("✓ DELETE /milestones/{id} works");
    } catch (e: any) {
      console.log("✗ DELETE failed:", e.response?.status, e.response?.data?.error?.[0]?.title);

      // Try POST /trash
      try {
        await axios.post(
          `${apiUrl}/api/v3/portal/${portalId}/projects/${project.id}/milestones/${milestone.id}/trash`,
          {},
          { headers }
        );
        console.log("✓ POST /milestones/{id}/trash works");
      } catch (e2: any) {
        console.log("✗ POST /trash failed:", e2.response?.status, e2.response?.data?.error?.[0]?.title);
      }
    }
  } catch (e: any) {
    console.log("Failed to create milestone:", e.response?.data);
  }

  // Test event delete
  console.log("\n=== Testing EVENT delete ===");
  try {
    const createRes = await axios.post(
      `${apiUrl}/api/v3/portal/${portalId}/projects/${project.id}/events`,
      {
        title: "TEST_DELETE_EVENT",
        scheduled_on: "2026-01-20T10:00:00Z",
        duration_hour: "1",
        duration_mins: "0"
      },
      { headers }
    );
    const event = createRes.data.events?.[0] || (Array.isArray(createRes.data) ? createRes.data[0] : createRes.data);
    console.log("Created event:", event.id);

    // Try DELETE
    try {
      await axios.delete(
        `${apiUrl}/api/v3/portal/${portalId}/projects/${project.id}/events/${event.id}`,
        { headers }
      );
      console.log("✓ DELETE /events/{id} works");
    } catch (e: any) {
      console.log("✗ DELETE failed:", e.response?.status, e.response?.data?.error?.[0]?.title);

      // Try POST /trash
      try {
        await axios.post(
          `${apiUrl}/api/v3/portal/${portalId}/projects/${project.id}/events/${event.id}/trash`,
          {},
          { headers }
        );
        console.log("✓ POST /events/{id}/trash works");
      } catch (e2: any) {
        console.log("✗ POST /trash failed:", e2.response?.status, e2.response?.data?.error?.[0]?.title);
      }
    }
  } catch (e: any) {
    console.log("Failed to create event:", e.response?.data);
  }

  // Test forum delete
  console.log("\n=== Testing FORUM delete ===");
  try {
    const createRes = await axios.post(
      `${apiUrl}/api/v3/portal/${portalId}/projects/${project.id}/forums`,
      { name: "TEST_DELETE_FORUM", content: "Test content" },
      { headers }
    );
    const forum = createRes.data.forums?.[0] || (Array.isArray(createRes.data) ? createRes.data[0] : createRes.data);
    console.log("Created forum:", forum.id);

    // Try DELETE
    try {
      await axios.delete(
        `${apiUrl}/api/v3/portal/${portalId}/projects/${project.id}/forums/${forum.id}`,
        { headers }
      );
      console.log("✓ DELETE /forums/{id} works");
    } catch (e: any) {
      console.log("✗ DELETE failed:", e.response?.status, e.response?.data?.error?.[0]?.title);

      // Try POST /trash
      try {
        await axios.post(
          `${apiUrl}/api/v3/portal/${portalId}/projects/${project.id}/forums/${forum.id}/trash`,
          {},
          { headers }
        );
        console.log("✓ POST /forums/{id}/trash works");
      } catch (e2: any) {
        console.log("✗ POST /trash failed:", e2.response?.status, e2.response?.data?.error?.[0]?.title);
      }
    }
  } catch (e: any) {
    console.log("Failed to create forum:", e.response?.data);
  }

  // Test tasklist delete
  console.log("\n=== Testing TASKLIST delete ===");
  try {
    const createRes = await axios.post(
      `${apiUrl}/api/v3/portal/${portalId}/projects/${project.id}/tasklists`,
      { name: "TEST_DELETE_TASKLIST" },
      { headers }
    );
    const tasklist = createRes.data.tasklists?.[0] || (Array.isArray(createRes.data) ? createRes.data[0] : createRes.data);
    console.log("Created tasklist:", tasklist.id);

    // Try DELETE
    try {
      await axios.delete(
        `${apiUrl}/api/v3/portal/${portalId}/projects/${project.id}/tasklists/${tasklist.id}`,
        { headers }
      );
      console.log("✓ DELETE /tasklists/{id} works");
    } catch (e: any) {
      console.log("✗ DELETE failed:", e.response?.status, e.response?.data?.error?.[0]?.title);

      // Try POST /trash
      try {
        await axios.post(
          `${apiUrl}/api/v3/portal/${portalId}/projects/${project.id}/tasklists/${tasklist.id}/trash`,
          {},
          { headers }
        );
        console.log("✓ POST /tasklists/{id}/trash works");
      } catch (e2: any) {
        console.log("✗ POST /trash failed:", e2.response?.status, e2.response?.data?.error?.[0]?.title);
      }
    }
  } catch (e: any) {
    console.log("Failed to create tasklist:", e.response?.data);
  }
}

main().catch(e => console.error("Error:", e.message));
