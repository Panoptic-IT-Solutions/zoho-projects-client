# Zoho Projects API Reference

This project uses `@panoptic-it-solutions/zoho-projects-client` - a TypeScript client for the Zoho Projects V3 API.

## Client Initialization

```typescript
import { createZohoProjectsClient } from '@panoptic-it-solutions/zoho-projects-client';

const client = createZohoProjectsClient({
  clientId: process.env.ZOHO_CLIENT_ID!,
  clientSecret: process.env.ZOHO_CLIENT_SECRET!,
  refreshToken: process.env.ZOHO_REFRESH_TOKEN!,
  portalId: process.env.ZOHO_PORTAL_ID!,
  // Optional: specify data center (default: 'com')
  // dataCenterExtension: 'eu' | 'in' | 'com.au' | 'jp' | 'com'
});
```

## API Namespaces

### Portal-Level APIs (no projectId required)

| Namespace | Description | Methods |
|-----------|-------------|---------|
| `client.projects` | Projects CRUD | `list`, `listAll`, `iterate`, `get`, `create`, `update`, `delete` |
| `client.users` | Users management | `list`, `listAll`, `iterate`, `get` |
| `client.tags` | Tags CRUD | `list`, `listAll`, `iterate`, `get`, `create`, `update`, `delete` |
| `client.roles` | Roles CRUD | `list`, `listAll`, `iterate`, `get`, `create`, `update`, `delete` |
| `client.profiles` | Profiles CRUD | `list`, `listAll`, `iterate`, `get`, `create`, `update`, `delete` |
| `client.clients` | Clients/Customers | `list`, `listAll`, `iterate`, `get`, `create`, `update`, `delete` |
| `client.contacts` | Contacts CRUD | `list`, `listAll`, `iterate`, `get`, `create`, `update`, `delete` |
| `client.groups` | Project Groups | `list`, `listAll`, `iterate`, `get`, `create`, `update`, `delete` |
| `client.leaves` | Leave management | `list`, `listAll`, `iterate`, `get`, `create`, `update`, `delete` |
| `client.teams` | Teams CRUD | `list`, `listAll`, `iterate`, `get`, `create`, `update`, `delete` |
| `client.dashboards` | Dashboards + widgets | `list`, `listAll`, `iterate`, `get`, `create`, `update`, `delete` |
| `client.reports` | Reports + execute | `list`, `listAll`, `iterate`, `get`, `execute` |
| `client.search` | Global search | `search` |
| `client.trash` | Trash management | `list`, `listAll`, `iterate`, `restore`, `deletePermanently` |

### Project-Scoped APIs (require projectId as first argument)

| Namespace | Description | Methods |
|-----------|-------------|---------|
| `client.tasks` | Tasks CRUD | `list(projectId)`, `get(projectId, taskId)`, `create`, `update`, `delete` |
| `client.tasklists` | Task Lists | `list(projectId)`, `get(projectId, tasklistId)`, `create`, `update`, `delete` |
| `client.phases` | Milestones | `list(projectId)`, `get(projectId, phaseId)`, `create`, `update`, `delete` |
| `client.issues` | Bugs/Issues | `list(projectId)`, `get(projectId, issueId)`, `create`, `update`, `delete` |
| `client.forums` | Forums | `list(projectId)`, `get(projectId, forumId)`, `create`, `update`, `delete` |
| `client.events` | Events/Calendar | `list(projectId)`, `get(projectId, eventId)`, `create`, `update`, `delete` |
| `client.timelogs` | Time logs | `list(projectId)`, `get(projectId, timelogId)`, `create`, `update`, `delete` |
| `client.attachments` | File attachments | `list(projectId)`, `upload`, `download`, `delete` |
| `client.documents` | Documents + folders | `list(projectId)`, `get`, `create`, `update`, `delete`, `listFolders`, `createFolder` |

### Polymorphic Sub-Resources

Comments and followers can be attached to different entity types:

```typescript
// Comments on tasks
const taskComments = client.comments.forTask(projectId, taskId);
await taskComments.list();
await taskComments.create({ content: 'My comment' });

// Comments on issues/bugs
const issueComments = client.comments.forIssue(projectId, issueId);
await issueComments.list();

// Followers on tasks
const taskFollowers = client.followers.forTask(projectId, taskId);
await taskFollowers.list();
await taskFollowers.add({ users: ['userId1', 'userId2'] });
```

### Nested Resources

Widgets are nested under dashboards:

```typescript
// List widgets for a dashboard
const widgets = await client.dashboards.listWidgets(dashboardId);

// Create a widget
await client.dashboards.createWidget(dashboardId, {
  name: 'Task Summary',
  type: 'chart',
});
```

## Common Patterns

### Auto-Pagination

```typescript
// Get all items (auto-paginate through all pages)
const allProjects = await client.projects.listAll();

// Memory-efficient iteration (fetches pages as needed)
for await (const project of client.projects.iterate()) {
  console.log(project.name);
}

// With filters
const openTasks = await client.tasks.listAll(projectId, {
  status: 'open',
});
```

### Error Handling

```typescript
import {
  ZohoProjectsError,
  ZohoRateLimitError,
  ZohoAuthError,
} from '@panoptic-it-solutions/zoho-projects-client';

try {
  await client.projects.get('invalid-id');
} catch (error) {
  if (error instanceof ZohoRateLimitError) {
    // Rate limited - wait and retry
    console.log(`Rate limited. Retry after ${error.retryAfter}ms`);
  } else if (error instanceof ZohoAuthError) {
    // Authentication failed - check credentials
    console.log('Authentication failed:', error.message);
  } else if (error instanceof ZohoProjectsError) {
    // General API error
    console.log('API error:', error.message, error.code);
  }
}
```

### Pagination Parameters

```typescript
// Manual pagination control
const page1 = await client.projects.list({
  index: 0,    // Start index (0-based)
  range: 100,  // Items per page (max usually 200)
});

// Access pagination info
console.log(page1.page_info?.has_next_page);
console.log(page1.page_info?.total_count);
```

## Type Exports

All types are exported from the main package:

```typescript
import type {
  // Projects
  Project,
  CreateProjectInput,
  UpdateProjectInput,

  // Tasks
  Task,
  CreateTaskInput,
  UpdateTaskInput,

  // Common
  ZohoPageInfo,
  OwnerRef,

  // And many more...
} from '@panoptic-it-solutions/zoho-projects-client';
```

## Environment Variables

Required environment variables:

```bash
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret
ZOHO_REFRESH_TOKEN=your_refresh_token
ZOHO_PORTAL_ID=your_portal_id
```

See `/zoho-auth` for OAuth 2.0 setup instructions.
