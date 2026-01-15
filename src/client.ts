import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import type Bottleneck from "bottleneck";
import { z } from "zod";

import { TokenManager, type TokenManagerConfig } from "./auth/token-manager.js";
import {
  parseAxiosError,
  ZohoProjectsError,
  ZohoResponseValidationError,
} from "./errors.js";
import {
  ProjectSchema,
  ProjectListResponseSchema,
  TaskSchema,
  TaskListResponseSchema,
  TimeLogSchema,
  TimeLogListResponseSchema,
  UserSchema,
  UserListResponseSchema,
  TagSchema,
  TagListResponseSchema,
  RoleSchema,
  RoleListResponseSchema,
  ProfileSchema,
  ProfileListResponseSchema,
  ClientSchema,
  ClientListResponseSchema,
  ContactSchema,
  ContactListResponseSchema,
  ProjectGroupSchema,
  ProjectGroupListResponseSchema,
  LeaveSchema,
  LeaveListResponseSchema,
  TeamSchema,
  TeamListResponseSchema,
  TaskListSchema,
  TaskListListResponseSchema,
  PhaseSchema,
  PhaseListResponseSchema,
  IssueSchema,
  IssueListResponseSchema,
  ForumSchema,
  ForumListResponseSchema,
  EventSchema,
  EventListResponseSchema,
  AttachmentSchema,
  AttachmentListResponseSchema,
  DocumentSchema,
  DocumentListResponseSchema,
  DocumentFolderSchema,
  DocumentFolderListResponseSchema,
  CommentSchema,
  CommentListResponseSchema,
  FollowerSchema,
  FollowerListResponseSchema,
  DashboardSchema,
  DashboardListResponseSchema,
  WidgetSchema,
  WidgetListResponseSchema,
  ReportSchema,
  ReportListResponseSchema,
  ReportDataResponseSchema,
  SearchResultSchema,
  SearchResponseSchema,
  TrashItemSchema,
  TrashListResponseSchema,
  TrashRestoreResponseSchema,
  PortalSchema,
  PortalListResponseSchema,
  ModuleSchema,
  ModuleListResponseSchema,
  ModuleFieldSchema,
  ModuleFieldListResponseSchema,
  TimerSchema,
  TimerResponseSchema,
  TimerListResponseSchema,
  CustomViewSchema,
  CustomViewListResponseSchema,
  BlueprintSchema,
  BlueprintListResponseSchema,
  NextTransitionsResponseSchema,
  DuringActionsResponseSchema,
  type Project,
  type Task,
  type TimeLog,
  type User,
  type Tag,
  type Role,
  type Profile,
  type Client,
  type Contact,
  type ProjectGroup,
  type Leave,
  type Team,
  type TaskList,
  type Phase,
  type Issue,
  type Forum,
  type Event,
  type Attachment,
  type Document,
  type DocumentFolder,
  type Comment,
  type Follower,
  type Dashboard,
  type Widget,
  type Report,
  type ReportDataResponse,
  type SearchResult,
  type SearchResponse,
  type TrashItem,
  type TrashRestoreResponse,
  type Portal,
  type Module,
  type ModuleField,
  type Timer,
  type CustomView,
  type Blueprint,
  type BlueprintTransition,
  type NextTransitionsResponse,
  type DuringActionsResponse,
  type CommentableEntityType,
  type FollowableEntityType,
  type ListParams,
  type TimeLogParams,
  type CreateProjectInput,
  type UpdateProjectInput,
  type CreateTaskInput,
  type CreateSubtaskInput,
  type UpdateTaskInput,
  type CreateTaskTimeLogInput,
  type CreateBugTimeLogInput,
  type CreateGeneralTimeLogInput,
  type UpdateTimeLogInput,
  type InviteUserInput,
  type AddUserToProjectInput,
  type UpdateUserInput,
  type CreateTagInput,
  type UpdateTagInput,
  type TagEntityTypeValue,
  type CreateRoleInput,
  type UpdateRoleInput,
  type CreateProfileInput,
  type UpdateProfileInput,
  type CreateClientInput,
  type UpdateClientInput,
  type CreateContactInput,
  type UpdateContactInput,
  type CreateProjectGroupInput,
  type UpdateProjectGroupInput,
  type CreateLeaveInput,
  type UpdateLeaveInput,
  type CreateTeamInput,
  type UpdateTeamInput,
  type AddTeamMembersInput,
  type CreateTaskListInput,
  type UpdateTaskListInput,
  type CreatePhaseInput,
  type UpdatePhaseInput,
  type CreateIssueInput,
  type UpdateIssueInput,
  type CreateForumInput,
  type UpdateForumInput,
  type CreateEventInput,
  type UpdateEventInput,
  type UploadAttachmentInput,
  type ListAttachmentsParams,
  type AssociateAttachmentInput,
  type AddAttachmentsToEntityInput,
  WorkDriveFileSchema,
  WorkDriveUploadResponseSchema,
  type WorkDriveFile,
  type WorkDriveUploadInput,
  type UploadDocumentInput,
  type UpdateDocumentInput,
  type CreateDocumentFolderInput,
  type UpdateDocumentFolderInput,
  type CreateCommentInput,
  type UpdateCommentInput,
  type AddFollowersInput,
  type CreateDashboardInput,
  type UpdateDashboardInput,
  type CreateWidgetInput,
  type UpdateWidgetInput,
  type ReportQueryInput,
  type SearchQueryInput,
  type TrashFilterInput,
  type TrashableEntityType,
  type ModuleFilterInput,
  type StartTimerInput,
  type StopTimerInput,
  type PauseResumeTimerInput,
  type CreateCustomViewInput,
  type UpdateCustomViewInput,
  type CustomViewEntityType,
  type ExecuteTransitionInput,
  type BlueprintModuleType,
  type ZohoPageInfo,
} from "./types/index.js";
import { createRateLimiter, type RateLimiterConfig } from "./utils/rate-limiter.js";
import {
  autoPaginate,
  collectAll,
  DEFAULT_PAGE_SIZE,
  type AutoPaginateOptions,
  type PaginatedResponse,
} from "./utils/pagination.js";

/**
 * Configuration for creating a Zoho Projects client
 */
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
  redis?: RateLimiterConfig["redis"];
  /** Optional: provide an existing access token to skip initial refresh */
  accessToken?: string;
  /** Optional: expiry timestamp in ms since epoch for the provided access token */
  accessTokenExpiresAt?: number;
}

/**
 * Default API URL (US region)
 */
const DEFAULT_API_URL = "https://projectsapi.zoho.com";

/**
 * Default accounts URL (US region)
 */
const DEFAULT_ACCOUNTS_URL = "https://accounts.zoho.com";

/**
 * Create a Zoho Projects API client
 *
 * @example
 * ```ts
 * const client = createZohoProjectsClient({
 *   clientId: process.env.ZOHO_CLIENT_ID!,
 *   clientSecret: process.env.ZOHO_CLIENT_SECRET!,
 *   portalId: process.env.ZOHO_PORTAL_ID!,
 * });
 *
 * // List all projects
 * const projects = await client.projects.list();
 *
 * // Get all projects with auto-pagination
 * const allProjects = await client.projects.listAll();
 *
 * // Stream projects with async iteration
 * for await (const project of client.projects.iterate()) {
 *   console.log(project.name);
 * }
 * ```
 */
