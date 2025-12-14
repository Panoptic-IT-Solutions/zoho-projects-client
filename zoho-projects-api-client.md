# Zoho Projects API Client (Issue #36)

## Overview

Create a TypeScript API client package (`@panoptic-it-solutions/zoho-projects-client`) for Zoho Projects V3 API to enable syncing project, task, and time log data for KPI tracking.

**Key Challenge:** Unlike MITP which had a Swagger YAML specification, Zoho Projects has **no OpenAPI spec available**. Types must be manually created from API documentation.

## Problem Statement / Motivation

The KPI Performance Dashboard needs to integrate with Zoho Projects to track:
- Project completion metrics
- Task status and deadlines
- Time log data for utilization tracking
- Team/user assignments

Currently, we have successful patterns from:
- `@panoptic-it-solutions/myitprocess-client` (factory pattern, openapi-fetch based)
- `@panoptic-it-solutions/autotask-client` (class-based singleton, manual types)

## Proposed Solution

Create a new npm package following the **factory pattern** (like myitprocess-client) with:

1. **OAuth 2.0 Authentication** (client credentials flow)
2. **Manual TypeScript Types** (no OpenAPI generation)
3. **Rate Limiting** via Bottleneck (100 req/2min with 30-min lockout handling)
4. **Single Region** (configured via environment variable)

### Architecture Decision

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Pattern** | Factory function | More modern, matches myitprocess-client |
| **HTTP Client** | Axios | Better interceptor support for OAuth |
| **Rate Limiting** | Bottleneck | Built-in reservoir management |
| **Token Storage** | In-memory default, Redis optional | Matches autotask-client pattern |
| **Types** | Manual with Zod validation | Runtime safety without OpenAPI |

## Technical Approach

### Design Decisions (Post-Review)

After plan review, these decisions were confirmed based on actual requirements:

| Decision | Rationale |
|----------|-----------|
| **Separate npm package** | Will be used across multiple apps, not just KPI dashboard |
| **TokenManager with promise deduplication** | Multiple apps may connect concurrently |
| **Bottleneck + optional Redis** | Multi-instance deployments need coordinated rate limiting |
| **All 4 database tables** | All data needed for KPI tracking from day 1 |
| **Single region (US)** | No current need for multi-region, simplifies config |

### Package Structure (Separate Repository)

The client will be built as a standalone npm package in its own repository (like `myitprocess-client` and `autotask-client`).

```
zoho-projects-client/
├── src/
│   ├── index.ts                 # Main exports
│   ├── client.ts                # Factory function
│   ├── errors.ts                # Custom error classes
│   ├── types/
│   │   ├── index.ts             # Type exports
│   │   ├── projects.ts          # Project types
│   │   ├── tasks.ts             # Task types
│   │   ├── timelogs.ts          # Time log types
│   │   ├── users.ts             # User types
│   │   └── common.ts            # Shared types (pagination, errors)
│   ├── auth/
│   │   └── token-manager.ts     # OAuth token management
│   └── utils/
│       ├── rate-limiter.ts      # Bottleneck wrapper
│       └── pagination.ts        # Auto-pagination helpers
├── package.json
├── tsconfig.json
└── README.md
```

### Key Implementation Details

#### 1. OAuth 2.0 Token Management

```typescript
// src/auth/token-manager.ts
interface TokenManagerConfig {
  clientId: string;
  clientSecret: string;
  accountsUrl: string;  // e.g., "https://accounts.zoho.com"
  scopes: string[];
}

class TokenManager {
  private accessToken: string | null = null;
  private expiresAt: number = 0;
  private refreshPromise: Promise<string> | null = null;

  async getValidToken(): Promise<string> {
    // Proactive refresh at 55 minutes (tokens valid for 1 hour)
    if (this.isTokenExpired()) {
      return this.refreshToken();
    }
    return this.accessToken!;
  }

  private async refreshToken(): Promise<string> {
    // Prevent concurrent refresh requests (critical for multi-instance deployments)
    if (this.refreshPromise) {
      return this.refreshPromise;
    }
    this.refreshPromise = this.doRefresh();
    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async doRefresh(): Promise<string> {
    const response = await axios.post(`${this.config.accountsUrl}/oauth/v2/token`, null, {
      params: {
        grant_type: 'client_credentials',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        scope: this.config.scopes.join(','),
      },
    });
    this.accessToken = response.data.access_token;
    this.expiresAt = Date.now() + (response.data.expires_in - 300) * 1000; // 5 min buffer
    return this.accessToken;
  }
}
```

**OAuth Endpoint**: Configured via `ZOHO_ACCOUNTS_URL` env var (default: `https://accounts.zoho.com`)

#### 2. Rate Limiting Strategy

