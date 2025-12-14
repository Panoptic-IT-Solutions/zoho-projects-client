# @panoptic-it-solutions/zoho-projects-client

TypeScript client for Zoho Projects V3 API with OAuth 2.0 and rate limiting.

## Installation

```bash
npm install @panoptic-it-solutions/zoho-projects-client
```

## Quick Start

```typescript
import { createZohoProjectsClient } from "@panoptic-it-solutions/zoho-projects-client";

const client = createZohoProjectsClient({
  clientId: process.env.ZOHO_CLIENT_ID!,
  clientSecret: process.env.ZOHO_CLIENT_SECRET!,
  portalId: process.env.ZOHO_PORTAL_ID!,
});

// List projects
const { data: projects } = await client.projects.list();

// Get all projects with auto-pagination
const allProjects = await client.projects.listAll();

// Iterate over projects
for await (const project of client.projects.iterate()) {
  console.log(project.name);
}
```

## Configuration

```typescript
const client = createZohoProjectsClient({
  // Required
  clientId: "your_client_id",
  clientSecret: "your_client_secret",
  portalId: "your_portal_id",

  // Optional - defaults shown
  apiUrl: "https://projectsapi.zoho.com",      // US region
  accountsUrl: "https://accounts.zoho.com",    // US region
  timeout: 30000,                               // 30 seconds

  // Optional - for distributed rate limiting
  redis: {
    url: "redis://localhost:6379",
  },
});
```

### Region URLs

| Region | API URL | Accounts URL |
|--------|---------|--------------|
| US | `https://projectsapi.zoho.com` | `https://accounts.zoho.com` |
| EU | `https://projectsapi.zoho.eu` | `https://accounts.zoho.eu` |
| IN | `https://projectsapi.zoho.in` | `https://accounts.zoho.in` |
| AU | `https://projectsapi.zoho.com.au` | `https://accounts.zoho.com.au` |

## API Reference

### Projects

```typescript
// List with pagination
const { data, pageInfo } = await client.projects.list({ index: 0, range: 100 });

// Get all projects
const projects = await client.projects.listAll();

// Get single project
const project = await client.projects.get("project_id");

// Iterate with auto-pagination
for await (const project of client.projects.iterate()) {
  console.log(project.name);
}
```

### Tasks

```typescript
// List tasks for a project
const { data } = await client.tasks.list("project_id");

// Get all tasks for a project
const tasks = await client.tasks.listAll("project_id");

// Get single task
const task = await client.tasks.get("project_id", "task_id");

// Get all tasks across all projects
const allTasks = await client.tasks.listAllAcrossProjects();
```

### Time Logs

```typescript
// List time logs for a project
const { data } = await client.timelogs.list("project_id", {
  bill_status: "Billable",
  view_type: "week",
});

// Get all time logs for a project
const logs = await client.timelogs.listAll("project_id");

// Get all time logs across all projects
const allLogs = await client.timelogs.listAllAcrossProjects();
```

### Users

```typescript
// List portal users
const { data } = await client.users.list();

// Get all users
const users = await client.users.listAll();

// Get single user
const user = await client.users.get("user_id");

// List users for a project
const { data: projectUsers } = await client.users.listForProject("project_id");
```

## Rate Limiting

The client automatically handles Zoho's rate limits:
- 100 requests per 2 minutes
- 30-minute lockout on 429 response

Uses [Bottleneck](https://github.com/SGrondin/bottleneck) with a safety margin (90 requests per 2 minutes).

For distributed deployments, configure Redis:

```typescript
const client = createZohoProjectsClient({
  // ...
  redis: {
    url: process.env.REDIS_URL!,
  },
});
```

## Error Handling

```typescript
import {
  ZohoProjectsError,
  ZohoAuthenticationError,
  ZohoRateLimitError,
  ZohoNotFoundError,
  isRateLimitError,
} from "@panoptic-it-solutions/zoho-projects-client";

try {
  const project = await client.projects.get("invalid_id");
} catch (error) {
  if (error instanceof ZohoNotFoundError) {
    console.log("Project not found");
  } else if (isRateLimitError(error)) {
    console.log(`Rate limited, retry after ${error.lockoutDurationMs}ms`);
  } else if (error instanceof ZohoAuthenticationError) {
    console.log("Invalid credentials");
  }
}
```

## Environment Variables

```env
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret
ZOHO_PORTAL_ID=your_portal_id

# Optional - defaults to US region
ZOHO_API_URL=https://projectsapi.zoho.com
ZOHO_ACCOUNTS_URL=https://accounts.zoho.com
```

## License

MIT
