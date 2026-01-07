# @panoptic-it-solutions/zoho-projects-client

TypeScript client for Zoho Projects V3 API with OAuth 2.0 and rate limiting.

## Installation

```bash
npm install @panoptic-it-solutions/zoho-projects-client
```

## AI Agent Setup (Claude Code)

For projects using Claude Code or other AI coding assistants, run the init command to set up helpful slash commands and documentation:

```bash
npx @panoptic-it-solutions/zoho-projects-client init
```

### What it sets up

| File/Directory | Description |
|----------------|-------------|
| `.claude/commands/zoho-projects.md` | Full API reference with all namespaces and methods |
| `.claude/commands/zoho-auth.md` | OAuth 2.0 setup guide |
| `.claude/commands/zoho-examples.md` | Common usage patterns and examples |
| `CLAUDE.md` | Project context file for AI assistants |

### Available Slash Commands

After setup, use these commands in Claude Code:

- `/zoho-projects` - Complete API reference
- `/zoho-auth` - OAuth authentication setup guide
- `/zoho-examples` - Code examples and patterns

### Options

```bash
# Include type definitions for enhanced AI visibility
npx @panoptic-it-solutions/zoho-projects-client init --with-types

# Skip npm install (if already installed)
npx @panoptic-it-solutions/zoho-projects-client init --skip-install

# Show help
npx @panoptic-it-solutions/zoho-projects-client init --help
```

The `--with-types` option copies TypeScript definitions to `.ai-types/` for AI assistants that benefit from having type information in the project.

## Quick Start

```typescript
import { createZohoProjectsClient } from "@panoptic-it-solutions/zoho-projects-client";

const client = createZohoProjectsClient({
  clientId: process.env.ZOHO_CLIENT_ID!,
  clientSecret: process.env.ZOHO_CLIENT_SECRET!,
  refreshToken: process.env.ZOHO_REFRESH_TOKEN!,
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

## Authentication Setup

Zoho requires OAuth 2.0 with a refresh token. Here's how to get one:

### 1. Create a Client

1. Go to [Zoho API Console](https://api-console.zoho.com) (or `.eu`, `.in`, `.com.au` for your region)
2. Click **Add Client** → **Server-based Applications**
3. Fill in the details and click **Create**
4. Copy the **Client ID** and **Client Secret**

### 2. Generate a Refresh Token

1. In API Console, select your client → **Generate Code** → **Self Client**
2. Enter scope:
   ```
   ZohoProjects.projects.ALL,ZohoProjects.tasks.ALL,ZohoProjects.timesheets.ALL,ZohoProjects.users.ALL,ZohoProjects.portals.ALL,ZohoProjects.bugs.ALL,ZohoProjects.events.ALL,ZohoProjects.forums.ALL,ZohoProjects.documents.ALL
   ```
3. Click **Create** and copy the authorization code
4. Exchange it for a refresh token (within 2 minutes):

```bash
curl -X POST "https://accounts.zoho.com/oauth/v2/token" \
  -d "grant_type=authorization_code" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "code=YOUR_AUTH_CODE"