```typescript
// src/utils/rate-limiter.ts
import Bottleneck from 'bottleneck';

const limiter = new Bottleneck({
  reservoir: 100,              // 100 requests
  reservoirRefreshAmount: 100,
  reservoirRefreshInterval: 2 * 60 * 1000,  // Per 2 minutes
  maxConcurrent: 10,
  minTime: 1200,               // ~1.2s between requests (safety margin)
});

// Handle 429 lockout
limiter.on('failed', async (error, jobInfo) => {
  if (error.response?.status === 429) {
    // 30-minute lockout - pause all requests
    return 30 * 60 * 1000;
  }
});
```

#### 3. Client Factory

```typescript
// src/client.ts
export interface ZohoProjectsConfig {
  clientId: string;
  clientSecret: string;
  portalId: string;
  apiUrl?: string;       // Default: "https://projectsapi.zoho.com"
  accountsUrl?: string;  // Default: "https://accounts.zoho.com"
  timeout?: number;      // Default: 30000ms
  redis?: {              // Optional for distributed rate limiting across instances
    url: string;
  };
}

export function createZohoProjectsClient(config: ZohoProjectsConfig) {
  const tokenManager = new TokenManager(config);
  const rateLimiter = createRateLimiter(config.redis);
  const { portalId } = config;

  return {
    projects: {
      list: (params?: ListParams) => rateLimiter.schedule(() => api.get(`/portal/${portalId}/projects`, params)),
      listAll: () => autoPaginate((page) => this.list({ page })),
      get: (projectId: string) => rateLimiter.schedule(() => api.get(`/portal/${portalId}/projects/${projectId}`)),
    },
    tasks: {
      list: (projectId: string, params?: ListParams) => rateLimiter.schedule(() => api.get(`/portal/${portalId}/projects/${projectId}/tasks`, params)),
      listAll: (projectId: string) => autoPaginate((page) => this.list(projectId, { page })),
      get: (projectId: string, taskId: string) => rateLimiter.schedule(() => api.get(`/portal/${portalId}/projects/${projectId}/tasks/${taskId}`)),
    },
    timelogs: {
      list: (params?: TimeLogParams) => rateLimiter.schedule(() => api.get(`/portal/${portalId}/logs`, params)),
      listAll: (params?: Omit<TimeLogParams, 'page'>) => autoPaginate((page) => this.list({ ...params, page })),
    },
    users: {
      list: () => rateLimiter.schedule(() => api.get(`/portal/${portalId}/users`)),
      get: (userId: string) => rateLimiter.schedule(() => api.get(`/portal/${portalId}/users/${userId}`)),
    },
  };
}

export type ZohoProjectsClient = ReturnType<typeof createZohoProjectsClient>;
```

### Database Schema (for sync)

```typescript
// src/lib/db/schema.ts additions

export const zohoProjects = pgTable("zoho_projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  zohoId: varchar("zoho_id", { length: 50 }).notNull().unique(),
  portalId: varchar("portal_id", { length: 50 }).notNull(),
  name: varchar("name", { length: 500 }),
  status: varchar("status", { length: 50 }),
  ownerUserId: uuid("owner_user_id").references(() => users.id),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  syncedAt: timestamp("synced_at").defaultNow().notNull(),
}, (table) => [
  index("idx_zoho_projects_portal").on(table.portalId),
  index("idx_zoho_projects_owner").on(table.ownerUserId),
]);

export const zohoTasks = pgTable("zoho_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  zohoId: varchar("zoho_id", { length: 50 }).notNull().unique(),
  projectId: varchar("project_id", { length: 50 }).notNull(),
  name: varchar("name", { length: 500 }),
  status: varchar("status", { length: 50 }),
  priority: varchar("priority", { length: 50 }),
  assignedToId: uuid("assigned_to_id").references(() => users.id),
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  syncedAt: timestamp("synced_at").defaultNow().notNull(),
}, (table) => [
  index("idx_zoho_tasks_project").on(table.projectId),
  index("idx_zoho_tasks_assigned").on(table.assignedToId),
]);

export const zohoTimeLogs = pgTable("zoho_time_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  zohoId: varchar("zoho_id", { length: 50 }).notNull().unique(),
  taskId: varchar("task_id", { length: 50 }),
  projectId: varchar("project_id", { length: 50 }).notNull(),
  userId: uuid("user_id").references(() => users.id),
  hours: decimal("hours", { precision: 10, scale: 2 }),
  billableHours: decimal("billable_hours", { precision: 10, scale: 2 }),
  logDate: timestamp("log_date"),
  notes: text("notes"),
  syncedAt: timestamp("synced_at").defaultNow().notNull(),
}, (table) => [
  index("idx_zoho_time_logs_project").on(table.projectId),
  index("idx_zoho_time_logs_user").on(table.userId),
  index("idx_zoho_time_logs_date").on(table.logDate),
]);

export const zohoUsers = pgTable("zoho_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  zohoId: varchar("zoho_id", { length: 50 }).notNull().unique(),
  portalId: varchar("portal_id", { length: 50 }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  email: varchar("email", { length: 255 }),
  name: varchar("name", { length: 255 }),
  role: varchar("role", { length: 100 }),
  syncedAt: timestamp("synced_at").defaultNow().notNull(),
}, (table) => [
  index("idx_zoho_users_user_id").on(table.userId),
  index("idx_zoho_users_email").on(table.email),
]);
```