export function createZohoProjectsClient(config: ZohoProjectsConfig) {
  const {
    clientId,
    clientSecret,
    refreshToken,
    portalId,
    apiUrl = DEFAULT_API_URL,
    accountsUrl = DEFAULT_ACCOUNTS_URL,
    timeout = 30000,
    redis,
    accessToken,
    accessTokenExpiresAt,
  } = config;

  // Initialize token manager
  const tokenManagerConfig: TokenManagerConfig = {
    clientId,
    clientSecret,
    refreshToken,
    accountsUrl,
    accessToken,
    accessTokenExpiresAt,
  };
  const tokenManager = new TokenManager(tokenManagerConfig);

  // Initialize rate limiter
  const rateLimiter = createRateLimiter({ redis });

  // Initialize HTTP client
  const httpClient = axios.create({
    baseURL: apiUrl,
    timeout,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add auth interceptor
  httpClient.interceptors.request.use(async (config) => {
    const token = await tokenManager.getValidToken();
    config.headers.Authorization = `Zoho-oauthtoken ${token}`;
    return config;
  });

  // Add error handling interceptor
  httpClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isAxiosError(error)) {
        // Invalidate token on 401
        if (error.response?.status === 401) {
          tokenManager.invalidate();
        }
        throw parseAxiosError(error);
      }
      throw error;
    }
  );

  /**
   * Make a rate-limited API request
   */
  async function request<T>(
    path: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return rateLimiter.schedule(async () => {
      const response = await httpClient.request<T>({
        url: path,
        ...config,
      });
      return response.data;
    });
  }

  /**
   * Make a request and validate response with Zod schema
   */
  async function requestWithValidation<T>(
    path: string,
    schema: z.ZodType<T>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const data = await request<unknown>(path, config);
    const result = schema.safeParse(data);

    if (!result.success) {
      throw new ZohoResponseValidationError(
        `Invalid API response structure: ${result.error.message}`,
        result.error.errors,
        data
      );
    }

    return result.data;
  }

  // Base path for portal-specific endpoints (V3 API)
  const basePath = `/api/v3/portal/${portalId}`;

  return {
    /**
     * Projects API
     */
    projects: {
      /**
       * List projects with pagination
       */
      async list(
        params?: ListParams
      ): Promise<PaginatedResponse<Project>> {
        const response = await requestWithValidation(
          `${basePath}/projects`,
          ProjectListResponseSchema,
          {
            params: {
              page: params?.page ?? params?.index ?? 1,
              per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
              sort_column: params?.sort_column,
              sort_order: params?.sort_order,
            },
          }
        );
        // V3 API returns array directly, legacy API wraps in { projects: [...] }
        const projects = Array.isArray(response) ? response : response.projects;
        const pageInfo = Array.isArray(response) ? undefined : response.page_info;
        return {
          data: projects,
          pageInfo,
        };
      },

      /**
       * Get all projects with auto-pagination
       */
      async listAll(options?: AutoPaginateOptions): Promise<Project[]> {
        return collectAll(this.iterate(options));
      },

      /**
       * Iterate over all projects with auto-pagination
       */
      iterate(
        options?: AutoPaginateOptions
      ): AsyncGenerator<Project, void, unknown> {
        return autoPaginate(
          (page, per_page) => this.list({ page, per_page }),
          options
        );
      },

      /**
       * Get a single project by ID
       */
      async get(projectId: string): Promise<Project> {
        // V3 API returns project directly, legacy wraps in {projects: [...]}
        const schema = z.union([
          ProjectSchema, // V3: returns project directly
          z.object({ projects: z.array(ProjectSchema) }), // Legacy
        ]);
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}`,
          schema
        );
        // Handle both formats
        if (response && typeof response === "object" && "projects" in response) {
          const legacyResponse = response as { projects: Project[] };
          if (legacyResponse.projects.length === 0) {
            throw new ZohoProjectsError(`Project not found: ${projectId}`, 404);
          }
          return legacyResponse.projects[0];
        }
        return response as Project;
      },

      /**
       * Create a new project
       */
      async create(data: CreateProjectInput): Promise<Project> {
        // V3 API returns project directly, legacy wraps in {projects: [...]}
        const schema = z.union([
          ProjectSchema, // V3: returns project directly
          z.object({ projects: z.array(ProjectSchema) }), // Legacy
        ]);
        const response = await requestWithValidation(
          `${basePath}/projects`,
          schema,
          { method: "POST", data }
        );
        // Handle both formats
        if (response && typeof response === "object" && "projects" in response) {
          return (response as { projects: Project[] }).projects[0];
        }
        return response as Project;
      },

      /**
       * Update an existing project
       */
      async update(
        projectId: string,
        data: UpdateProjectInput
      ): Promise<Project> {
        // V3 API returns project directly, legacy wraps in {projects: [...]}
        const schema = z.union([
          ProjectSchema, // V3: returns project directly
          z.object({ projects: z.array(ProjectSchema) }), // Legacy
        ]);
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}`,
          schema,
          { method: "PUT", data }
        );
        // Handle both formats
        if (response && typeof response === "object" && "projects" in response) {
          return (response as { projects: Project[] }).projects[0];
        }
        return response as Project;
      },

      /**
       * Delete a project (moves to trash)
       * V3 API uses POST /projects/{projectId}/trash
       */
      async delete(projectId: string): Promise<void> {
        await request(`${basePath}/projects/${projectId}/trash`, {
          method: "POST",
        });
      },
    },

    /**
     * Tasks API
     */
    tasks: {
      /**
       * List tasks for a project with pagination
       */
      async list(
        projectId: string,
        params?: ListParams
      ): Promise<PaginatedResponse<Task>> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/tasks`,
          TaskListResponseSchema,
          {
            params: {
              page: params?.page ?? params?.index ?? 1,
              per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
              sort_column: params?.sort_column,
              sort_order: params?.sort_order,
            },
          }
        );
        return {
          data: response.tasks,
          pageInfo: response.page_info,
        };
      },

      /**
       * Get all tasks for a project with auto-pagination
       */
      async listAll(
        projectId: string,
        options?: AutoPaginateOptions
      ): Promise<Task[]> {
        return collectAll(this.iterate(projectId, options));
      },

      /**
       * Iterate over all tasks for a project with auto-pagination
       */
      iterate(
        projectId: string,
        options?: AutoPaginateOptions
      ): AsyncGenerator<Task, void, unknown> {
        return autoPaginate(
          (page, per_page) => this.list(projectId, { page, per_page }),
          options
        );
      },

      /**
       * Get a single task by ID
       */
      async get(projectId: string, taskId: string): Promise<Task> {
        // V3 API returns task directly, legacy wraps in {tasks: [...]}
        const schema = z.union([
          TaskSchema, // V3: returns task directly
          z.object({ tasks: z.array(TaskSchema) }), // Legacy
        ]);
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/tasks/${taskId}`,
          schema
        );
        // Handle both formats
        if (response && typeof response === "object" && "tasks" in response) {
          const legacyResponse = response as { tasks: Task[] };
          if (legacyResponse.tasks.length === 0) {
            throw new ZohoProjectsError(`Task not found: ${taskId}`, 404);
          }
          return legacyResponse.tasks[0];
        }
        return response as Task;
      },

      /**
       * List all tasks across all projects
       * Note: This fetches all projects first, then tasks for each
       */
      async listAllAcrossProjects(
        options?: AutoPaginateOptions
      ): Promise<Task[]> {
        const projects = await this._getProjectsRef().listAll();
        const allTasks: Task[] = [];

        for (const project of projects) {
          // V3 API uses 'id' as string directly, legacy uses 'id_string'
          const tasks = await this.listAll(String(project.id), options);
          allTasks.push(...tasks);
        }

        return allTasks;
      },

      /**
       * Create a new task in a project
       * Note: V3 API requires a tasklist to be specified
       */
      async create(projectId: string, data: CreateTaskInput): Promise<Task> {
        // V3 API returns task directly, legacy wraps in {tasks: [...]}
        const schema = z.union([
          TaskSchema, // V3: returns task directly
          z.object({ tasks: z.array(TaskSchema) }), // Legacy
        ]);
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/tasks`,
          schema,
          { method: "POST", data }
        );
        // Handle both formats
        if (response && typeof response === "object" && "tasks" in response) {
          return (response as { tasks: Task[] }).tasks[0];
        }
        return response as Task;
      },

      /**
       * Update an existing task
       * Note: V3 API uses PATCH method for updates
       */
      async update(
        projectId: string,
        taskId: string,
        data: UpdateTaskInput
      ): Promise<Task> {
        // V3 API returns task directly, legacy wraps in {tasks: [...]}
        const schema = z.union([
          TaskSchema, // V3: returns task directly
          z.object({ tasks: z.array(TaskSchema) }), // Legacy
        ]);
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/tasks/${taskId}`,
          schema,
          { method: "PATCH", data }
        );
        // Handle both formats
        if (response && typeof response === "object" && "tasks" in response) {
          return (response as { tasks: Task[] }).tasks[0];
        }
        return response as Task;
      },

      /**
       * Delete a task (moves to trash)
       */
      async delete(projectId: string, taskId: string): Promise<void> {
        await request(`${basePath}/projects/${projectId}/tasks/${taskId}`, {
          method: "DELETE",
        });
      },

      /**
       * List subtasks of a parent task
       * Fetches project tasks and filters by parent_task_id
       */
      async listSubtasks(
        projectId: string,
        parentTaskId: string,
        params?: ListParams
      ): Promise<PaginatedResponse<Task>> {
        // Fetch tasks from the project
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/tasks`,
          TaskListResponseSchema,
          {
            params: {
              page: params?.page ?? params?.index ?? 1,
              per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
            },
          }
        );
        // Filter tasks by parent_task_id client-side
        // V3 returns parent_task_id or parental_info.parent_task_id
        const subtasks = response.tasks.filter(task => {
          const taskParentId = task.parent_task_id ||
            (task as unknown as { parental_info?: { parent_task_id?: string } }).parental_info?.parent_task_id;
          return String(taskParentId) === String(parentTaskId);
        });
        return {
          data: subtasks,
          pageInfo: response.page_info,
        };
      },

      /**
       * Create a subtask under a parent task
       * Uses V3 API with parental_info.parent_task_id
       * The subtask inherits the tasklist from the parent task
       */
      async createSubtask(
        projectId: string,
        parentTaskId: string,
        data: CreateSubtaskInput
      ): Promise<Task> {
        // V3 API: use regular task endpoint with parental_info
        const requestData: Record<string, unknown> = {
          name: data.name,
          parental_info: { parent_task_id: parentTaskId },
        };

        // Add optional fields
        if (data.description) requestData.description = data.description;
        if (data.start_date) requestData.start_date = data.start_date;
        if (data.end_date) requestData.end_date = data.end_date;
        if (data.duration !== undefined) {
          requestData.duration = { value: String(data.duration), type: data.duration_type || "days" };
        }
        if (data.priority) requestData.priority = data.priority;
        if (data.percent_complete !== undefined) requestData.completion_percentage = data.percent_complete;
        if (data.persons) {
          // V3 expects owners_and_work structure
          requestData.owners_and_work = {
            owners: data.persons.split(",").map(zpuid => ({ zpuid: zpuid.trim() })),
          };
        }
        if (data.work) requestData.work = data.work;
        if (data.work_type) requestData.work_type = data.work_type;
        if (data.billingtype) requestData.billing_type = data.billingtype;
        if (data.custom_fields) requestData.custom_fields = data.custom_fields;

        // V3 API returns task directly
        const schema = z.union([
          TaskSchema,
          z.object({ tasks: z.array(TaskSchema) }),
        ]);
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/tasks`,
          schema,
          { method: "POST", data: requestData }
        );

        // Handle both formats
        if (response && typeof response === "object" && "tasks" in response) {
          return (response as { tasks: Task[] }).tasks[0];
        }
        return response as Task;
      },

      // Internal reference to projects API
      _getProjectsRef: () => client.projects,
    },

    /**
     * Time Logs API
     */
    timelogs: {
      /**
       * List time logs for a project
       */
      async list(
        projectId: string,
        params: TimeLogParams
      ): Promise<PaginatedResponse<TimeLog>> {
        // Make the request - may return 204 No Content if no logs
        const rawResponse = await request<unknown>(
          `${basePath}/projects/${projectId}/logs`,
          {
            params: {
              page: params.page ?? 1,
              per_page: params.per_page ?? DEFAULT_PAGE_SIZE,
              users_list: params.users_list,
              view_type: params.view_type,
              date: params.date,
              bill_status: params.bill_status,
              component_type: params.component_type,
            },
          }
        );

        // Handle 204 No Content (empty string response)
        if (!rawResponse || rawResponse === "") {
          return { data: [], pageInfo: undefined };
        }

        // Validate response structure
        const result = TimeLogListResponseSchema.safeParse(rawResponse);
        if (!result.success) {
          throw new ZohoResponseValidationError(
            `Invalid API response structure: ${result.error.message}`,
            result.error.errors,
            rawResponse
          );
        }
        const response = result.data;

        // Flatten the nested date structure into a simple array
        const logs: TimeLog[] = [];
        if (response.timelogs?.date) {
          for (const dateGroup of response.timelogs.date) {
            if (dateGroup.tasklogs) logs.push(...dateGroup.tasklogs);
            if (dateGroup.buglogs) logs.push(...dateGroup.buglogs);
            if (dateGroup.generallogs) logs.push(...dateGroup.generallogs);
          }
        }
        // Also handle flat structure
        if (response.tasklogs) logs.push(...response.tasklogs);
        if (response.buglogs) logs.push(...response.buglogs);
        if (response.generallogs) logs.push(...response.generallogs);

        return {
          data: logs,
          pageInfo: response.page_info,
        };
      },

      /**
       * Get all time logs for a project with auto-pagination
       */
      async listAll(
        projectId: string,
        params: Omit<TimeLogParams, "page" | "per_page">,
        options?: AutoPaginateOptions
      ): Promise<TimeLog[]> {
        return collectAll(this.iterate(projectId, params, options));
      },

      /**
       * Iterate over all time logs for a project with auto-pagination
       */
      iterate(
        projectId: string,
        params: Omit<TimeLogParams, "page" | "per_page">,
        options?: AutoPaginateOptions
      ): AsyncGenerator<TimeLog, void, unknown> {
        return autoPaginate(
          (page, per_page) => this.list(projectId, { ...params, page, per_page }),
          options
        );
      },

      /**
       * List all time logs across all projects
       */
      async listAllAcrossProjects(
        params: Omit<TimeLogParams, "index" | "range">,
        options?: AutoPaginateOptions
      ): Promise<TimeLog[]> {
        const projects = await this._getProjectsRef().listAll();
        const allLogs: TimeLog[] = [];

        for (const project of projects) {
          // V3 API uses 'id' as string directly, legacy uses 'id_string'
          const logs = await this.listAll(String(project.id), params, options);
          allLogs.push(...logs);
        }

        return allLogs;
      },

      /**
       * Create a time log for a task
       */
      async createForTask(
        projectId: string,
        data: CreateTaskTimeLogInput
      ): Promise<TimeLog> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/logs`,
          z.object({ timelogs: z.object({ tasklogs: z.array(TimeLogSchema) }) }),
          { method: "POST", data }
        );
        return response.timelogs.tasklogs[0];
      },

      /**
       * Create a time log for a bug
       */
      async createForBug(
        projectId: string,
        data: CreateBugTimeLogInput
      ): Promise<TimeLog> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/logs`,
          z.object({ timelogs: z.object({ buglogs: z.array(TimeLogSchema) }) }),
          { method: "POST", data }
        );
        return response.timelogs.buglogs[0];
      },

      /**
       * Create a general time log (not tied to task or bug)
       */
      async createGeneral(
        projectId: string,
        data: CreateGeneralTimeLogInput
      ): Promise<TimeLog> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/logs`,
          z.object({ timelogs: z.object({ generallogs: z.array(TimeLogSchema) }) }),
          { method: "POST", data }
        );
        return response.timelogs.generallogs[0];
      },

      /**
       * Update a time log
       */
      async update(
        projectId: string,
        logId: string,
        data: UpdateTimeLogInput
      ): Promise<TimeLog> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/logs/${logId}`,
          z.object({ timelogs: z.object({ tasklogs: z.array(TimeLogSchema).optional(), buglogs: z.array(TimeLogSchema).optional(), generallogs: z.array(TimeLogSchema).optional() }) }),
          { method: "PUT", data }
        );
        // Return whichever type was updated
        const logs = response.timelogs.tasklogs || response.timelogs.buglogs || response.timelogs.generallogs || [];
        return logs[0];
      },

      /**
       * Delete a time log
       */
      async delete(projectId: string, logId: string): Promise<void> {
        await request(`${basePath}/projects/${projectId}/logs/${logId}`, {
          method: "DELETE",
        });
      },

      // Internal reference to projects API
      _getProjectsRef: () => client.projects,
    },

    /**
     * Users API
     */
    users: {
      /**
       * List all users in the portal
       */
      async list(params?: ListParams): Promise<PaginatedResponse<User>> {
        const response = await requestWithValidation(
          `${basePath}/users`,
          UserListResponseSchema,
          {
            params: {
              page: params?.page ?? params?.index ?? 1,
              per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
            },
          }
        );
        return {
          data: response.users,
          pageInfo: response.page_info,
        };
      },

      /**
       * Get all users with auto-pagination
       */
      async listAll(options?: AutoPaginateOptions): Promise<User[]> {
        return collectAll(this.iterate(options));
      },

      /**
       * Iterate over all users with auto-pagination
       */
      iterate(
        options?: AutoPaginateOptions
      ): AsyncGenerator<User, void, unknown> {
        return autoPaginate(
          (page, per_page) => this.list({ page, per_page }),
          options
        );
      },

      /**
       * Get a single user by ID
       */
      async get(userId: string): Promise<User> {
        const response = await requestWithValidation(
          `${basePath}/users/${userId}`,
          z.object({ users: z.array(UserSchema) })
        );
        if (response.users.length === 0) {
          throw new ZohoProjectsError(`User not found: ${userId}`, 404);
        }
        return response.users[0];
      },

      /**
       * List users for a specific project
       */
      async listForProject(
        projectId: string,
        params?: ListParams
      ): Promise<PaginatedResponse<User>> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/users`,
          UserListResponseSchema,
          {
            params: {
              page: params?.page ?? params?.index ?? 1,
              per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
            },
          }
        );
        return {
          data: response.users,
          pageInfo: response.page_info,
        };
      },

      /**
       * Invite a new user to the portal
       */
      async invite(data: InviteUserInput): Promise<User> {
        const response = await requestWithValidation(
          `${basePath}/users`,
          z.object({ users: z.array(UserSchema) }),
          { method: "POST", data }
        );
        return response.users[0];
      },

      /**
       * Add a user to a project
       */
      async addToProject(
        projectId: string,
        data: AddUserToProjectInput
      ): Promise<User> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/users`,
          z.object({ users: z.array(UserSchema) }),
          { method: "POST", data }
        );
        return response.users[0];
      },

      /**
       * Update a user's details
       */
      async update(userId: string, data: UpdateUserInput): Promise<User> {
        const response = await requestWithValidation(
          `${basePath}/users/${userId}`,
          z.object({ users: z.array(UserSchema) }),
          { method: "PUT", data }
        );
        return response.users[0];
      },

      /**
       * Remove a user from the portal
       */
      async delete(userId: string): Promise<void> {
        await request(`${basePath}/users/${userId}`, {
          method: "DELETE",
        });
      },

      /**
       * Remove a user from a project
       */
      async removeFromProject(
        projectId: string,
        userId: string
      ): Promise<void> {
        await request(`${basePath}/projects/${projectId}/users/${userId}`, {
          method: "DELETE",
        });
      },
    },

    /**
     * Tags API
     */
    tags: {
      async list(params?: ListParams): Promise<PaginatedResponse<Tag>> {
        const response = await requestWithValidation(
          `${basePath}/tags`,
          TagListResponseSchema,
          {
            params: {
              page: params?.page ?? params?.index ?? 1,
              per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
            },
          }
        );
        return { data: response.tags, pageInfo: response.page_info };
      },

      async listAll(options?: AutoPaginateOptions): Promise<Tag[]> {
        return collectAll(this.iterate(options));
      },

      iterate(options?: AutoPaginateOptions): AsyncGenerator<Tag, void, unknown> {
        return autoPaginate((page, per_page) => this.list({ page, per_page }), options);
      },

      async get(tagId: string): Promise<Tag> {
        const response = await requestWithValidation(
          `${basePath}/tags/${tagId}`,
          z.object({ tags: z.array(TagSchema) })
        );
        if (response.tags.length === 0) {
          throw new ZohoProjectsError(`Tag not found: ${tagId}`, 404);
        }
        return response.tags[0];
      },

      async create(data: CreateTagInput): Promise<Tag> {
        // Zoho V3 API requires FormData for tag creation
        const tagData = {
          name: data.name,
          color_class: data.color_class || "bg-tag1", // Default teal color
        };
        const formData = new FormData();
        formData.append("tags", JSON.stringify([tagData]));

        const response = await requestWithValidation(
          `${basePath}/tags`,
          z.object({ tags: z.array(TagSchema) }),
          {
            method: "POST",
            data: formData,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        return response.tags[0];
      },

      async update(tagId: string, data: UpdateTagInput): Promise<Tag> {
        // V3 API returns { tags: {...} } (object) for PATCH, not array
        const schema = z.object({
          tags: z.union([z.array(TagSchema), TagSchema]),
        });
        const response = await requestWithValidation(
          `${basePath}/tags/${tagId}`,
          schema,
          { method: "PATCH", data }
        );
        return Array.isArray(response.tags) ? response.tags[0] : response.tags;
      },

      async delete(tagId: string): Promise<void> {
        await request(`${basePath}/tags/${tagId}`, { method: "DELETE" });
      },

      /**
       * Associate a tag with an entity in a project
       * @param projectId - The project ID
       * @param tagId - The tag ID to associate
       * @param entityId - The entity ID (task ID, bug ID, etc.)
       * @param entityType - The entity type (use TagEntityType enum)
       */
      async associate(
        projectId: string,
        tagId: string,
        entityId: string,
        entityType: TagEntityTypeValue
      ): Promise<void> {
        await request(`${basePath}/projects/${projectId}/tags/associate`, {
          method: "POST",
          params: {
            tag_id: tagId,
            entity_id: entityId,
            entityType,
          },
        });
      },

      /**
       * Dissociate a tag from an entity in a project
       * @param projectId - The project ID
       * @param tagId - The tag ID to dissociate
       * @param entityId - The entity ID (task ID, bug ID, etc.)
       * @param entityType - The entity type (use TagEntityType enum)
       */
      async dissociate(
        projectId: string,
        tagId: string,
        entityId: string,
        entityType: TagEntityTypeValue
      ): Promise<void> {
        await request(`${basePath}/projects/${projectId}/tags/dissociate`, {
          method: "POST",
          params: {
            tag_id: tagId,
            entity_id: entityId,
            entityType,
          },
        });
      },
    },

    /**
     * Roles API
     */
    roles: {
      async list(params?: ListParams): Promise<PaginatedResponse<Role>> {
        const response = await requestWithValidation(
          `${basePath}/roles`,
          RoleListResponseSchema,
          {
            params: {
              page: params?.page ?? params?.index ?? 1,
              per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
            },
          }
        );
        return { data: response.roles, pageInfo: response.page_info };
      },

      async listAll(options?: AutoPaginateOptions): Promise<Role[]> {
        return collectAll(this.iterate(options));
      },

      iterate(options?: AutoPaginateOptions): AsyncGenerator<Role, void, unknown> {
        return autoPaginate((page, per_page) => this.list({ page, per_page }), options);
      },

      async get(roleId: string): Promise<Role> {
        const response = await requestWithValidation(
          `${basePath}/roles/${roleId}`,
          z.object({ roles: z.array(RoleSchema) })
        );
        if (response.roles.length === 0) {
          throw new ZohoProjectsError(`Role not found: ${roleId}`, 404);
        }
        return response.roles[0];
      },

      async create(data: CreateRoleInput): Promise<Role> {
        const response = await requestWithValidation(
          `${basePath}/roles`,
          z.object({ roles: z.array(RoleSchema) }),
          { method: "POST", data }
        );
        return response.roles[0];
      },

      async update(roleId: string, data: UpdateRoleInput): Promise<Role> {
        const response = await requestWithValidation(
          `${basePath}/roles/${roleId}`,
          z.object({ roles: z.array(RoleSchema) }),
          { method: "PUT", data }
        );
        return response.roles[0];
      },

      async delete(roleId: string): Promise<void> {
        await request(`${basePath}/roles/${roleId}`, { method: "DELETE" });
      },
    },

    /**
     * Profiles API
     */
    profiles: {
      async list(params?: ListParams): Promise<PaginatedResponse<Profile>> {
        const response = await requestWithValidation(
          `${basePath}/profiles`,
          ProfileListResponseSchema,
          {
            params: {
              page: params?.page ?? params?.index ?? 1,
              per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
            },
          }
        );
        return { data: response.profiles, pageInfo: response.page_info };
      },

      async listAll(options?: AutoPaginateOptions): Promise<Profile[]> {
        return collectAll(this.iterate(options));
      },

      iterate(options?: AutoPaginateOptions): AsyncGenerator<Profile, void, unknown> {
        return autoPaginate((page, per_page) => this.list({ page, per_page }), options);
      },

      async get(profileId: string): Promise<Profile> {
        const response = await requestWithValidation(
          `${basePath}/profiles/${profileId}`,
          z.object({ profiles: z.array(ProfileSchema) })
        );
        if (response.profiles.length === 0) {
          throw new ZohoProjectsError(`Profile not found: ${profileId}`, 404);
        }
        return response.profiles[0];
      },

      async create(data: CreateProfileInput): Promise<Profile> {
        const response = await requestWithValidation(
          `${basePath}/profiles`,
          z.object({ profiles: z.array(ProfileSchema) }),
          { method: "POST", data }
        );
        return response.profiles[0];
      },

      async update(profileId: string, data: UpdateProfileInput): Promise<Profile> {
        const response = await requestWithValidation(
          `${basePath}/profiles/${profileId}`,
          z.object({ profiles: z.array(ProfileSchema) }),
          { method: "PUT", data }
        );
        return response.profiles[0];
      },

      async delete(profileId: string): Promise<void> {
        await request(`${basePath}/profiles/${profileId}`, { method: "DELETE" });
      },
    },

    /**
     * Clients API
     */
    clients: {
      async list(params?: ListParams): Promise<PaginatedResponse<Client>> {
        const response = await requestWithValidation(
          `${basePath}/clients`,
          ClientListResponseSchema,
          {
            params: {
              page: params?.page ?? params?.index ?? 1,
              per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
            },
          }
        );
        return { data: response.clients, pageInfo: response.page_info };
      },

      async listAll(options?: AutoPaginateOptions): Promise<Client[]> {
        return collectAll(this.iterate(options));
      },

      iterate(options?: AutoPaginateOptions): AsyncGenerator<Client, void, unknown> {
        return autoPaginate((page, per_page) => this.list({ page, per_page }), options);
      },

      async get(clientId: string): Promise<Client> {
        const response = await requestWithValidation(
          `${basePath}/clients/${clientId}`,
          z.object({ clients: z.array(ClientSchema) })
        );
        if (response.clients.length === 0) {
          throw new ZohoProjectsError(`Client not found: ${clientId}`, 404);
        }
        return response.clients[0];
      },

      async create(data: CreateClientInput): Promise<Client> {
        const response = await requestWithValidation(
          `${basePath}/clients`,
          z.object({ clients: z.array(ClientSchema) }),
          { method: "POST", data }
        );
        return response.clients[0];
      },

      async update(clientId: string, data: UpdateClientInput): Promise<Client> {
        const response = await requestWithValidation(
          `${basePath}/clients/${clientId}`,
          z.object({ clients: z.array(ClientSchema) }),
          { method: "PUT", data }
        );
        return response.clients[0];
      },

      async delete(clientId: string): Promise<void> {
        await request(`${basePath}/clients/${clientId}`, { method: "DELETE" });
      },
    },

    /**
     * Contacts API
     */
    contacts: {
      async list(params?: ListParams): Promise<PaginatedResponse<Contact>> {
        const response = await requestWithValidation(
          `${basePath}/contacts`,
          ContactListResponseSchema,
          {
            params: {
              page: params?.page ?? params?.index ?? 1,
              per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
            },
          }
        );
        return { data: response.contacts, pageInfo: response.page_info };
      },

      async listAll(options?: AutoPaginateOptions): Promise<Contact[]> {
        return collectAll(this.iterate(options));
      },

      iterate(options?: AutoPaginateOptions): AsyncGenerator<Contact, void, unknown> {
        return autoPaginate((page, per_page) => this.list({ page, per_page }), options);
      },

      async get(contactId: string): Promise<Contact> {
        const response = await requestWithValidation(
          `${basePath}/contacts/${contactId}`,
          z.object({ contacts: z.array(ContactSchema) })
        );
        if (response.contacts.length === 0) {
          throw new ZohoProjectsError(`Contact not found: ${contactId}`, 404);
        }
        return response.contacts[0];
      },

      async create(data: CreateContactInput): Promise<Contact> {
        const response = await requestWithValidation(
          `${basePath}/contacts`,
          z.object({ contacts: z.array(ContactSchema) }),
          { method: "POST", data }
        );
        return response.contacts[0];
      },

      async update(contactId: string, data: UpdateContactInput): Promise<Contact> {
        const response = await requestWithValidation(
          `${basePath}/contacts/${contactId}`,
          z.object({ contacts: z.array(ContactSchema) }),
          { method: "PUT", data }
        );
        return response.contacts[0];
      },

      async delete(contactId: string): Promise<void> {
        await request(`${basePath}/contacts/${contactId}`, { method: "DELETE" });
      },
    },

    /**
     * Project Groups API
     */
    groups: {
      async list(params?: ListParams): Promise<PaginatedResponse<ProjectGroup>> {
        const response = await requestWithValidation(
          `${basePath}/groups`,
          ProjectGroupListResponseSchema,
          {
            params: {
              page: params?.page ?? params?.index ?? 1,
              per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
            },
          }
        );
        return { data: response.groups, pageInfo: response.page_info };
      },

      async listAll(options?: AutoPaginateOptions): Promise<ProjectGroup[]> {
        return collectAll(this.iterate(options));
      },

      iterate(options?: AutoPaginateOptions): AsyncGenerator<ProjectGroup, void, unknown> {
        return autoPaginate((page, per_page) => this.list({ page, per_page }), options);
      },

      async get(groupId: string): Promise<ProjectGroup> {
        const response = await requestWithValidation(
          `${basePath}/groups/${groupId}`,
          z.object({ groups: z.array(ProjectGroupSchema) })
        );
        if (response.groups.length === 0) {
          throw new ZohoProjectsError(`Project group not found: ${groupId}`, 404);
        }
        return response.groups[0];
      },

      async create(data: CreateProjectGroupInput): Promise<ProjectGroup> {
        const response = await requestWithValidation(
          `${basePath}/groups`,
          z.object({ groups: z.array(ProjectGroupSchema) }),
          { method: "POST", data }
        );
        return response.groups[0];
      },

      async update(groupId: string, data: UpdateProjectGroupInput): Promise<ProjectGroup> {
        const response = await requestWithValidation(
          `${basePath}/groups/${groupId}`,
          z.object({ groups: z.array(ProjectGroupSchema) }),
          { method: "PUT", data }
        );
        return response.groups[0];
      },

      async delete(groupId: string): Promise<void> {
        await request(`${basePath}/groups/${groupId}`, { method: "DELETE" });
      },
    },

    /**
     * Leaves API
     */
    leaves: {
      async list(params?: ListParams): Promise<PaginatedResponse<Leave>> {
        const response = await requestWithValidation(
          `${basePath}/leaves`,
          LeaveListResponseSchema,
          {
            params: {
              page: params?.page ?? params?.index ?? 1,
              per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
            },
          }
        );
        return { data: response.leaves, pageInfo: response.page_info };
      },

      async listAll(options?: AutoPaginateOptions): Promise<Leave[]> {
        return collectAll(this.iterate(options));
      },

      iterate(options?: AutoPaginateOptions): AsyncGenerator<Leave, void, unknown> {
        return autoPaginate((page, per_page) => this.list({ page, per_page }), options);
      },

      async get(leaveId: string): Promise<Leave> {
        const response = await requestWithValidation(
          `${basePath}/leaves/${leaveId}`,
          z.object({ leaves: z.array(LeaveSchema) })
        );
        if (response.leaves.length === 0) {
          throw new ZohoProjectsError(`Leave not found: ${leaveId}`, 404);
        }
        return response.leaves[0];
      },

      async create(data: CreateLeaveInput): Promise<Leave> {
        const response = await requestWithValidation(
          `${basePath}/leaves`,
          z.object({ leaves: z.array(LeaveSchema) }),
          { method: "POST", data }
        );
        return response.leaves[0];
      },

      async update(leaveId: string, data: UpdateLeaveInput): Promise<Leave> {
        const response = await requestWithValidation(
          `${basePath}/leaves/${leaveId}`,
          z.object({ leaves: z.array(LeaveSchema) }),
          { method: "PUT", data }
        );
        return response.leaves[0];
      },

      async delete(leaveId: string): Promise<void> {
        await request(`${basePath}/leaves/${leaveId}`, { method: "DELETE" });
      },
    },

    /**
     * Teams API
     */
    teams: {
      async list(params?: ListParams): Promise<PaginatedResponse<Team>> {
        const response = await requestWithValidation(
          `${basePath}/teams`,
          TeamListResponseSchema,
          {
            params: {
              page: params?.page ?? params?.index ?? 1,
              per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
            },
          }
        );
        return { data: response.teams, pageInfo: response.page_info };
      },

      async listAll(options?: AutoPaginateOptions): Promise<Team[]> {
        return collectAll(this.iterate(options));
      },

      iterate(options?: AutoPaginateOptions): AsyncGenerator<Team, void, unknown> {
        return autoPaginate((page, per_page) => this.list({ page, per_page }), options);
      },

      async get(teamId: string): Promise<Team> {
        const response = await requestWithValidation(
          `${basePath}/teams/${teamId}`,
          z.object({ teams: z.array(TeamSchema) })
        );
        if (response.teams.length === 0) {
          throw new ZohoProjectsError(`Team not found: ${teamId}`, 404);
        }
        return response.teams[0];
      },

      async create(data: CreateTeamInput): Promise<Team> {
        const response = await requestWithValidation(
          `${basePath}/teams`,
          z.object({ teams: z.array(TeamSchema) }),
          { method: "POST", data }
        );
        return response.teams[0];
      },

      async update(teamId: string, data: UpdateTeamInput): Promise<Team> {
        const response = await requestWithValidation(
          `${basePath}/teams/${teamId}`,
          z.object({ teams: z.array(TeamSchema) }),
          { method: "PUT", data }
        );
        return response.teams[0];
      },

      async delete(teamId: string): Promise<void> {
        await request(`${basePath}/teams/${teamId}`, { method: "DELETE" });
      },

      async addMembers(teamId: string, data: AddTeamMembersInput): Promise<Team> {
        const response = await requestWithValidation(
          `${basePath}/teams/${teamId}/members/`,
          z.object({ teams: z.array(TeamSchema) }),
          { method: "POST", data }
        );
        return response.teams[0];
      },

      async removeMember(teamId: string, userId: string): Promise<void> {
        await request(`${basePath}/teams/${teamId}/members/${userId}`, {
          method: "DELETE",
        });
      },
    },

    /**
     * Task Lists API (project-scoped)
     */
    tasklists: {
      async list(
        projectId: string,
        params?: ListParams
      ): Promise<PaginatedResponse<TaskList>> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/tasklists`,
          TaskListListResponseSchema,
          {
            params: {
              page: params?.page ?? params?.index ?? 1,
              per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
            },
          }
        );
        return { data: response.tasklists, pageInfo: response.page_info };
      },

      async listAll(
        projectId: string,
        options?: AutoPaginateOptions
      ): Promise<TaskList[]> {
        return collectAll(this.iterate(projectId, options));
      },

      iterate(
        projectId: string,
        options?: AutoPaginateOptions
      ): AsyncGenerator<TaskList, void, unknown> {
        return autoPaginate(
          (page, per_page) => this.list(projectId, { page, per_page }),
          options
        );
      },

      async get(projectId: string, tasklistId: string): Promise<TaskList> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/tasklists/${tasklistId}`,
          z.object({ tasklists: z.array(TaskListSchema) })
        );
        if (response.tasklists.length === 0) {
          throw new ZohoProjectsError(`Task list not found: ${tasklistId}`, 404);
        }
        return response.tasklists[0];
      },

      async create(
        projectId: string,
        data: CreateTaskListInput
      ): Promise<TaskList> {
        // V3 API returns the tasklist directly, not wrapped in array
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/tasklists`,
          TaskListSchema,
          { method: "POST", data }
        );
        return response;
      },

      async update(
        projectId: string,
        tasklistId: string,
        data: UpdateTaskListInput
      ): Promise<TaskList> {
        // V3 API returns the tasklist directly, not wrapped in array
        // V3 API uses PATCH method for updates
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/tasklists/${tasklistId}`,
          TaskListSchema,
          { method: "PATCH", data }
        );
        return response;
      },

      async delete(projectId: string, tasklistId: string): Promise<void> {
        await request(
          `${basePath}/projects/${projectId}/tasklists/${tasklistId}`,
          { method: "DELETE" }
        );
      },
    },

    /**
     * Phases (Milestones) API (project-scoped)
     * Note: Zoho calls these "milestones" in the API
     */
    phases: {
      async list(
        projectId: string,
        params?: ListParams
      ): Promise<PaginatedResponse<Phase>> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/milestones`,
          PhaseListResponseSchema,
          {
            params: {
              page: params?.page ?? params?.index ?? 1,
              per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
            },
          }
        );
        // V3 API returns page_info as array, normalize to object
        let pageInfo: ZohoPageInfo | undefined;
        if (response.page_info) {
          if (Array.isArray(response.page_info)) {
            const info = response.page_info[0];
            if (info) {
              pageInfo = {
                page: info.page,
                per_page: info.per_page,
                has_more_page: info.has_next_page,
              };
            }
          } else {
            pageInfo = response.page_info;
          }
        }
        return { data: response.milestones, pageInfo };
      },

      async listAll(
        projectId: string,
        options?: AutoPaginateOptions
      ): Promise<Phase[]> {
        return collectAll(this.iterate(projectId, options));
      },

      iterate(
        projectId: string,
        options?: AutoPaginateOptions
      ): AsyncGenerator<Phase, void, unknown> {
        return autoPaginate(
          (page, per_page) => this.list(projectId, { page, per_page }),
          options
        );
      },

      async get(projectId: string, phaseId: string): Promise<Phase> {
        // V3 API returns milestone directly, legacy wraps in {milestones: [...]}
        const schema = z.union([
          PhaseSchema, // V3: returns milestone directly
          z.object({ milestones: z.array(PhaseSchema) }), // Legacy
        ]);
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/milestones/${phaseId}`,
          schema
        );
        // Handle both formats
        if (response && typeof response === "object" && "milestones" in response) {
          const legacyResponse = response as { milestones: Phase[] };
          if (legacyResponse.milestones.length === 0) {
            throw new ZohoProjectsError(`Phase not found: ${phaseId}`, 404);
          }
          return legacyResponse.milestones[0];
        }
        return response as Phase;
      },

      async create(projectId: string, data: CreatePhaseInput): Promise<Phase> {
        // V3 API returns milestone directly, legacy wraps in {milestones: [...]}
        const schema = z.union([
          PhaseSchema, // V3: returns milestone directly
          z.object({ milestones: z.array(PhaseSchema) }), // Legacy
        ]);
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/milestones`,
          schema,
          { method: "POST", data }
        );
        // Handle both formats
        if (response && typeof response === "object" && "milestones" in response) {
          return (response as { milestones: Phase[] }).milestones[0];
        }
        return response as Phase;
      },

      async update(
        projectId: string,
        phaseId: string,
        data: UpdatePhaseInput
      ): Promise<Phase> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/milestones/${phaseId}`,
          z.object({ milestones: z.array(PhaseSchema) }),
          { method: "PUT", data }
        );
        return response.milestones[0];
      },

      async delete(projectId: string, phaseId: string): Promise<void> {
        await request(
          `${basePath}/projects/${projectId}/milestones/${phaseId}`,
          { method: "DELETE" }
        );
      },
    },

    /**
     * Issues (Bugs) API (project-scoped)
     * Note: Zoho calls these "bugs" in the API
     */
    issues: {
      async list(
        projectId: string,
        params?: ListParams
      ): Promise<PaginatedResponse<Issue>> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/bugs`,
          IssueListResponseSchema,
          {
            params: {
              page: params?.page ?? params?.index ?? 1,
              per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
            },
          }
        );
        return { data: response.bugs, pageInfo: response.page_info };
      },

      async listAll(
        projectId: string,
        options?: AutoPaginateOptions
      ): Promise<Issue[]> {
        return collectAll(this.iterate(projectId, options));
      },

      iterate(
        projectId: string,
        options?: AutoPaginateOptions
      ): AsyncGenerator<Issue, void, unknown> {
        return autoPaginate(
          (page, per_page) => this.list(projectId, { page, per_page }),
          options
        );
      },

      async get(projectId: string, issueId: string): Promise<Issue> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/bugs/${issueId}`,
          z.object({ bugs: z.array(IssueSchema) })
        );
        if (response.bugs.length === 0) {
          throw new ZohoProjectsError(`Issue not found: ${issueId}`, 404);
        }
        return response.bugs[0];
      },

      async create(projectId: string, data: CreateIssueInput): Promise<Issue> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/bugs`,
          z.object({ bugs: z.array(IssueSchema) }),
          { method: "POST", data }
        );
        return response.bugs[0];
      },

      async update(
        projectId: string,
        issueId: string,
        data: UpdateIssueInput
      ): Promise<Issue> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/bugs/${issueId}`,
          z.object({ bugs: z.array(IssueSchema) }),
          { method: "PUT", data }
        );
        return response.bugs[0];
      },

      async delete(projectId: string, issueId: string): Promise<void> {
        await request(`${basePath}/projects/${projectId}/bugs/${issueId}`, {
          method: "DELETE",
        });
      },
    },

    /**
     * Forums (Discussions) API (project-scoped)
     */
    forums: {
      async list(
        projectId: string,
        params?: ListParams
      ): Promise<PaginatedResponse<Forum>> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/forums`,
          ForumListResponseSchema,
          {
            params: {
              page: params?.page ?? params?.index ?? 1,
              per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
            },
          }
        );
        return { data: response.forums, pageInfo: response.page_info };
      },

      async listAll(
        projectId: string,
        options?: AutoPaginateOptions
      ): Promise<Forum[]> {
        return collectAll(this.iterate(projectId, options));
      },

      iterate(
        projectId: string,
        options?: AutoPaginateOptions
      ): AsyncGenerator<Forum, void, unknown> {
        return autoPaginate(
          (page, per_page) => this.list(projectId, { page, per_page }),
          options
        );
      },

      async get(projectId: string, forumId: string): Promise<Forum> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/forums/${forumId}`,
          z.object({ forums: z.array(ForumSchema) })
        );
        if (response.forums.length === 0) {
          throw new ZohoProjectsError(`Forum not found: ${forumId}`, 404);
        }
        return response.forums[0];
      },

      async create(projectId: string, data: CreateForumInput): Promise<Forum> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/forums`,
          z.object({ forums: z.array(ForumSchema) }),
          { method: "POST", data }
        );
        return response.forums[0];
      },

      async update(
        projectId: string,
        forumId: string,
        data: UpdateForumInput
      ): Promise<Forum> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/forums/${forumId}`,
          z.object({ forums: z.array(ForumSchema) }),
          { method: "PUT", data }
        );
        return response.forums[0];
      },

      async delete(projectId: string, forumId: string): Promise<void> {
        await request(`${basePath}/projects/${projectId}/forums/${forumId}`, {
          method: "DELETE",
        });
      },
    },

    /**
     * Events (Calendar) API (project-scoped)
     */
    events: {
      async list(
        projectId: string,
        params?: ListParams
      ): Promise<PaginatedResponse<Event>> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/events`,
          EventListResponseSchema,
          {
            params: {
              page: params?.page ?? params?.index ?? 1,
              per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
            },
          }
        );
        return { data: response.events, pageInfo: response.page_info };
      },

      async listAll(
        projectId: string,
        options?: AutoPaginateOptions
      ): Promise<Event[]> {
        return collectAll(this.iterate(projectId, options));
      },

      iterate(
        projectId: string,
        options?: AutoPaginateOptions
      ): AsyncGenerator<Event, void, unknown> {
        return autoPaginate(
          (page, per_page) => this.list(projectId, { page, per_page }),
          options
        );
      },

      async get(projectId: string, eventId: string): Promise<Event> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/events/${eventId}`,
          z.object({ events: z.array(EventSchema) })
        );
        if (response.events.length === 0) {
          throw new ZohoProjectsError(`Event not found: ${eventId}`, 404);
        }
        return response.events[0];
      },

      async create(projectId: string, data: CreateEventInput): Promise<Event> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/events`,
          z.object({ events: z.array(EventSchema) }),
          { method: "POST", data }
        );
        return response.events[0];
      },

      async update(
        projectId: string,
        eventId: string,
        data: UpdateEventInput
      ): Promise<Event> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/events/${eventId}`,
          z.object({ events: z.array(EventSchema) }),
          { method: "PUT", data }
        );
        return response.events[0];
      },

      async delete(projectId: string, eventId: string): Promise<void> {
        await request(`${basePath}/projects/${projectId}/events/${eventId}`, {
          method: "DELETE",
        });
      },
    },

    /**
     * Attachments API (project-scoped)
     * Note: V3 API requires entity_type and entity_id for listing
     * Note: V3 Upload requires WorkDrive integration - use workdrive.upload() then associate()
     */
    attachments: {
      /**
       * List attachments for an entity (V3 API)
       * Note: V3 requires entity_type and entity_id parameters
       * @param projectId - Project ID
       * @param params - List parameters including required entity_type and entity_id
       */
      async listForEntity(
        projectId: string,
        params: ListAttachmentsParams
      ): Promise<PaginatedResponse<Attachment>> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/attachments`,
          AttachmentListResponseSchema,
          {
            params: {
              entity_type: params.entity_type,
              entity_id: params.entity_id,
              page: params.page ?? 1,
              per_page: params.per_page ?? DEFAULT_PAGE_SIZE,
            },
          }
        );
        // Handle both V3 (attachment) and legacy (attachments) response formats
        const attachments = "attachment" in response ? response.attachment : response.attachments;
        return { data: attachments, pageInfo: response.page_info };
      },

      /**
       * List all attachments for an entity with auto-pagination
       */
      async listAllForEntity(
        projectId: string,
        params: Omit<ListAttachmentsParams, "page" | "per_page">,
        options?: AutoPaginateOptions
      ): Promise<Attachment[]> {
        return collectAll(this.iterateForEntity(projectId, params, options));
      },

      /**
       * Iterate over all attachments for an entity with auto-pagination
       */
      iterateForEntity(
        projectId: string,
        params: Omit<ListAttachmentsParams, "page" | "per_page">,
        options?: AutoPaginateOptions
      ): AsyncGenerator<Attachment, void, unknown> {
        return autoPaginate(
          (page, per_page) =>
            this.listForEntity(projectId, { ...params, page, per_page }),
          options
        );
      },

      /**
       * Convenience method: List attachments for a task
       */
      async listForTask(
        projectId: string,
        taskId: string,
        params?: { page?: number; per_page?: number }
      ): Promise<PaginatedResponse<Attachment>> {
        return this.listForEntity(projectId, {
          entity_type: "task",
          entity_id: taskId,
          ...params,
        });
      },

      /**
       * Convenience method: List attachments for a bug/issue
       */
      async listForIssue(
        projectId: string,
        issueId: string,
        params?: { page?: number; per_page?: number }
      ): Promise<PaginatedResponse<Attachment>> {
        return this.listForEntity(projectId, {
          entity_type: "bug",
          entity_id: issueId,
          ...params,
        });
      },

      async get(projectId: string, attachmentId: string): Promise<Attachment> {
        // V3 API may return attachment directly or wrapped
        const schema = z.union([
          AttachmentSchema,
          z.object({ attachments: z.array(AttachmentSchema) }),
        ]);
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/attachments/${attachmentId}`,
          schema
        );
        if (response && typeof response === "object" && "attachments" in response) {
          const wrapped = response as { attachments: Attachment[] };
          if (wrapped.attachments.length === 0) {
            throw new ZohoProjectsError(
              `Attachment not found: ${attachmentId}`,
              404
            );
          }
          return wrapped.attachments[0];
        }
        return response as Attachment;
      },

      /**
       * Associate an existing attachment with an entity (V3 API)
       * Use this after uploading a file to WorkDrive
       * @param projectId - Project ID
       * @param attachmentId - Attachment ID (from WorkDrive upload)
       * @param data - Entity association details
       */
      async associate(
        projectId: string,
        attachmentId: string,
        data: AssociateAttachmentInput
      ): Promise<void> {
        const FormData = (await import("form-data")).default;
        const formData = new FormData();
        formData.append("entity_type", data.entity_type);
        formData.append("entity_id", data.entity_id);

        await request(
          `${basePath}/projects/${projectId}/attachments/${attachmentId}`,
          {
            method: "POST",
            data: formData,
            headers: formData.getHeaders(),
          }
        );
      },

      /**
       * Add attachments to an entity using attachment IDs (V3 API)
       * @param projectId - Project ID
       * @param entityType - Entity type (task, bug, forum)
       * @param entityId - Entity ID
       * @param data - Attachment IDs to add
       */
      async addToEntity(
        projectId: string,
        entityType: "task" | "bug" | "forum",
        entityId: string,
        data: AddAttachmentsToEntityInput
      ): Promise<void> {
        const FormData = (await import("form-data")).default;
        const formData = new FormData();
        formData.append("attachment_ids", JSON.stringify(data.attachment_ids));

        await request(
          `${basePath}/module/${entityType}/entity/${entityId}/attachments`,
          {
            method: "POST",
            data: formData,
            headers: formData.getHeaders(),
          }
        );
      },

      async delete(projectId: string, attachmentId: string): Promise<void> {
        await request(
          `${basePath}/projects/${projectId}/attachments/${attachmentId}`,
          { method: "DELETE" }
        );
      },
    },

    /**
     * WorkDrive API for file uploads
     * V3 attachments require uploading to WorkDrive first, then associating with entities
     */
    workdrive: {
      /**
       * Upload a file to WorkDrive
       * After uploading, use attachments.associate() to link to a task/issue
       * @param file - File buffer or stream
       * @param filename - Original filename
       * @param options - Upload options including parent_id (folder ID)
       * @returns WorkDrive file object with ID to use for association
       */
      async upload(
        file: Buffer | NodeJS.ReadableStream,
        filename: string,
        options: WorkDriveUploadInput
      ): Promise<WorkDriveFile> {
        const FormData = (await import("form-data")).default;
        const formData = new FormData();
        formData.append("content", file, {
          filename: options.filename ?? filename,
          contentType: "application/octet-stream",
        });
        formData.append("parent_id", options.parent_id);
        if (options.override_name_exist !== undefined) {
          formData.append(
            "override-name-exist",
            options.override_name_exist.toString()
          );
        }

        // WorkDrive has its own API base URL
        const workdriveUrl = apiUrl.replace("projectsapi", "workdrive");
        const token = await tokenManager.getValidToken();

        const response = await httpClient.post<{ data: WorkDriveFile[] }>(
          `${workdriveUrl}/api/v1/upload`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              Authorization: `Zoho-oauthtoken ${token}`,
            },
          }
        );

        if (!response.data.data || response.data.data.length === 0) {
          throw new ZohoProjectsError("WorkDrive upload returned no data");
        }

        return response.data.data[0];
      },
    },

    /**
     * Documents API (project-scoped)
     */
    documents: {
      async list(
        projectId: string,
        params?: ListParams & { folder_id?: string }
      ): Promise<PaginatedResponse<Document>> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/documents`,
          DocumentListResponseSchema,
          {
            params: {
              page: params?.page ?? params?.index ?? 1,
              per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
              folder_id: params?.folder_id,
            },
          }
        );
        return { data: response.documents, pageInfo: response.page_info };
      },

      async listAll(
        projectId: string,
        options?: AutoPaginateOptions
      ): Promise<Document[]> {
        return collectAll(this.iterate(projectId, options));
      },

      iterate(
        projectId: string,
        options?: AutoPaginateOptions
      ): AsyncGenerator<Document, void, unknown> {
        return autoPaginate(
          (page, per_page) => this.list(projectId, { page, per_page }),
          options
        );
      },

      async get(projectId: string, documentId: string): Promise<Document> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/documents/${documentId}`,
          z.object({ documents: z.array(DocumentSchema) })
        );
        if (response.documents.length === 0) {
          throw new ZohoProjectsError(`Document not found: ${documentId}`, 404);
        }
        return response.documents[0];
      },

      /**
       * Upload a document
       */
      async upload(
        projectId: string,
        file: Buffer | NodeJS.ReadableStream,
        filename: string,
        options?: UploadDocumentInput
      ): Promise<Document> {
        const FormData = (await import("form-data")).default;
        const formData = new FormData();
        formData.append("uploaddoc", file, filename);
        if (options?.name) formData.append("name", options.name);
        if (options?.description)
          formData.append("description", options.description);
        if (options?.folder_id) formData.append("folder_id", options.folder_id);

        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/documents`,
          z.object({ documents: z.array(DocumentSchema) }),
          {
            method: "POST",
            data: formData,
            headers: formData.getHeaders(),
          }
        );
        return response.documents[0];
      },

      async update(
        projectId: string,
        documentId: string,
        data: UpdateDocumentInput
      ): Promise<Document> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/documents/${documentId}`,
          z.object({ documents: z.array(DocumentSchema) }),
          { method: "PUT", data }
        );
        return response.documents[0];
      },

      async delete(projectId: string, documentId: string): Promise<void> {
        await request(
          `${basePath}/projects/${projectId}/documents/${documentId}`,
          { method: "DELETE" }
        );
      },

      // Folder operations
      folders: {
        async list(
          projectId: string,
          params?: ListParams
        ): Promise<PaginatedResponse<DocumentFolder>> {
          const response = await requestWithValidation(
            `${basePath}/projects/${projectId}/folders/`,
            DocumentFolderListResponseSchema,
            {
              params: {
                page: params?.page ?? params?.index ?? 1,
                per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
              },
            }
          );
          return { data: response.folders, pageInfo: response.page_info };
        },

        async get(
          projectId: string,
          folderId: string
        ): Promise<DocumentFolder> {
          const response = await requestWithValidation(
            `${basePath}/projects/${projectId}/folders/${folderId}`,
            z.object({ folders: z.array(DocumentFolderSchema) })
          );
          if (response.folders.length === 0) {
            throw new ZohoProjectsError(`Folder not found: ${folderId}`, 404);
          }
          return response.folders[0];
        },

        async create(
          projectId: string,
          data: CreateDocumentFolderInput
        ): Promise<DocumentFolder> {
          const response = await requestWithValidation(
            `${basePath}/projects/${projectId}/folders/`,
            z.object({ folders: z.array(DocumentFolderSchema) }),
            { method: "POST", data }
          );
          return response.folders[0];
        },

        async update(
          projectId: string,
          folderId: string,
          data: UpdateDocumentFolderInput
        ): Promise<DocumentFolder> {
          const response = await requestWithValidation(
            `${basePath}/projects/${projectId}/folders/${folderId}`,
            z.object({ folders: z.array(DocumentFolderSchema) }),
            { method: "PUT", data }
          );
          return response.folders[0];
        },

        async delete(projectId: string, folderId: string): Promise<void> {
          await request(
            `${basePath}/projects/${projectId}/folders/${folderId}`,
            { method: "DELETE" }
          );
        },
      },
    },

    /**
     * Comments API (polymorphic - attaches to multiple entity types)
     * Supports: tasks, bugs, forums, milestones, events
     */
    comments: {
      /**
       * Get comments for a task
       */
      forTask(projectId: string, taskId: string) {
        return this._forEntity("tasks", projectId, taskId);
      },

      /**
       * Get comments for an issue (bug)
       */
      forIssue(projectId: string, issueId: string) {
        return this._forEntity("bugs", projectId, issueId);
      },

      /**
       * Get comments for a forum
       */
      forForum(projectId: string, forumId: string) {
        return this._forEntity("forums", projectId, forumId);
      },

      /**
       * Get comments for a phase (milestone)
       */
      forPhase(projectId: string, phaseId: string) {
        return this._forEntity("milestones", projectId, phaseId);
      },

      /**
       * Get comments for an event
       */
      forEvent(projectId: string, eventId: string) {
        return this._forEntity("events", projectId, eventId);
      },

      /**
       * Internal method to create comment operations for any entity type
       */
      _forEntity(
        entityType: CommentableEntityType,
        projectId: string,
        entityId: string
      ) {
        const commentsPath = `${basePath}/projects/${projectId}/${entityType}/${entityId}/comments`;

        return {
          async list(params?: ListParams): Promise<PaginatedResponse<Comment>> {
            const response = await requestWithValidation(
              `${commentsPath}`,
              CommentListResponseSchema,
              {
                params: {
                  page: params?.page ?? params?.index ?? 1,
                  per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
                },
              }
            );
            return { data: response.comments, pageInfo: response.page_info };
          },

          async listAll(options?: AutoPaginateOptions): Promise<Comment[]> {
            return collectAll(this.iterate(options));
          },

          iterate(
            options?: AutoPaginateOptions
          ): AsyncGenerator<Comment, void, unknown> {
            return autoPaginate(
              (page, per_page) => this.list({ page, per_page }),
              options
            );
          },

          async get(commentId: string): Promise<Comment> {
            const response = await requestWithValidation(
              `${commentsPath}/${commentId}`,
              z.object({ comments: z.array(CommentSchema) })
            );
            if (response.comments.length === 0) {
              throw new ZohoProjectsError(
                `Comment not found: ${commentId}`,
                404
              );
            }
            return response.comments[0];
          },

          async create(data: CreateCommentInput): Promise<Comment> {
            const response = await requestWithValidation(
              `${commentsPath}`,
              z.object({ comments: z.array(CommentSchema) }),
              { method: "POST", data }
            );
            return response.comments[0];
          },

          async update(
            commentId: string,
            data: UpdateCommentInput
          ): Promise<Comment> {
            const response = await requestWithValidation(
              `${commentsPath}/${commentId}`,
              z.object({ comments: z.array(CommentSchema) }),
              { method: "PUT", data }
            );
            return response.comments[0];
          },

          async delete(commentId: string): Promise<void> {
            await request(`${commentsPath}/${commentId}`, {
              method: "DELETE",
            });
          },
        };
      },
    },

    /**
     * Followers API (polymorphic - attaches to multiple entity types)
     * Supports: tasks, bugs, forums, milestones, events
     */
    followers: {
      /**
       * Get followers for a task
       */
      forTask(projectId: string, taskId: string) {
        return this._forEntity("tasks", projectId, taskId);
      },

      /**
       * Get followers for an issue (bug)
       */
      forIssue(projectId: string, issueId: string) {
        return this._forEntity("bugs", projectId, issueId);
      },

      /**
       * Get followers for a forum
       */
      forForum(projectId: string, forumId: string) {
        return this._forEntity("forums", projectId, forumId);
      },

      /**
       * Get followers for a phase (milestone)
       */
      forPhase(projectId: string, phaseId: string) {
        return this._forEntity("milestones", projectId, phaseId);
      },

      /**
       * Get followers for an event
       */
      forEvent(projectId: string, eventId: string) {
        return this._forEntity("events", projectId, eventId);
      },

      /**
       * Internal method to create follower operations for any entity type
       */
      _forEntity(
        entityType: FollowableEntityType,
        projectId: string,
        entityId: string
      ) {
        const followersPath = `${basePath}/projects/${projectId}/${entityType}/${entityId}/followers`;

        return {
          async list(
            params?: ListParams
          ): Promise<PaginatedResponse<Follower>> {
            const response = await requestWithValidation(
              `${followersPath}`,
              FollowerListResponseSchema,
              {
                params: {
                  page: params?.page ?? params?.index ?? 1,
                  per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
                },
              }
            );
            return { data: response.followers, pageInfo: response.page_info };
          },

          async listAll(options?: AutoPaginateOptions): Promise<Follower[]> {
            return collectAll(this.iterate(options));
          },

          iterate(
            options?: AutoPaginateOptions
          ): AsyncGenerator<Follower, void, unknown> {
            return autoPaginate(
              (page, per_page) => this.list({ page, per_page }),
              options
            );
          },

          async add(data: AddFollowersInput): Promise<Follower[]> {
            const response = await requestWithValidation(
              `${followersPath}`,
              z.object({ followers: z.array(FollowerSchema) }),
              { method: "POST", data }
            );
            return response.followers;
          },

          async remove(userId: string): Promise<void> {
            await request(`${followersPath}/${userId}`, {
              method: "DELETE",
            });
          },

          /**
           * Follow this entity as the current user
           */
          async follow(): Promise<void> {
            await request(`${followersPath}/me/`, {
              method: "POST",
            });
          },

          /**
           * Unfollow this entity as the current user
           */
          async unfollow(): Promise<void> {
            await request(`${followersPath}/me/`, {
              method: "DELETE",
            });
          },
        };
      },
    },

    /**
     * Dashboards API
     */
    dashboards: {
      async list(params?: ListParams): Promise<PaginatedResponse<Dashboard>> {
        const response = await requestWithValidation(
          `${basePath}/dashboards`,
          DashboardListResponseSchema,
          {
            params: {
              page: params?.page ?? params?.index ?? 1,
              per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
            },
          }
        );
        return { data: response.dashboards, pageInfo: response.page_info };
      },

      async listAll(options?: AutoPaginateOptions): Promise<Dashboard[]> {
        return collectAll(this.iterate(options));
      },

      iterate(
        options?: AutoPaginateOptions
      ): AsyncGenerator<Dashboard, void, unknown> {
        return autoPaginate(
          (page, per_page) => this.list({ page, per_page }),
          options
        );
      },

      async get(dashboardId: string): Promise<Dashboard> {
        const response = await requestWithValidation(
          `${basePath}/dashboards/${dashboardId}`,
          z.object({ dashboards: z.array(DashboardSchema) })
        );
        if (response.dashboards.length === 0) {
          throw new ZohoProjectsError(
            `Dashboard not found: ${dashboardId}`,
            404
          );
        }
        return response.dashboards[0];
      },

      async create(data: CreateDashboardInput): Promise<Dashboard> {
        const response = await requestWithValidation(
          `${basePath}/dashboards`,
          z.object({ dashboards: z.array(DashboardSchema) }),
          { method: "POST", data }
        );
        return response.dashboards[0];
      },

      async update(
        dashboardId: string,
        data: UpdateDashboardInput
      ): Promise<Dashboard> {
        const response = await requestWithValidation(
          `${basePath}/dashboards/${dashboardId}`,
          z.object({ dashboards: z.array(DashboardSchema) }),
          { method: "PUT", data }
        );
        return response.dashboards[0];
      },

      async delete(dashboardId: string): Promise<void> {
        await request(`${basePath}/dashboards/${dashboardId}`, {
          method: "DELETE",
        });
      },

      /**
       * Widget operations for a specific dashboard
       */
      widgets(dashboardId: string) {
        const widgetsPath = `${basePath}/dashboards/${dashboardId}/widgets`;

        return {
          async list(params?: ListParams): Promise<PaginatedResponse<Widget>> {
            const response = await requestWithValidation(
              `${widgetsPath}`,
              WidgetListResponseSchema,
              {
                params: {
                  page: params?.page ?? params?.index ?? 1,
                  per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
                },
              }
            );
            return { data: response.widgets, pageInfo: response.page_info };
          },

          async listAll(options?: AutoPaginateOptions): Promise<Widget[]> {
            return collectAll(this.iterate(options));
          },

          iterate(
            options?: AutoPaginateOptions
          ): AsyncGenerator<Widget, void, unknown> {
            return autoPaginate(
              (page, per_page) => this.list({ page, per_page }),
              options
            );
          },

          async get(widgetId: string): Promise<Widget> {
            const response = await requestWithValidation(
              `${widgetsPath}/${widgetId}`,
              z.object({ widgets: z.array(WidgetSchema) })
            );
            if (response.widgets.length === 0) {
              throw new ZohoProjectsError(`Widget not found: ${widgetId}`, 404);
            }
            return response.widgets[0];
          },

          async create(data: CreateWidgetInput): Promise<Widget> {
            const response = await requestWithValidation(
              `${widgetsPath}`,
              z.object({ widgets: z.array(WidgetSchema) }),
              { method: "POST", data }
            );
            return response.widgets[0];
          },

          async update(
            widgetId: string,
            data: UpdateWidgetInput
          ): Promise<Widget> {
            const response = await requestWithValidation(
              `${widgetsPath}/${widgetId}`,
              z.object({ widgets: z.array(WidgetSchema) }),
              { method: "PUT", data }
            );
            return response.widgets[0];
          },

          async delete(widgetId: string): Promise<void> {
            await request(`${widgetsPath}/${widgetId}`, {
              method: "DELETE",
            });
          },
        };
      },
    },

    /**
     * Reports API
     * Reports are typically read-only with specialized query parameters
     */
    reports: {
      async list(params?: ListParams): Promise<PaginatedResponse<Report>> {
        const response = await requestWithValidation(
          `${basePath}/reports`,
          ReportListResponseSchema,
          {
            params: {
              page: params?.page ?? params?.index ?? 1,
              per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
            },
          }
        );
        return { data: response.reports, pageInfo: response.page_info };
      },

      async listAll(options?: AutoPaginateOptions): Promise<Report[]> {
        return collectAll(this.iterate(options));
      },

      iterate(
        options?: AutoPaginateOptions
      ): AsyncGenerator<Report, void, unknown> {
        return autoPaginate(
          (page, per_page) => this.list({ page, per_page }),
          options
        );
      },

      async get(reportId: string): Promise<Report> {
        const response = await requestWithValidation(
          `${basePath}/reports/${reportId}`,
          z.object({ reports: z.array(ReportSchema) })
        );
        if (response.reports.length === 0) {
          throw new ZohoProjectsError(`Report not found: ${reportId}`, 404);
        }
        return response.reports[0];
      },

      /**
       * Execute a report and get its data
       */
      async execute(
        reportId: string,
        query?: ReportQueryInput & ListParams
      ): Promise<ReportDataResponse> {
        const response = await requestWithValidation(
          `${basePath}/reports/${reportId}/data/`,
          ReportDataResponseSchema,
          {
            params: {
              index: query?.index ?? 0,
              range: query?.range ?? DEFAULT_PAGE_SIZE,
              sort_by: query?.sort_by,
              sort_order: query?.sort_order,
              group_by: query?.group_by,
              start_date: query?.start_date,
              end_date: query?.end_date,
            },
          }
        );
        return response;
      },

      /**
       * List reports for a specific project
       */
      async listForProject(
        projectId: string,
        params?: ListParams
      ): Promise<PaginatedResponse<Report>> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/reports`,
          ReportListResponseSchema,
          {
            params: {
              page: params?.page ?? params?.index ?? 1,
              per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
            },
          }
        );
        return { data: response.reports, pageInfo: response.page_info };
      },
    },

    /**
     * Search API
     * Global search across entities
     */
    search: {
      /**
       * Search across all entities
       */
      async query(
        query: SearchQueryInput & ListParams
      ): Promise<PaginatedResponse<SearchResult>> {
        const response = await requestWithValidation(
          `${basePath}/search`,
          SearchResponseSchema,
          {
            params: {
              search_term: query.search_term,
              entity_type: query.entity_type,
              project_id: query.project_id,
              status: query.status,
              owner: query.owner,
              start_date: query.start_date,
              end_date: query.end_date,
              index: query.index ?? 0,
              range: query.range ?? DEFAULT_PAGE_SIZE,
            },
          }
        );
        const results = response.results || response.search_results || [];
        return { data: results, pageInfo: response.page_info };
      },

      /**
       * Search within a specific project
       */
      async inProject(
        projectId: string,
        query: Omit<SearchQueryInput, "project_id"> & ListParams
      ): Promise<PaginatedResponse<SearchResult>> {
        return this.query({ ...query, project_id: projectId });
      },

      /**
       * Search for tasks
       */
      async tasks(
        searchTerm: string,
        params?: Omit<SearchQueryInput, "search_term" | "entity_type"> &
          ListParams
      ): Promise<PaginatedResponse<SearchResult>> {
        return this.query({
          search_term: searchTerm,
          entity_type: "task",
          ...params,
        });
      },

      /**
       * Search for issues (bugs)
       */
      async issues(
        searchTerm: string,
        params?: Omit<SearchQueryInput, "search_term" | "entity_type"> &
          ListParams
      ): Promise<PaginatedResponse<SearchResult>> {
        return this.query({
          search_term: searchTerm,
          entity_type: "bug",
          ...params,
        });
      },

      /**
       * Search for projects
       */
      async projects(
        searchTerm: string,
        params?: Omit<SearchQueryInput, "search_term" | "entity_type"> &
          ListParams
      ): Promise<PaginatedResponse<SearchResult>> {
        return this.query({
          search_term: searchTerm,
          entity_type: "project",
          ...params,
        });
      },
    },

    /**
     * Trash API
     * Manage deleted items
     */
    trash: {
      /**
       * List items in trash
       */
      async list(
        params?: TrashFilterInput & ListParams
      ): Promise<PaginatedResponse<TrashItem>> {
        const response = await requestWithValidation(
          `${basePath}/trash`,
          TrashListResponseSchema,
          {
            params: {
              entity_type: params?.entity_type,
              project_id: params?.project_id,
              deleted_by: params?.deleted_by,
              page: params?.page ?? params?.index ?? 1,
              per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
            },
          }
        );
        const items = response.trash || response.deleted_items || [];
        return { data: items, pageInfo: response.page_info };
      },

      /**
       * List all items in trash with auto-pagination
       */
      async listAll(
        params?: TrashFilterInput,
        options?: AutoPaginateOptions
      ): Promise<TrashItem[]> {
        return collectAll(this.iterate(params, options));
      },

      /**
       * Iterate over all trash items with auto-pagination
       */
      iterate(
        params?: TrashFilterInput,
        options?: AutoPaginateOptions
      ): AsyncGenerator<TrashItem, void, unknown> {
        return autoPaginate(
          (page, per_page) => this.list({ ...params, page, per_page }),
          options
        );
      },

      /**
       * Restore an item from trash
       */
      async restore(
        entityType: TrashableEntityType,
        itemId: string
      ): Promise<TrashRestoreResponse> {
        const response = await requestWithValidation(
          `${basePath}/trash/${entityType}/${itemId}/restore/`,
          TrashRestoreResponseSchema,
          { method: "POST" }
        );
        return response;
      },

      /**
       * Permanently delete an item from trash
       */
      async permanentDelete(
        entityType: TrashableEntityType,
        itemId: string
      ): Promise<void> {
        await request(`${basePath}/trash/${entityType}/${itemId}`, {
          method: "DELETE",
        });
      },

      /**
       * Empty trash (permanently delete all items)
       */
      async empty(entityType?: TrashableEntityType): Promise<void> {
        const path = entityType
          ? `${basePath}/trash/${entityType}`
          : `${basePath}/trash`;
        await request(path, { method: "DELETE" });
      },

      /**
       * List trash for a specific project
       */
      async listForProject(
        projectId: string,
        params?: Omit<TrashFilterInput, "project_id"> & ListParams
      ): Promise<PaginatedResponse<TrashItem>> {
        return this.list({ ...params, project_id: projectId });
      },
    },

    /**
     * Portals API
     * Note: Portals are accessed at a higher level than portal-specific endpoints
     */
    portals: {
      /**
       * List all portals accessible to the authenticated user
       */
      async list(): Promise<Portal[]> {
        const response = await requestWithValidation(
          `/restapi/portals/`,
          PortalListResponseSchema
        );
        return response.portals;
      },

      /**
       * Get a specific portal by ID
       */
      async get(portalId: string): Promise<Portal> {
        const response = await requestWithValidation(
          `/restapi/portals/${portalId}`,
          z.object({ portals: z.array(PortalSchema) })
        );
        if (response.portals.length === 0) {
          throw new ZohoProjectsError(`Portal not found: ${portalId}`, 404);
        }
        return response.portals[0];
      },

      /**
       * Get the current portal (the one configured in the client)
       */
      async getCurrent(): Promise<Portal> {
        return this.get(portalId);
      },
    },

    /**
     * Modules API
     * Get module definitions and field metadata
     */
    modules: {
      /**
       * List all modules in the portal
       */
      async list(params?: ModuleFilterInput): Promise<Module[]> {
        const response = await requestWithValidation(
          `${basePath}/settings/modules`,
          ModuleListResponseSchema,
          {
            params: {
              is_customized: params?.is_customized,
              is_default: params?.is_default,
              is_web_tab: params?.is_web_tab,
            },
          }
        );
        return response.modules;
      },

      /**
       * Get a specific module by ID
       */
      async get(moduleId: string): Promise<Module> {
        const response = await requestWithValidation(
          `${basePath}/settings/modules/${moduleId}`,
          z.object({ modules: z.array(ModuleSchema) })
        );
        if (response.modules.length === 0) {
          throw new ZohoProjectsError(`Module not found: ${moduleId}`, 404);
        }
        return response.modules[0];
      },

      /**
       * Get fields for a module
       */
      async getFields(moduleId: string): Promise<ModuleField[]> {
        const response = await requestWithValidation(
          `${basePath}/settings/modules/${moduleId}/fields/`,
          ModuleFieldListResponseSchema
        );
        return response.fields;
      },

      /**
       * Get a specific field definition
       */
      async getField(moduleId: string, fieldId: string): Promise<ModuleField> {
        const response = await requestWithValidation(
          `${basePath}/settings/modules/${moduleId}/fields/${fieldId}`,
          z.object({ fields: z.array(ModuleFieldSchema) })
        );
        if (response.fields.length === 0) {
          throw new ZohoProjectsError(`Field not found: ${fieldId}`, 404);
        }
        return response.fields[0];
      },

      /**
       * Get project-specific field values (custom field options specific to a project)
       */
      async getProjectFields(
        projectId: string,
        moduleId: string
      ): Promise<ModuleField[]> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/settings/modules/${moduleId}/fields/`,
          ModuleFieldListResponseSchema
        );
        return response.fields;
      },
    },

    /**
     * Timers API
     * Start, stop, pause, and resume time tracking
     */
    timers: {
      /**
       * Get current running timer for the authenticated user
       */
      async getCurrent(): Promise<Timer | null> {
        const rawResponse = await request<unknown>(
          `${basePath}/mytimers/`
        );

        if (!rawResponse || rawResponse === "") {
          return null;
        }

        const result = TimerListResponseSchema.safeParse(rawResponse);
        if (!result.success || result.data.timers.length === 0) {
          return null;
        }
        return result.data.timers[0];
      },

      /**
       * List all running timers
       */
      async list(): Promise<Timer[]> {
        const rawResponse = await request<unknown>(
          `${basePath}/mytimers/`
        );

        if (!rawResponse || rawResponse === "") {
          return [];
        }

        const result = TimerListResponseSchema.safeParse(rawResponse);
        if (!result.success) {
          return [];
        }
        return result.data.timers;
      },

      /**
       * Start a timer for a task or issue
       */
      async start(data: StartTimerInput): Promise<Timer> {
        const response = await requestWithValidation(
          `${basePath}/projects/${data.project_id}/${data.type.toLowerCase()}s/${data.entity_id}/timer/start/`,
          TimerResponseSchema,
          {
            method: "POST",
            data: {
              notes: data.notes,
              bill_status: data.bill_status,
            },
          }
        );
        return response.timer || response.timers?.[0]!;
      },

      /**
       * Stop a running timer
       */
      async stop(data: StopTimerInput): Promise<Timer> {
        let path: string;
        if (data.project_id && data.type && data.entity_id) {
          path = `${basePath}/projects/${data.project_id}/${data.type.toLowerCase()}s/${data.entity_id}/timer/stop/`;
        } else {
          path = `${basePath}/mytimers/stop/`;
        }

        const response = await requestWithValidation(
          path,
          TimerResponseSchema,
          {
            method: "POST",
            data: {
              log_name: data.log_name,
              date: data.date,
              hours: data.hours,
              start_time: data.start_time,
              end_time: data.end_time,
              bill_status: data.bill_status,
              notes: data.notes,
            },
          }
        );
        return response.timer || response.timers?.[0]!;
      },

      /**
       * Pause a running timer
       */
      async pause(data?: PauseResumeTimerInput): Promise<Timer> {
        let path: string;
        if (data?.type && data?.entity_id) {
          path = `${basePath}/projects/${data.log_id}/${data.type.toLowerCase()}s/${data.entity_id}/timer/pause/`;
        } else {
          path = `${basePath}/mytimers/pause/`;
        }

        const response = await requestWithValidation(
          path,
          TimerResponseSchema,
          {
            method: "POST",
            data: {
              notes: data?.notes,
            },
          }
        );
        return response.timer || response.timers?.[0]!;
      },

      /**
       * Resume a paused timer
       */
      async resume(data?: PauseResumeTimerInput): Promise<Timer> {
        let path: string;
        if (data?.type && data?.entity_id) {
          path = `${basePath}/projects/${data.log_id}/${data.type.toLowerCase()}s/${data.entity_id}/timer/resume/`;
        } else {
          path = `${basePath}/mytimers/resume/`;
        }

        const response = await requestWithValidation(
          path,
          TimerResponseSchema,
          {
            method: "POST",
            data: {
              notes: data?.notes,
            },
          }
        );
        return response.timer || response.timers?.[0]!;
      },

      /**
       * Start timer for a task
       */
      async startForTask(
        projectId: string,
        taskId: string,
        options?: { notes?: string; bill_status?: "billable" | "non_billable" }
      ): Promise<Timer> {
        return this.start({
          entity_id: taskId,
          type: "Task",
          project_id: projectId,
          notes: options?.notes,
          bill_status: options?.bill_status,
        });
      },

      /**
       * Start timer for an issue
       */
      async startForIssue(
        projectId: string,
        issueId: string,
        options?: { notes?: string; bill_status?: "billable" | "non_billable" }
      ): Promise<Timer> {
        return this.start({
          entity_id: issueId,
          type: "Issue",
          project_id: projectId,
          notes: options?.notes,
          bill_status: options?.bill_status,
        });
      },
    },

    /**
     * Custom Views API
     * Manage saved filters and views for tasks, issues, etc.
     */
    customViews: {
      /**
       * List custom views for a specific entity type
       */
      async list(
        entityType: CustomViewEntityType,
        params?: ListParams
      ): Promise<PaginatedResponse<CustomView>> {
        const response = await requestWithValidation(
          `${basePath}/${entityType}/customviews`,
          CustomViewListResponseSchema,
          {
            params: {
              page: params?.page ?? params?.index ?? 1,
              per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
            },
          }
        );
        return { data: response.customviews, pageInfo: response.page_info };
      },

      /**
       * Get all custom views with auto-pagination
       */
      async listAll(
        entityType: CustomViewEntityType,
        options?: AutoPaginateOptions
      ): Promise<CustomView[]> {
        return collectAll(this.iterate(entityType, options));
      },

      /**
       * Iterate over all custom views with auto-pagination
       */
      iterate(
        entityType: CustomViewEntityType,
        options?: AutoPaginateOptions
      ): AsyncGenerator<CustomView, void, unknown> {
        return autoPaginate(
          (page, per_page) => this.list(entityType, { page, per_page }),
          options
        );
      },

      /**
       * Get a specific custom view
       */
      async get(
        entityType: CustomViewEntityType,
        viewId: string
      ): Promise<CustomView> {
        const response = await requestWithValidation(
          `${basePath}/${entityType}/customviews/${viewId}`,
          z.object({ customviews: z.array(CustomViewSchema) })
        );
        if (response.customviews.length === 0) {
          throw new ZohoProjectsError(`Custom view not found: ${viewId}`, 404);
        }
        return response.customviews[0];
      },

      /**
       * Create a custom view
       */
      async create(
        entityType: CustomViewEntityType,
        data: CreateCustomViewInput
      ): Promise<CustomView> {
        const response = await requestWithValidation(
          `${basePath}/${entityType}/customviews`,
          z.object({ customviews: z.array(CustomViewSchema) }),
          { method: "POST", data }
        );
        return response.customviews[0];
      },

      /**
       * Update a custom view
       */
      async update(
        entityType: CustomViewEntityType,
        viewId: string,
        data: UpdateCustomViewInput
      ): Promise<CustomView> {
        const response = await requestWithValidation(
          `${basePath}/${entityType}/customviews/${viewId}`,
          z.object({ customviews: z.array(CustomViewSchema) }),
          { method: "PUT", data }
        );
        return response.customviews[0];
      },

      /**
       * Delete a custom view
       */
      async delete(
        entityType: CustomViewEntityType,
        viewId: string
      ): Promise<void> {
        await request(`${basePath}/${entityType}/customviews/${viewId}`, {
          method: "DELETE",
        });
      },

      /**
       * List task custom views
       */
      forTasks() {
        return {
          list: (params?: ListParams) => this.list("tasks", params),
          listAll: (options?: AutoPaginateOptions) => this.listAll("tasks", options),
          iterate: (options?: AutoPaginateOptions) => this.iterate("tasks", options),
          get: (viewId: string) => this.get("tasks", viewId),
          create: (data: CreateCustomViewInput) => this.create("tasks", data),
          update: (viewId: string, data: UpdateCustomViewInput) =>
            this.update("tasks", viewId, data),
          delete: (viewId: string) => this.delete("tasks", viewId),
        };
      },

      /**
       * List issue custom views
       */
      forIssues() {
        return {
          list: (params?: ListParams) => this.list("issues", params),
          listAll: (options?: AutoPaginateOptions) => this.listAll("issues", options),
          iterate: (options?: AutoPaginateOptions) => this.iterate("issues", options),
          get: (viewId: string) => this.get("issues", viewId),
          create: (data: CreateCustomViewInput) => this.create("issues", data),
          update: (viewId: string, data: UpdateCustomViewInput) =>
            this.update("issues", viewId, data),
          delete: (viewId: string) => this.delete("issues", viewId),
        };
      },

      /**
       * List milestone custom views
       */
      forMilestones() {
        return {
          list: (params?: ListParams) => this.list("milestones", params),
          listAll: (options?: AutoPaginateOptions) => this.listAll("milestones", options),
          iterate: (options?: AutoPaginateOptions) => this.iterate("milestones", options),
          get: (viewId: string) => this.get("milestones", viewId),
          create: (data: CreateCustomViewInput) => this.create("milestones", data),
          update: (viewId: string, data: UpdateCustomViewInput) =>
            this.update("milestones", viewId, data),
          delete: (viewId: string) => this.delete("milestones", viewId),
        };
      },
    },

    /**
     * Blueprints API
     * Workflow automation and status transitions
     */
    blueprints: {
      /**
       * List all blueprints
       */
      async list(params?: ListParams): Promise<PaginatedResponse<Blueprint>> {
        const response = await requestWithValidation(
          `${basePath}/settings/blueprints`,
          BlueprintListResponseSchema,
          {
            params: {
              page: params?.page ?? params?.index ?? 1,
              per_page: params?.per_page ?? params?.range ?? DEFAULT_PAGE_SIZE,
            },
          }
        );
        return { data: response.blueprints, pageInfo: response.page_info };
      },

      /**
       * Get all blueprints with auto-pagination
       */
      async listAll(options?: AutoPaginateOptions): Promise<Blueprint[]> {
        return collectAll(this.iterate(options));
      },

      /**
       * Iterate over all blueprints with auto-pagination
       */
      iterate(
        options?: AutoPaginateOptions
      ): AsyncGenerator<Blueprint, void, unknown> {
        return autoPaginate(
          (page, per_page) => this.list({ page, per_page }),
          options
        );
      },

      /**
       * Get a specific blueprint
       */
      async get(blueprintId: string): Promise<Blueprint> {
        const response = await requestWithValidation(
          `${basePath}/settings/blueprints/${blueprintId}`,
          z.object({ blueprints: z.array(BlueprintSchema) })
        );
        if (response.blueprints.length === 0) {
          throw new ZohoProjectsError(
            `Blueprint not found: ${blueprintId}`,
            404
          );
        }
        return response.blueprints[0];
      },

      /**
       * Get available transitions for an entity (task or issue)
       */
      async getNextTransitions(
        projectId: string,
        moduleType: BlueprintModuleType,
        entityId: string
      ): Promise<NextTransitionsResponse> {
        const modulePath = moduleType === "Task" ? "tasks" : "bugs";
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/${modulePath}/${entityId}/transitions/`,
          NextTransitionsResponseSchema
        );
        return response;
      },

      /**
       * Get required actions (fields) for a specific transition
       */
      async getDuringActions(
        projectId: string,
        moduleType: BlueprintModuleType,
        entityId: string,
        transitionId: string
      ): Promise<DuringActionsResponse> {
        const modulePath = moduleType === "Task" ? "tasks" : "bugs";
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/${modulePath}/${entityId}/transitions/${transitionId}/actions/`,
          DuringActionsResponseSchema
        );
        return response;
      },

      /**
       * Execute a blueprint transition
       */
      async executeTransition(
        projectId: string,
        moduleType: BlueprintModuleType,
        transitionId: string,
        data: ExecuteTransitionInput
      ): Promise<void> {
        const modulePath = moduleType === "Task" ? "tasks" : "bugs";
        await request(
          `${basePath}/projects/${projectId}/${modulePath}/${data.entity_id}/transitions/${transitionId}`,
          {
            method: "POST",
            data: {
              skip_bug_validation: data.skip_bug_validation,
              field_values: data.field_values,
            },
          }
        );
      },

      /**
       * Get transitions for a task
       */
      async getTaskTransitions(
        projectId: string,
        taskId: string
      ): Promise<BlueprintTransition[]> {
        const response = await this.getNextTransitions(
          projectId,
          "Task",
          taskId
        );
        return response.transitions;
      },

      /**
       * Get transitions for an issue
       */
      async getIssueTransitions(
        projectId: string,
        issueId: string
      ): Promise<BlueprintTransition[]> {
        const response = await this.getNextTransitions(
          projectId,
          "Issue",
          issueId
        );
        return response.transitions;
      },

      /**
       * Execute a task transition
       */
      async executeTaskTransition(
        projectId: string,
        taskId: string,
        transitionId: string,
        data?: Omit<ExecuteTransitionInput, "entity_id">
      ): Promise<void> {
        return this.executeTransition(projectId, "Task", transitionId, {
          entity_id: taskId,
          ...data,
        });
      },

      /**
       * Execute an issue transition
       */
      async executeIssueTransition(
        projectId: string,
        issueId: string,
        transitionId: string,
        data?: Omit<ExecuteTransitionInput, "entity_id">
      ): Promise<void> {
        return this.executeTransition(projectId, "Issue", transitionId, {
          entity_id: issueId,
          ...data,
        });
      },
    },

    /**
     * Get the underlying token manager for advanced use cases
     */
    getTokenManager: () => tokenManager,

    /**
     * Get the underlying rate limiter for monitoring
     */
    getRateLimiter: () => rateLimiter,
  };

  // Store reference for internal use
  const client = {
    projects: {} as ReturnType<typeof createZohoProjectsClient>["projects"],
  };
}

/**
 * Type for the Zoho Projects client
 */
export type ZohoProjectsClient = ReturnType<typeof createZohoProjectsClient>;
