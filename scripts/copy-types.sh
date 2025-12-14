#!/bin/bash

# Copy Zoho Projects API types to a target project for AI visibility
#
# Usage: ./scripts/copy-types.sh /path/to/project
#
# This copies the type definitions to your project so AI tools can
# see and understand the API structure.

set -e

if [ -z "$1" ]; then
  echo "Usage: ./scripts/copy-types.sh <target-project-path>"
  echo ""
  echo "Example:"
  echo "  ./scripts/copy-types.sh ../my-nextjs-app"
  echo "  ./scripts/copy-types.sh /Users/me/projects/dashboard"
  echo ""
  echo "This will copy the types to:"
  echo "  <target>/src/types/zoho-projects-api.d.ts"
  exit 1
fi

TARGET_PROJECT="$1"
TARGET_DIR="$TARGET_PROJECT/src/types"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/.."

# Check target project exists
if [ ! -d "$TARGET_PROJECT" ]; then
  echo "Error: Target project not found at $TARGET_PROJECT"
  exit 1
fi

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Generate consolidated types file
OUTPUT_FILE="$TARGET_DIR/zoho-projects-api.d.ts"

cat > "$OUTPUT_FILE" << 'EOF'
/**
 * Zoho Projects API Types
 *
 * Auto-generated from @panoptic-it-solutions/zoho-projects-client
 * For AI visibility and quick reference.
 *
 * Usage in your code:
 *   import { createZohoProjectsClient } from "@panoptic-it-solutions/zoho-projects-client";
 *   import type { Project, Task, TimeLog, User } from "@panoptic-it-solutions/zoho-projects-client";
 */

// ============================================================================
// Core Types
// ============================================================================

export interface Project {
  id: number;
  id_string: string;
  name: string;
  status: string;
  description?: string;
  owner_name?: string;
  owner_id?: string | number;
  start_date?: string;
  end_date?: string;
  created_date?: string;
  created_date_long?: number;
  is_strict?: boolean;
  bug_prefix?: string;
  task_prefix?: string;
  workspace_id?: string;
  group_name?: string;
  group_id?: string | number;
  link?: {
    self?: { url?: string };
    task?: { url?: string };
    bug?: { url?: string };
    folder?: { url?: string };
  };
  // ... additional fields may be present
}

export interface Task {
  id: number;
  id_string: string;
  name: string;
  status?: {
    id?: number;
    name?: string;
    color_code?: string;
    type?: string;
  };
  priority?: string;
  percent_complete?: string;
  start_date?: string;
  end_date?: string;
  created_time?: string;
  created_time_long?: number;
  last_updated_time?: string;
  last_updated_time_long?: number;
  description?: string;
  details?: {
    owners?: Array<{
      id?: string | number;
      name?: string;
      email?: string;
      zpuid?: string | number;
    }>;
  };
  tasklist?: {
    id?: number;
    id_string?: string;
    name?: string;
  };
  link?: {
    self?: { url?: string };
    subtask?: { url?: string };
  };
  // ... additional fields may be present
}

export interface TimeLog {
  id?: number;
  id_string?: string;
  task_id?: string;
  task_name?: string;
  bug_id?: string;
  bug_title?: string;
  project_id?: string;
  project_name?: string;
  owner_id?: string;
  owner_name?: string;
  owner_zpuid?: string;
  bill_status?: string;
  hours?: string;
  minutes?: string;
  total_minutes?: number;
  hours_display?: string;
  notes?: string;
  log_date?: string;
  log_date_long?: number;
  created_date?: string;
  created_date_long?: number;
  approval_status?: string;
  link?: {
    self?: { url?: string };
  };
  // ... additional fields may be present
}

export interface User {
  id: number;
  id_string?: string;
  name: string;
  email: string;
  role?: string;
  active?: boolean;
  zpuid?: string | number;
  profile_url?: string;
}

// ============================================================================
// List Parameters
// ============================================================================

export interface ListParams {
  index?: number;
  range?: number;
  sort_column?: string;
  sort_order?: "ascending" | "descending";
}

export interface TimeLogParams {
  index?: number;
  range?: number;
  /** "all" or comma-separated user IDs */
  users_list: string;
  /** "day", "week", "month", or "custom_date" */
  view_type: "day" | "week" | "month" | "custom_date";
  /** Date in MM-DD-YYYY format */
  date: string;
  /** "All", "Billable", or "Non Billable" */
  bill_status: "All" | "Billable" | "Non Billable";
  /** "task", "bug", or "general" */
  component_type: "task" | "bug" | "general";
}

// ============================================================================
// Pagination
// ============================================================================

export interface PageInfo {
  index: number;
  range: number;
  has_more_records?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pageInfo?: PageInfo;
}

// ============================================================================
// Client Configuration
// ============================================================================

export interface ZohoProjectsConfig {
  /** OAuth client ID from Zoho Developer Console */
  clientId: string;
  /** OAuth client secret from Zoho Developer Console */
  clientSecret: string;
  /** OAuth refresh token (obtained via authorization code flow) */
  refreshToken: string;
  /** Zoho Projects portal ID */
  portalId: string;
  /** API base URL (default: https://projectsapi.zoho.com) */
  apiUrl?: string;
  /** OAuth accounts URL (default: https://accounts.zoho.com) */
  accountsUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Redis configuration for distributed rate limiting */
  redis?: {
    url: string;
  };
}

// ============================================================================
// Client API
// ============================================================================

export interface ZohoProjectsClient {
  projects: {
    list(params?: ListParams): Promise<PaginatedResponse<Project>>;
    listAll(): Promise<Project[]>;
    iterate(): AsyncGenerator<Project>;
    get(projectId: string): Promise<Project>;
  };

  tasks: {
    list(projectId: string, params?: ListParams): Promise<PaginatedResponse<Task>>;
    listAll(projectId: string): Promise<Task[]>;
    iterate(projectId: string): AsyncGenerator<Task>;
    get(projectId: string, taskId: string): Promise<Task>;
    listAllAcrossProjects(): Promise<Task[]>;
  };

  timelogs: {
    list(projectId: string, params: TimeLogParams): Promise<PaginatedResponse<TimeLog>>;
    listAll(projectId: string, params: Omit<TimeLogParams, "index" | "range">): Promise<TimeLog[]>;
    iterate(projectId: string, params: Omit<TimeLogParams, "index" | "range">): AsyncGenerator<TimeLog>;
    listAllAcrossProjects(params: Omit<TimeLogParams, "index" | "range">): Promise<TimeLog[]>;
  };

  users: {
    list(params?: ListParams): Promise<PaginatedResponse<User>>;
    listAll(): Promise<User[]>;
    iterate(): AsyncGenerator<User>;
    get(userId: string): Promise<User>;
    listForProject(projectId: string, params?: ListParams): Promise<PaginatedResponse<User>>;
  };
}

export function createZohoProjectsClient(config: ZohoProjectsConfig): ZohoProjectsClient;
EOF

echo "Types copied successfully!"
echo ""
echo "  To: $OUTPUT_FILE"
echo ""
echo "You can now reference types in your project:"
echo ""
echo "  import type { Project, Task, TimeLog, User } from '@/types/zoho-projects-api';"
echo ""
echo "Or use the actual package:"
echo ""
echo "  import { createZohoProjectsClient } from '@panoptic-it-solutions/zoho-projects-client';"
echo "  import type { Project, Task } from '@panoptic-it-solutions/zoho-projects-client';"
echo ""
