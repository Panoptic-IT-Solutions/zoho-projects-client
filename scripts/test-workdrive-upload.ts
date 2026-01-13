#!/usr/bin/env npx tsx
/**
 * Test Script: WorkDrive file upload and attachment to task
 *
 * This script demonstrates the full V3 attachment workflow:
 * 1. Create a project
 * 2. Get WorkDrive user/privatespace info or find project folder
 * 3. Upload a file to WorkDrive
 * 4. Associate the file with a task
 */
import "dotenv/config";
import axios from "axios";
import FormData from "form-data";

const portalId = process.env.ZOHO_PORTAL_ID!;
const clientId = process.env.ZOHO_CLIENT_ID!;
const clientSecret = process.env.ZOHO_CLIENT_SECRET!;
const refreshToken = process.env.ZOHO_REFRESH_TOKEN!;
const accountsUrl = process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.eu";
const projectsApiUrl = process.env.ZOHO_API_URL || "https://projectsapi.zoho.eu";

// WorkDrive API URL - use zohoapis domain for EU region
const workdriveApiUrl = "https://workdrive.zoho.eu/api/v1";

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
  console.log("TEST: WorkDrive File Upload & Task Attachment");
  console.log("============================================================\n");

  const token = await getAccessToken();
  console.log("Got access token\n");

  const projectsBasePath = `${projectsApiUrl}/api/v3/portal/${portalId}`;
  const authHeader = { Authorization: `Zoho-oauthtoken ${token}` };
  const workdriveHeaders = {
    Authorization: `Zoho-oauthtoken ${token}`,
    Accept: "application/vnd.api+json",
  };

  // 1. Get current user info from WorkDrive
  console.log("1. GETTING WORKDRIVE USER INFO...");
  try {
    const userRes = await axios.get(`${workdriveApiUrl}/users/me`, { headers: workdriveHeaders });
    const userId = userRes.data?.data?.id;
    const preferredTeamId = userRes.data?.data?.attributes?.preferred_team_id;
    console.log(`   User ID: ${userId}`);
    console.log(`   Preferred Team ID: ${preferredTeamId}`);

    if (userId && preferredTeamId) {
      // Get team folders using the team ID
      console.log("\n2. GETTING TEAM FOLDERS...");
      const tfRes = await axios.get(`${workdriveApiUrl}/teams/${preferredTeamId}/teamfolders`, { headers: workdriveHeaders });
      console.log("   Team Folders:", JSON.stringify(tfRes.data, null, 2));

      const teamFolders = tfRes.data?.data || [];
      let parentFolderId: string | null = null;

      // Find a suitable folder - look for Projects related folder first
      for (const folder of teamFolders) {
        const name = folder.attributes?.name || "";
        console.log(`   Found folder: ${name} (${folder.id})`);
        if (name.toLowerCase().includes("project")) {
          parentFolderId = folder.id;
          console.log(`   -> Using this Projects folder`);
          break;
        }
      }

      // If no projects folder, use the first team folder
      if (!parentFolderId && teamFolders.length > 0) {
        parentFolderId = teamFolders[0].id;
        console.log(`   Using first team folder: ${teamFolders[0].attributes?.name} (${parentFolderId})`);
      }

      if (parentFolderId) {

        // 4. Create project, tasklist, and task
        console.log("\n4. CREATING PROJECT, TASKLIST, AND TASK...");
        const projectRes = await axios.post(
          `${projectsBasePath}/projects`,
          { name: `Upload Test ${Date.now()}` },
          { headers: authHeader }
        );
        const project = projectRes.data.projects?.[0] || projectRes.data;
        const projectId = String(project.id);
        console.log(`   Created project: ${projectId} - ${project.name}`);

        const tasklistRes = await axios.post(
          `${projectsBasePath}/projects/${projectId}/tasklists`,
          { name: "Test Tasklist" },
          { headers: authHeader }
        );
        const tasklist = tasklistRes.data.tasklists?.[0] || tasklistRes.data;
        console.log(`   Created tasklist: ${tasklist.id}`);

        const taskRes = await axios.post(
          `${projectsBasePath}/projects/${projectId}/tasks`,
          { name: "Task with Attachment", tasklist: { id: String(tasklist.id) } },
          { headers: authHeader }
        );
        const task = taskRes.data.tasks?.[0] || taskRes.data;
        const taskId = String(task.id);
        console.log(`   Created task: ${taskId}`);

        // 5. Find the project-specific folder in WorkDrive (created automatically by Zoho Projects)
        console.log("\n5. FINDING PROJECT FOLDER IN WORKDRIVE...");
        let projectFolderId: string | null = null;

        // List folders inside the Zoho Projects team folder
        const foldersRes = await axios.get(
          `${workdriveApiUrl}/teamfolders/${parentFolderId}/folders`,
          { headers: workdriveHeaders }
        );
        console.log(`   Found ${foldersRes.data?.data?.length || 0} subfolders`);

        // Look for the project folder (format: PA-{num}-{projectName}-Attachments)
        for (const folder of foldersRes.data?.data || []) {
          const name = folder.attributes?.name || "";
          console.log(`   - ${name} (${folder.id})`);
          // Match by project name in folder name
          if (name.includes(project.name) && name.includes("-Attachments")) {
            projectFolderId = folder.id;
            console.log(`   -> Found project folder!`);
            break;
          }
        }

        // If not found, use the parent folder (Zoho Projects)
        if (!projectFolderId) {
          console.log("   Project folder not found, using parent folder");
          projectFolderId = parentFolderId;
        }

        // 6. Upload file to the project folder
        console.log("\n6. UPLOADING FILE TO WORKDRIVE...");
        const testContent = `Test file created at ${new Date().toISOString()}\n\nThis is a test attachment uploaded via WorkDrive API.`;
        const testBuffer = Buffer.from(testContent, "utf-8");

        const formData = new FormData();
        formData.append("content", testBuffer, {
          filename: `test-${Date.now()}.txt`,
          contentType: "text/plain",
        });
        formData.append("parent_id", projectFolderId);

        const uploadRes = await axios.post(
          `${workdriveApiUrl}/upload`,
          formData,
          {
            headers: {
              ...workdriveHeaders,
              ...formData.getHeaders(),
            },
          }
        );
        console.log("   Upload response:", JSON.stringify(uploadRes.data, null, 2));

        const uploadedFile = uploadRes.data?.data?.[0];
        if (uploadedFile) {
          // The file ID is in attributes.resource_id
          const fileId = uploadedFile.attributes?.resource_id || uploadedFile.id;
          console.log(`   Uploaded file ID: ${fileId}`);

          // 7. Register file with Zoho Projects (creates Projects attachment from WorkDrive file)
          console.log("\n7. REGISTERING FILE WITH ZOHO PROJECTS...");

          const fileName = uploadedFile.attributes?.FileName || `test-${Date.now()}.txt`;
          const attachmentDetails = {
            storage_type: "workdrive",
            location_details: {
              folder_id: projectFolderId,
              project_id: projectId
            }
          };

          const attachmentsArray = [{
            name: fileName,
            type: "text/plain",
            size: String(testBuffer.length),
            third_party_file_id: fileId,
            entity_id: taskId,
            entity_type: "task"
          }];

          const registerForm = new FormData();
          registerForm.append("attachment_details", JSON.stringify(attachmentDetails));
          registerForm.append("attachments", JSON.stringify(attachmentsArray));

          try {
            const registerRes = await axios.post(
              `${projectsBasePath}/attachments`,
              registerForm,
              { headers: { ...authHeader, ...registerForm.getHeaders() } }
            );
            console.log("   Register response:", JSON.stringify(registerRes.data, null, 2));

            // Get the Projects attachment ID from the response
            const projectsAttachmentId = registerRes.data?.attachments?.[0]?.id || registerRes.data?.attachment?.[0]?.id;
            if (projectsAttachmentId) {
              console.log(`   Projects attachment ID: ${projectsAttachmentId}`);
            }
          } catch (regErr: any) {
            console.log("   Register failed:", regErr.response?.status, regErr.response?.data?.error?.title || regErr.message);
            console.log("   Full error:", JSON.stringify(regErr.response?.data, null, 2));

            // Fallback: Try direct association with POST /projects/{projectId}/attachments/{attachmentId}
            console.log("\n   Trying fallback: POST /projects/{projectId}/attachments/{fileId}...");
            const formData2 = new FormData();
            formData2.append("entity_type", "task");
            formData2.append("entity_id", taskId);
            try {
              const attachRes2 = await axios.post(
                `${projectsBasePath}/projects/${projectId}/attachments/${fileId}`,
                formData2,
                { headers: { ...authHeader, ...formData2.getHeaders() } }
              );
              console.log("   Fallback success:", JSON.stringify(attachRes2.data, null, 2));
            } catch (err2: any) {
              console.log("   Fallback failed:", err2.response?.status, err2.response?.data?.error?.title || err2.message);
            }
          }

          // 8. List task attachments to verify
          console.log("\n8. LISTING TASK ATTACHMENTS...");
          const listRes = await axios.get(
            `${projectsBasePath}/projects/${projectId}/attachments`,
            {
              params: { entity_type: "task", entity_id: taskId },
              headers: authHeader,
            }
          );
          const attachments = listRes.data.attachment || listRes.data.attachments || [];
          console.log(`   Found ${attachments.length} attachments`);
          if (attachments.length > 0) {
            console.log("   Attachments:", JSON.stringify(attachments, null, 2));
          }
        }

        console.log("\n============================================================");
        console.log("TEST COMPLETE");
        console.log("============================================================");
        console.log(`Project URL: https://projects.zoho.eu/portal/${portalId}#kanban/${projectId}`);
      } else {
        console.log("\n   No team folders found. Please ensure you have access to WorkDrive team folders.");
      }
    }
  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log("\nNote: Make sure your OAuth token has WorkDrive scopes:");
      console.log("- WorkDrive.users.READ");
      console.log("- WorkDrive.files.ALL");
      console.log("- WorkDrive.workspace.READ");
    }
  }
}

main().catch((error) => {
  console.error("Test failed:", error);
  process.exit(1);
});
