/**
 * Zoho Projects Client Type Definitions
 *
 * This file provides type definitions for AI agent visibility.
 * For full types, import directly from '@panoptic-it-solutions/zoho-projects-client'
 */

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export interface ZohoProjectsClientConfig {
  /** OAuth 2.0 Client ID */
  clientId: string;
  /** OAuth 2.0 Client Secret */
  clientSecret: string;
  /** OAuth 2.0 Refresh Token */
  refreshToken: string;
  /** Zoho Projects Portal ID */
  portalId: string;
  /** Data center extension (default: 'com') */
  dataCenterExtension?: 'com' | 'eu' | 'in' | 'com.au' | 'jp';
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMON TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ZohoPageInfo {
  has_next_page?: boolean;
  total_count?: number;
  index?: number;
  range?: number;
}

export interface OwnerRef {
  id: string;
  name: string;
  email?: string;
  zpuid?: string;
}

export interface LinkRef {
  self?: { url: string };
  web?: { url: string };
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT
// ─────────────────────────────────────────────────────────────────────────────

export interface Project {
  id: number;
  id_string: string;
  name: string;
  description?: string | null;
  status: string;
  start_date?: string;
  end_date?: string;
  owner_id?: string;
  owner_name?: string;
  created_date?: string;
  created_date_long?: number;
  link?: LinkRef;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  owner?: string;
  template_id?: string;
  group_id?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  owner?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK
// ─────────────────────────────────────────────────────────────────────────────

export interface Task {
  id: number;
  id_string: string;
  name: string;
  description?: string | null;
  status: string;
  priority?: string;
  start_date?: string;
  end_date?: string;
  percent_complete?: number;
  duration?: string;
  tasklist?: { id: number; name: string };
  owners?: OwnerRef[];
  created_time?: string;
  created_time_long?: number;
  last_modified_time?: string;
  link?: LinkRef;
}

export interface CreateTaskInput {
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  priority?: 'none' | 'low' | 'medium' | 'high';
  status?: string;
  tasklist_id?: string;
  owners?: string[];
  percent_complete?: number;
}

export interface UpdateTaskInput {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  priority?: 'none' | 'low' | 'medium' | 'high';
  status?: string;
  tasklist_id?: string;
  owners?: string[];
  percent_complete?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK LIST
// ─────────────────────────────────────────────────────────────────────────────

export interface TaskList {
  id: number;
  id_string: string;
  name: string;
  flag?: string;
  completed?: boolean;
  sequence?: number;
  milestone?: { id: number; name: string };
  link?: LinkRef;
}

export interface CreateTaskListInput {
  name: string;
  flag?: string;
  milestone_id?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ISSUE / BUG
// ─────────────────────────────────────────────────────────────────────────────

export interface Issue {
  id: number;
  id_string: string;
  title: string;
  description?: string | null;
  status: string;
  severity?: string;
  reproducible?: string;
  module?: string;
  reported_person?: string;
  assignee?: OwnerRef;
  created_time?: string;
  link?: LinkRef;
}

export interface CreateIssueInput {
  title: string;
  description?: string;
  severity?: 'critical' | 'major' | 'minor' | 'trivial';
  reproducible?: 'Always' | 'Sometimes' | 'Rarely' | 'Unable';
  module?: string;
  assignee?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// TIME LOG
// ─────────────────────────────────────────────────────────────────────────────

export interface TimeLog {
  id: number;
  id_string: string;
  task_id?: string;
  task_name?: string;
  date: string;
  hours: number;
  minutes?: number;
  bill_status?: string;
  notes?: string;
  owner?: OwnerRef;
  created_time?: string;
  link?: LinkRef;
}

export interface CreateTimeLogInput {
  task_id: string;
  date: string;
  hours: number;
  minutes?: number;
  bill_status?: 'Billable' | 'Non Billable';
  notes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// USER
// ─────────────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  zpuid?: string;
  name: string;
  email: string;
  role?: string;
  profile?: string;
  status?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMENT
// ─────────────────────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  content: string;
  author?: OwnerRef;
  created_time?: string;
  created_time_long?: number;
}

export interface CreateCommentInput {
  content: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ERRORS
// ─────────────────────────────────────────────────────────────────────────────

export class ZohoProjectsError extends Error {
  code?: string;
  status?: number;
}

export class ZohoAuthError extends ZohoProjectsError {}

export class ZohoRateLimitError extends ZohoProjectsError {
  retryAfter: number;
}

export class ZohoNotFoundError extends ZohoProjectsError {}

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

export interface ZohoProjectsClient {
  // Portal-level APIs
  projects: ProjectsAPI;
  users: UsersAPI;
  tags: TagsAPI;
  roles: RolesAPI;
  profiles: ProfilesAPI;
  clients: ClientsAPI;
  contacts: ContactsAPI;
  groups: GroupsAPI;
  leaves: LeavesAPI;
  teams: TeamsAPI;
  dashboards: DashboardsAPI;
  reports: ReportsAPI;
  search: SearchAPI;
  trash: TrashAPI;

  // Project-scoped APIs
  tasks: TasksAPI;
  tasklists: TaskListsAPI;
  phases: PhasesAPI;
  issues: IssuesAPI;
  forums: ForumsAPI;
  events: EventsAPI;
  timelogs: TimeLogsAPI;
  attachments: AttachmentsAPI;
  documents: DocumentsAPI;

  // Polymorphic APIs
  comments: CommentsAPIFactory;
  followers: FollowersAPIFactory;
}

// API interface examples (simplified)
interface ProjectsAPI {
  list(params?: object): Promise<{ projects: Project[]; page_info?: ZohoPageInfo }>;
  listAll(params?: object): Promise<Project[]>;
  iterate(params?: object): AsyncIterableIterator<Project>;
  get(projectId: string): Promise<{ projects: Project[] }>;
  create(input: CreateProjectInput): Promise<{ projects: Project[] }>;
  update(projectId: string, input: UpdateProjectInput): Promise<{ projects: Project[] }>;
  delete(projectId: string): Promise<void>;
}

interface TasksAPI {
  list(projectId: string, params?: object): Promise<{ tasks: Task[]; page_info?: ZohoPageInfo }>;
  listAll(projectId: string, params?: object): Promise<Task[]>;
  iterate(projectId: string, params?: object): AsyncIterableIterator<Task>;
  get(projectId: string, taskId: string): Promise<{ tasks: Task[] }>;
  create(projectId: string, input: CreateTaskInput): Promise<{ tasks: Task[] }>;
  update(projectId: string, taskId: string, input: UpdateTaskInput): Promise<{ tasks: Task[] }>;
  delete(projectId: string, taskId: string): Promise<void>;
}

// Factory interfaces for polymorphic APIs
interface CommentsAPIFactory {
  forTask(projectId: string, taskId: string): CommentsAPI;
  forIssue(projectId: string, issueId: string): CommentsAPI;
}

interface CommentsAPI {
  list(): Promise<{ comments: Comment[] }>;
  create(input: CreateCommentInput): Promise<{ comments: Comment[] }>;
  delete(commentId: string): Promise<void>;
}

interface FollowersAPIFactory {
  forTask(projectId: string, taskId: string): FollowersAPI;
}

interface FollowersAPI {
  list(): Promise<{ followers: OwnerRef[] }>;
  add(input: { users: string[] }): Promise<void>;
  remove(userId: string): Promise<void>;
}

// Placeholder interfaces for other APIs
interface UsersAPI { list: Function; listAll: Function; iterate: Function; get: Function; }
interface TagsAPI { list: Function; listAll: Function; iterate: Function; get: Function; create: Function; update: Function; delete: Function; }
interface RolesAPI { list: Function; listAll: Function; iterate: Function; get: Function; create: Function; update: Function; delete: Function; }
interface ProfilesAPI { list: Function; listAll: Function; iterate: Function; get: Function; create: Function; update: Function; delete: Function; }
interface ClientsAPI { list: Function; listAll: Function; iterate: Function; get: Function; create: Function; update: Function; delete: Function; }
interface ContactsAPI { list: Function; listAll: Function; iterate: Function; get: Function; create: Function; update: Function; delete: Function; }
interface GroupsAPI { list: Function; listAll: Function; iterate: Function; get: Function; create: Function; update: Function; delete: Function; }
interface LeavesAPI { list: Function; listAll: Function; iterate: Function; get: Function; create: Function; update: Function; delete: Function; }
interface TeamsAPI { list: Function; listAll: Function; iterate: Function; get: Function; create: Function; update: Function; delete: Function; }
interface DashboardsAPI { list: Function; listAll: Function; iterate: Function; get: Function; create: Function; update: Function; delete: Function; listWidgets: Function; createWidget: Function; }
interface ReportsAPI { list: Function; listAll: Function; iterate: Function; get: Function; execute: Function; }
interface SearchAPI { search: Function; }
interface TrashAPI { list: Function; listAll: Function; iterate: Function; restore: Function; deletePermanently: Function; }
interface TaskListsAPI { list: Function; listAll: Function; iterate: Function; get: Function; create: Function; update: Function; delete: Function; }
interface PhasesAPI { list: Function; listAll: Function; iterate: Function; get: Function; create: Function; update: Function; delete: Function; }
interface IssuesAPI { list: Function; listAll: Function; iterate: Function; get: Function; create: Function; update: Function; delete: Function; }
interface ForumsAPI { list: Function; listAll: Function; iterate: Function; get: Function; create: Function; update: Function; delete: Function; }
interface EventsAPI { list: Function; listAll: Function; iterate: Function; get: Function; create: Function; update: Function; delete: Function; }
interface TimeLogsAPI { list: Function; listAll: Function; iterate: Function; get: Function; create: Function; update: Function; delete: Function; }
interface AttachmentsAPI { list: Function; upload: Function; download: Function; delete: Function; }
interface DocumentsAPI { list: Function; get: Function; create: Function; update: Function; delete: Function; listFolders: Function; createFolder: Function; }

/**
 * Create a Zoho Projects client instance
 */
export function createZohoProjectsClient(config: ZohoProjectsClientConfig): ZohoProjectsClient;
