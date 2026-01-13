# Zoho Projects Client

This project uses the `@panoptic-it-solutions/zoho-projects-client` package for interacting with the Zoho Projects V3 API.

## Quick Reference

Use these slash commands for detailed information:
- `/zoho-projects` - Full API reference with all namespaces and methods
- `/zoho-auth` - OAuth 2.0 setup guide
- `/zoho-examples` - Common usage patterns and examples

## Client Setup

```typescript
import { createZohoProjectsClient } from '@panoptic-it-solutions/zoho-projects-client';

const client = createZohoProjectsClient({
  clientId: process.env.ZOHO_CLIENT_ID!,
  clientSecret: process.env.ZOHO_CLIENT_SECRET!,
  refreshToken: process.env.ZOHO_REFRESH_TOKEN!,
  portalId: process.env.ZOHO_PORTAL_ID!,
  // For EU region:
  apiUrl: 'https://projectsapi.zoho.eu',
  accountsUrl: 'https://accounts.zoho.eu',
});
```

## Environment Variables

```bash
ZOHO_CLIENT_ID=     # OAuth client ID from Zoho API Console
ZOHO_CLIENT_SECRET= # OAuth client secret
ZOHO_REFRESH_TOKEN= # Refresh token from OAuth flow
ZOHO_PORTAL_ID=     # Your Zoho Projects portal ID

# Optional - Region URLs (defaults to US)
ZOHO_API_URL=https://projectsapi.zoho.eu
ZOHO_ACCOUNTS_URL=https://accounts.zoho.eu
```

## Required OAuth Scopes

For full V3 API functionality:
```
ZohoProjects.projects.ALL,ZohoProjects.tasks.ALL,ZohoProjects.tasklists.ALL,ZohoProjects.portals.READ,ZohoProjects.users.ALL,ZohoProjects.timesheets.ALL,ZohoProjects.bugs.ALL,ZohoProjects.milestones.ALL,ZohoProjects.events.ALL,ZohoProjects.forums.ALL,ZohoProjects.documents.ALL,ZohoProjects.tags.ALL,ZohoProjects.status.READ,ZohoProjects.search.READ
```

**For file attachments (requires WorkDrive integration):**
```
ZohoPC.files.ALL,WorkDrive.team.ALL,WorkDrive.workspace.ALL,WorkDrive.files.ALL,WorkDrive.teamfolders.ALL
```

Use `scripts/get-refresh-token.ts` to generate a token with all scopes. This script will open a browser window for OAuth authorization and automatically request all required scopes.

---

## File Attachment Workflow (AI Agent Instructions)

Zoho Projects uses **WorkDrive** for file storage. There are two methods to attach files to tasks:

### Method 1: Simple Direct Upload (Recommended)

Use the legacy `/restapi/` endpoint with `uploaddoc` form field. This is the **simplest and most reliable** method - it handles WorkDrive upload and task association in a single request.

#### Required OAuth Scopes

| Scope | Purpose |
|-------|---------|
| `ZohoProjects.tasks.ALL` | Task operations |
| `ZohoProjects.documents.ALL` | Document access |
| `ZohoPC.files.ALL` | Attachments API |

#### Upload File to Task

```typescript
import FormData from 'form-data';
import axios from 'axios';

const formData = new FormData();
formData.append('uploaddoc', fileBuffer, {
  filename: 'test.txt',
  contentType: 'text/plain'
});

const response = await axios.post(
  `https://projectsapi.zoho.eu/restapi/portal/${portalId}/projects/${projectId}/tasks/${taskId}/attachments/`,
  formData,
  {
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      ...formData.getHeaders()
    }
  }
);