### Environment Variables

```env
# .env.example additions
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret
ZOHO_PORTAL_ID=your_portal_id
# Optional - defaults to US region
ZOHO_API_URL=https://projectsapi.zoho.com
ZOHO_ACCOUNTS_URL=https://accounts.zoho.com
```

## Implementation Phases

### Phase 1-3: Client Package (Separate Repository)

Build the `@panoptic-it-solutions/zoho-projects-client` package in its own repository.

**Phase 1 - Foundation:**
- `package.json`, `tsconfig.json`
- `src/index.ts` - Main exports
- `src/types/*.ts` - Manual type definitions for Projects, Tasks, TimeLogs, Users
- `src/errors.ts` - Custom error classes

**Phase 2 - Authentication & Rate Limiting:**
- `src/auth/token-manager.ts` - OAuth with promise deduplication
- `src/utils/rate-limiter.ts` - Bottleneck with optional Redis
- `src/client.ts` - Factory function

**Phase 3 - Resource Endpoints:**
- `src/utils/pagination.ts` - Auto-pagination helpers
- Resource methods in `client.ts` for projects, tasks, timelogs, users
- Publish to npm

### Phase 4: Integration into KPI App

After the client package is published, integrate into this repository:

**Files to modify/create:**
- `src/lib/zoho/client.ts` - Client wrapper (import from npm package)
- `src/lib/zoho/sync.ts` - Sync functions
- `src/lib/db/schema.ts` - Database tables (zohoProjects, zohoTasks, zohoTimeLogs, zohoUsers)
- `drizzle/migrations/XXXX_add_zoho_tables.sql`
- `src/lib/trpc/routers/sync.ts` - Add Zoho sync endpoint

**Deliverables:**
- Database migrations
- Sync implementation following Autotask pattern
- Integration with existing sync infrastructure

## Gaps Requiring Clarification

### Will Discover During Implementation

| Gap | Assumption | Fallback |
|-----|------------|----------|
| **Pagination termination** | Empty array or < requested records | Check `has_more` field if present |
| **Rate limit headers** | May have `X-RateLimit-Remaining` | Fall back to reactive limiting on 429 |
| **Error response format** | `{ error: { code, message } }` | Log raw errors for debugging |
| **Incremental sync support** | API may support `updated_since` | Full fetch, compare with `syncedAt` |
| **Custom fields in responses** | May include custom fields | Type as `Record<string, unknown>` |

## Success Metrics

- [ ] Package published to npm (`@panoptic-it-solutions/zoho-projects-client`)
- [ ] All 4 resources implemented (Projects, Tasks, TimeLogs, Users)
- [ ] OAuth token management with automatic refresh
- [ ] Rate limiting prevents 30-minute lockouts
- [ ] Database sync working with incremental updates
- [ ] Integration tests passing against Zoho sandbox

## Dependencies & Prerequisites

**For Client Package (Phases 1-3):**
1. **Zoho Developer Account** - For OAuth credentials
2. **Zoho Projects Portal** - With test data
3. **npm Publish Access** - To `@panoptic-it-solutions` scope

**For KPI Integration (Phase 4):**
1. Published `@panoptic-it-solutions/zoho-projects-client` package
2. Zoho credentials configured in environment

## Risk Analysis

| Risk | Impact | Mitigation |
|------|--------|------------|
| No OpenAPI spec | High - Manual type maintenance | Comprehensive Zod validation |
| Rate limit lockout (30 min) | Medium - Sync delays | Bottleneck with safety margin |
| Token expiry mid-sync | Medium - Partial sync | Proactive refresh at 55 min |
| Multi-instance token conflicts | Medium - Auth failures | Promise deduplication in TokenManager |

## References

### Internal References
- MyITProcess client pattern: `src/lib/myitprocess/client.ts:1-21`
- Autotask client pattern: `src/lib/autotask/client.ts:7-50`
- Database sync pattern: `src/lib/autotask/sync.ts:46-159`
- Schema pattern: `src/lib/db/schema.ts:150-177`

### External References
- [Zoho Projects V3 API Documentation](https://projects.zoho.com/api-docs)
- [Zoho OAuth 2.0 Guide](https://www.zoho.com/accounts/protocol/oauth.html)
- [Zoho Rate Limiting](https://www.zoho.com/projects/help/rest-api/zohoprojectsapi.html)
- [Bottleneck Library](https://github.com/SGrondin/bottleneck)

### Related Issues
- Issue #36 - This plan
- Research docs created: `docs/ZOHO_PROJECTS_API_V3_GUIDE.md`
