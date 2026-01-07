# Zoho Projects Client - Common Usage Examples

## Setup

```typescript
import { createZohoProjectsClient } from '@panoptic-it-solutions/zoho-projects-client';
import 'dotenv/config';

const client = createZohoProjectsClient({
  clientId: process.env.ZOHO_CLIENT_ID!,
  clientSecret: process.env.ZOHO_CLIENT_SECRET!,
  refreshToken: process.env.ZOHO_REFRESH_TOKEN!,
  portalId: process.env.ZOHO_PORTAL_ID!,
});
```

## Projects

### List All Projects

```typescript
// Get first page
const response = await client.projects.list();
console.log(response.projects);

// Get all projects (auto-paginate)
const allProjects = await client.projects.listAll();

// Iterate through all projects (memory-efficient)
for await (const project of client.projects.iterate()) {
  console.log(project.name);
}

// With filters
const activeProjects = await client.projects.listAll({
  status: 'active',
});
```

### Create a Project

```typescript
const newProject = await client.projects.create({
  name: 'New Website Redesign',
  description: 'Complete redesign of company website',
  start_date: '2025-01-15',
  end_date: '2025-06-30',
  status: 'active',
});

console.log('Created project:', newProject.projects[0].id_string);
```

### Update a Project

```typescript
await client.projects.update(projectId, {
  name: 'Updated Project Name',
  status: 'on_hold',
});
```

### Delete a Project

```typescript
await client.projects.delete(projectId);
```

## Tasks

### List Tasks in a Project

```typescript
const tasks = await client.tasks.list(projectId);

// With filters
const openTasks = await client.tasks.list(projectId, {
  status: 'open',
  owner: 'userId',
});

// Get all tasks
const allTasks = await client.tasks.listAll(projectId);
```

### Create a Task

```typescript
const task = await client.tasks.create(projectId, {
  name: 'Implement user authentication',
  description: 'Add OAuth 2.0 login flow',
  start_date: '2025-01-20',
  end_date: '2025-01-25',
  priority: 'high',
  owners: ['userId1', 'userId2'],
  tasklist_id: tasklistId,
});
```

### Update a Task

```typescript
await client.tasks.update(projectId, taskId, {
  status: 'completed',
  percent_complete: 100,
});
```

## Task Lists

### Create a Task List

```typescript
const tasklist = await client.tasklists.create(projectId, {
  name: 'Sprint 1 Tasks',
  flag: 'internal',
});
```

### List Task Lists

```typescript
const tasklists = await client.tasklists.list(projectId);
```

## Time Logs

### Log Time

```typescript
await client.timelogs.create(projectId, {
  task_id: taskId,
  date: '2025-01-20',
  hours: 2,
  minutes: 30,
  bill_status: 'Billable',
  notes: 'Implemented login UI',
});
```

### Get Time Logs for a Task

```typescript
const timelogs = await client.timelogs.list(projectId, {
  task_id: taskId,
});
```

## Issues/Bugs

### Create a Bug

```typescript
const bug = await client.issues.create(projectId, {
  title: 'Login button not working on mobile',
  description: 'The login button is unresponsive on iOS Safari',
  severity: 'major',
  reproducible: 'Always',
  module: 'Authentication',
});
```

### List Bugs

```typescript
const bugs = await client.issues.list(projectId, {
  status: 'open',
});
```

## Comments

### Add a Comment to a Task

```typescript
const taskComments = client.comments.forTask(projectId, taskId);

await taskComments.create({
  content: 'This task is blocked waiting for API access.',
});

// List comments
const comments = await taskComments.list();
```

### Add a Comment to a Bug

```typescript
const bugComments = client.comments.forIssue(projectId, bugId);

await bugComments.create({
  content: 'Unable to reproduce this issue.',
});
```

## Followers

### Add Followers to a Task

```typescript
const taskFollowers = client.followers.forTask(projectId, taskId);

await taskFollowers.add({
  users: ['userId1', 'userId2'],
});

// List followers
const followers = await taskFollowers.list();
```

## Users

### List All Users

```typescript
const users = await client.users.listAll();

for (const user of users) {
  console.log(`${user.name} (${user.email})`);
}
```

### Get a Specific User

```typescript
const user = await client.users.get(userId);
```

## Search

### Global Search

```typescript
const results = await client.search.search({
  search_term: 'authentication',
  entity_type: 'task', // 'all', 'project', 'task', 'bug', etc.
});

for (const result of results.results || []) {
  console.log(`${result.entity_type}: ${result.name}`);
}
```

## Dashboards and Widgets

### List Dashboards

```typescript
const dashboards = await client.dashboards.list();
```

### Get Dashboard Widgets

```typescript
const widgets = await client.dashboards.listWidgets(dashboardId);
```

## Error Handling

```typescript
import {
  ZohoProjectsError,
  ZohoRateLimitError,
  ZohoAuthError,
  ZohoNotFoundError,
} from '@panoptic-it-solutions/zoho-projects-client';

async function safeApiCall() {
  try {
    const project = await client.projects.get(projectId);
    return project;
  } catch (error) {
    if (error instanceof ZohoNotFoundError) {
      console.log('Project not found');
      return null;
    }
    if (error instanceof ZohoRateLimitError) {
      console.log(`Rate limited. Retry after ${error.retryAfter}ms`);
      await new Promise(r => setTimeout(r, error.retryAfter));
      return safeApiCall(); // Retry
    }
    if (error instanceof ZohoAuthError) {
      console.log('Authentication failed - check credentials');
      throw error;
    }
    if (error instanceof ZohoProjectsError) {
      console.log(`API Error: ${error.message} (${error.code})`);
      throw error;
    }
    throw error;
  }
}
```

## Batch Operations

### Create Multiple Tasks

```typescript
async function createTasks(projectId: string, tasks: CreateTaskInput[]) {
  const results = [];
  for (const taskInput of tasks) {
    const result = await client.tasks.create(projectId, taskInput);
    results.push(result);
  }
  return results;
}

// Usage
await createTasks(projectId, [
  { name: 'Task 1', tasklist_id: tasklistId },
  { name: 'Task 2', tasklist_id: tasklistId },
  { name: 'Task 3', tasklist_id: tasklistId },
]);
```

### Bulk Update Status

```typescript
async function completeAllTasks(projectId: string, taskIds: string[]) {
  for (const taskId of taskIds) {
    await client.tasks.update(projectId, taskId, {
      status: 'completed',
      percent_complete: 100,
    });
  }
}
```

## Reports

### Get Report Data

```typescript
const reports = await client.reports.list();

// Execute a report
const reportData = await client.reports.execute(reportId, {
  start_date: '2025-01-01',
  end_date: '2025-01-31',
});

for (const row of reportData.data) {
  console.log(row);
}
```

## Trash Management

### List Deleted Items

```typescript
const trashedItems = await client.trash.list({
  entity_type: 'task',
});

for (const item of trashedItems.trash || []) {
  console.log(`${item.name} - deleted by ${item.deleted_person}`);
}
```

### Restore a Deleted Item

```typescript
await client.trash.restore(itemId);
```

## Best Practices

1. **Use listAll() for small datasets** - It loads all pages into memory
2. **Use iterate() for large datasets** - Memory-efficient streaming
3. **Handle rate limits** - Catch `ZohoRateLimitError` and retry
4. **Use specific scopes** - Only request the OAuth scopes you need
5. **Cache user data** - User lists don't change often
6. **Batch operations carefully** - Zoho has rate limits per minute