```

5. Copy the `refresh_token` from the response (it doesn't expire unless revoked)

## Configuration

```typescript
const client = createZohoProjectsClient({
  // Required
  clientId: "your_client_id",
  clientSecret: "your_client_secret",
  refreshToken: "your_refresh_token",
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

## Available APIs

The client provides access to 26 API namespaces:

### Portal-Level APIs (no projectId required)

| Namespace | Description |
|-----------|-------------|
| `projects` | Project management |
| `users` | Portal users |
| `tags` | Tags/labels |
| `roles` | User roles |
| `profiles` | Permission profiles |
| `clients` | Client companies |
| `contacts` | Client contacts |
| `groups` | Project groups |
| `leaves` | Leave requests |
| `teams` | Team management |
| `portals` | Portal information |
| `modules` | Portal modules |
| `dashboards` | Dashboards & widgets |
| `reports` | Report execution |
| `search` | Global search |
| `trash` | Deleted items |

### Project-Scoped APIs (require projectId)

| Namespace | Description |
|-----------|-------------|
| `tasks` | Task management |
| `tasklists` | Task list management |
| `phases` | Project phases/milestones |
| `issues` | Bug/issue tracking |
| `forums` | Discussion forums |
| `events` | Calendar events |
| `timelogs` | Time tracking |
| `timers` | Active timers |
| `attachments` | File attachments |
| `documents` | Project documents |
| `blueprints` | Workflow blueprints |
| `customviews` | Custom views |

### Polymorphic APIs

| Namespace | Description |
|-----------|-------------|
| `comments` | Comments on tasks, issues, forums |
| `followers` | Followers on tasks, issues, forums |

## API Reference

### Projects

```typescript
// List with pagination
const { data, pageInfo } = await client.projects.list({ index: 0, range: 100 });

// Get all projects (auto-pagination)
const projects = await client.projects.listAll();

// Iterate (memory-efficient)
for await (const project of client.projects.iterate()) {
  console.log(project.name);
}

// CRUD operations
const project = await client.projects.get("project_id");
const newProject = await client.projects.create({ name: "My Project" });
await client.projects.update("project_id", { name: "Updated Name" });
await client.projects.delete("project_id");
```

### Tasks

```typescript
// List tasks for a project
const { data } = await client.tasks.list("project_id");

// Get all tasks for a project
const tasks = await client.tasks.listAll("project_id");

// Get all tasks across all projects
const allTasks = await client.tasks.listAllAcrossProjects();

// CRUD operations
const task = await client.tasks.get("project_id", "task_id");
await client.tasks.create("project_id", { name: "New Task", tasklist_id: "list_id" });
await client.tasks.update("project_id", "task_id", { status: "completed" });
await client.tasks.delete("project_id", "task_id");
```

### Time Logs

Time logs require specific parameters:

```typescript
// List time logs for a project
const { data } = await client.timelogs.list("project_id", {
  users_list: "all",              // "all" or comma-separated user IDs
  view_type: "month",             // "day", "week", "month", or "custom_date"
  date: "01-15-2025",             // MM-DD-YYYY format
  bill_status: "All",             // "All", "Billable", or "Non Billable"
  component_type: "task",         // "task", "bug", or "general"
});

// Create time logs
await client.timelogs.createForTask("project_id", {
  task_id: "task_id",
  date: "01-15-2025",
  hours: "2",
  bill_status: "Billable",
});

await client.timelogs.createForBug("project_id", {
  bug_id: "bug_id",
  date: "01-15-2025",
  hours: "1",
  bill_status: "Non Billable",
});

await client.timelogs.createGeneral("project_id", {
  name: "Meeting",
  date: "01-15-2025",
  hours: "1",
  bill_status: "Non Billable",
});
```

### Issues (Bugs)

```typescript
const { data } = await client.issues.list("project_id");
const issue = await client.issues.get("project_id", "issue_id");
await client.issues.create("project_id", { title: "Bug report" });
await client.issues.update("project_id", "issue_id", { status: "fixed" });
await client.issues.delete("project_id", "issue_id");
```

### Comments (Polymorphic)

```typescript
// Comments on tasks
const taskComments = client.comments.forTask("project_id", "task_id");
const { data } = await taskComments.list();
await taskComments.create({ content: "Great work!" });

// Comments on issues
const issueComments = client.comments.forIssue("project_id", "issue_id");
await issueComments.list();

// Comments on forums
const forumComments = client.comments.forForum("project_id", "forum_id");
await forumComments.list();
```

### Followers (Polymorphic)

```typescript
// Followers on tasks
const taskFollowers = client.followers.forTask("project_id", "task_id");
const { data } = await taskFollowers.list();
await taskFollowers.add({ user_ids: ["user_1", "user_2"] });
await taskFollowers.remove("user_id");

// Followers on issues
const issueFollowers = client.followers.forIssue("project_id", "issue_id");
await issueFollowers.list();
```

### Search

```typescript
// Global search
const results = await client.search.query({ search_term: "keyword" });

// Search with filters
const taskResults = await client.search.query({
  search_term: "keyword",
  entity_type: "task",
});

// Convenience methods
await client.search.tasks("keyword");
await client.search.issues("keyword");
await client.search.projects("keyword");

// Search within a project
await client.search.inProject("project_id", { search_term: "keyword" });
```

### Trash

```typescript
// List deleted items
const { data } = await client.trash.list();
const projectTrash = await client.trash.list({ entity_type: "task" });

// Restore from trash
await client.trash.restore("task", "item_id");

// Permanently delete
await client.trash.permanentDelete("task", "item_id");

// Empty trash
await client.trash.empty();           // All items
await client.trash.empty("task");     // Only tasks
```

### Timers

```typescript
// Get active timer for current user
const timer = await client.timers.getActive("project_id");

// Start/stop timer on a task
await client.timers.startForTask("project_id", "task_id");
await client.timers.stop("project_id");

// Start/stop timer on a bug
await client.timers.startForBug("project_id", "bug_id");
```

### Teams

```typescript
const { data } = await client.teams.list();
const team = await client.teams.get("team_id");
await client.teams.create({ name: "Engineering" });
await client.teams.addMembers("team_id", { user_ids: ["user_1", "user_2"] });
await client.teams.removeMember("team_id", "user_id");
```

### Dashboards & Widgets

```typescript
// Dashboards
const { data } = await client.dashboards.list();
const dashboard = await client.dashboards.get("dashboard_id");

// Widgets within a dashboard
const widgets = client.dashboards.widgets("dashboard_id");
const { data: widgetList } = await widgets.list();
await widgets.create({ name: "Task Chart", type: "chart" });
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
ZOHO_REFRESH_TOKEN=your_refresh_token
ZOHO_PORTAL_ID=your_portal_id

# Optional - defaults to US region
ZOHO_API_URL=https://projectsapi.zoho.com
ZOHO_ACCOUNTS_URL=https://accounts.zoho.com
```

## License

MIT