// Response contains the attachment with WorkDrive file ID
const attachment = response.data.thirdparty_attachments[0];
console.log('Attachment ID:', attachment.attachment_id);
console.log('WorkDrive File ID:', attachment.third_party_file_id);
```

#### List Task Attachments

```typescript
// Via V3 API (preferred)
const listRes = await axios.get(
  `https://projectsapi.zoho.eu/api/v3/portal/${portalId}/projects/${projectId}/attachments`,
  {
    params: { entity_type: 'task', entity_id: taskId },
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` }
  }
);
// V3 returns { attachment: [...] } (singular key)
const attachments = listRes.data.attachment || [];
```

### Method 2: Manual WorkDrive Upload (Advanced)

For more control over the upload process, you can upload to WorkDrive first, then register with Zoho Projects.

#### Additional OAuth Scopes Required

| Scope | Purpose |
|-------|---------|
| `WorkDrive.team.ALL` | Access WorkDrive teams |
| `WorkDrive.workspace.ALL` | Access workspaces |
| `WorkDrive.files.ALL` | Upload/manage files |
| `WorkDrive.teamfolders.ALL` | Access team folders |

#### Step 1: Get WorkDrive User Info
```typescript
const userRes = await axios.get('https://workdrive.zoho.eu/api/v1/users/me', {
  headers: {
    Authorization: `Zoho-oauthtoken ${accessToken}`,
    Accept: 'application/vnd.api+json'
  }
});
const preferredTeamId = userRes.data.data.attributes.preferred_team_id;
```

#### Step 2: Find the "Zoho Projects" Team Folder
```typescript
const foldersRes = await axios.get(
  `https://workdrive.zoho.eu/api/v1/teams/${preferredTeamId}/teamfolders`,
  { headers: workdriveHeaders }
);

const projectsFolder = foldersRes.data.data.find(
  f => f.attributes.name === 'Zoho Projects'
);
const projectsFolderId = projectsFolder.id;
```

#### Step 3: Find the Project-Specific Subfolder
```typescript
const subFoldersRes = await axios.get(
  `https://workdrive.zoho.eu/api/v1/teamfolders/${projectsFolderId}/folders`,
  { headers: workdriveHeaders }
);

// Find folder named like "PA-{num}-{projectName}-Attachments"
const projectFolder = subFoldersRes.data.data.find(
  f => f.attributes.name.includes(projectName) && f.attributes.name.includes('-Attachments')
);
```

#### Step 4: Upload File to WorkDrive
```typescript
const formData = new FormData();
formData.append('content', fileBuffer, {
  filename: 'test.txt',
  contentType: 'text/plain'
});
formData.append('parent_id', projectFolderId);

const uploadRes = await axios.post(
  'https://workdrive.zoho.eu/api/v1/upload',
  formData,
  { headers: { ...workdriveHeaders, ...formData.getHeaders() } }
);

const workdriveFileId = uploadRes.data.data[0].attributes.resource_id;
```

### Regional API URLs

| Region | WorkDrive API | Projects API | Accounts URL |
|--------|--------------|--------------|--------------|
| US | workdrive.zoho.com | projectsapi.zoho.com | accounts.zoho.com |
| EU | workdrive.zoho.eu | projectsapi.zoho.eu | accounts.zoho.eu |
| IN | workdrive.zoho.in | projectsapi.zoho.in | accounts.zoho.in |
| AU | workdrive.zoho.com.au | projectsapi.zoho.com.au | accounts.zoho.com.au |

### Troubleshooting

- **INVALID_OAUTHSCOPE on V3 `/attachments` endpoint**: Use Method 1 (direct upload via `/restapi/`) instead
- **No team folders found**: Use `users/me` to get `preferred_team_id`, then query `/teams/{teamId}/teamfolders`
- **Project folder not found**: Zoho automatically creates project folders; wait a moment after project creation

---

## Available Namespaces

### Portal-Level (no projectId needed)
`projects`, `users`, `tags`, `roles`, `profiles`, `clients`, `contacts`, `groups`, `leaves`, `teams`, `dashboards`, `reports`, `search`, `trash`

### Project-Scoped (require projectId)
`tasks`, `tasklists`, `phases`, `issues`, `forums`, `events`, `timelogs`, `attachments`, `documents`

### Polymorphic
- `comments.forTask(projectId, taskId)` / `comments.forIssue(projectId, issueId)`
- `followers.forTask(projectId, taskId)`

## Common Patterns

```typescript
// List with V3 pagination (page/per_page)
const { data, pageInfo } = await client.projects.list({ page: 1, per_page: 100 });

// List all (auto-paginate)
const allProjects = await client.projects.listAll();

// Iterate (memory-efficient)
for await (const project of client.projects.iterate()) {
  console.log(project.name);
}

// Create task (V3 uses nested tasklist object)
await client.tasks.create(projectId, {
  name: 'New task',
  tasklist: { id: tasklistId },
});

// Update and delete
await client.tasks.update(projectId, taskId, { status: 'completed' });
await client.tasks.delete(projectId, taskId);
```

## V3 API Notes

- **Pagination**: Uses `page` (1-based) and `per_page` instead of `index`/`range`
- **IDs**: Returns string IDs, not numbers
- **Nested objects**: Many fields like `owner`, `status`, `tasklist` are nested objects
- **Response format**: V3 returns data directly, not wrapped in arrays

## Package Documentation

- [GitHub Repository](https://github.com/Panoptic-IT-Solutions/zoho-projects-client)
- [npm Package](https://www.npmjs.com/package/@panoptic-it-solutions/zoho-projects-client)
