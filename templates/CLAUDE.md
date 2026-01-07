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
});
```

## Environment Variables

```bash
ZOHO_CLIENT_ID=     # OAuth client ID from Zoho API Console
ZOHO_CLIENT_SECRET= # OAuth client secret
ZOHO_REFRESH_TOKEN= # Refresh token from OAuth flow
ZOHO_PORTAL_ID=     # Your Zoho Projects portal ID
```

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
// List all (auto-paginate)
const allProjects = await client.projects.listAll();

// Iterate (memory-efficient)
for await (const project of client.projects.iterate()) {
  console.log(project.name);
}

// CRUD operations
await client.tasks.create(projectId, { name: 'New task', tasklist_id: tasklistId });
await client.tasks.update(projectId, taskId, { status: 'completed' });
await client.tasks.delete(projectId, taskId);
```

## Package Documentation

- [GitHub Repository](https://github.com/Panoptic-IT-Solutions/zoho-projects-client)
- [npm Package](https://www.npmjs.com/package/@panoptic-it-solutions/zoho-projects-client)
