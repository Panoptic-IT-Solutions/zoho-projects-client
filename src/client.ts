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
  type Project,
  type Task,
  type TimeLog,
  type User,
  type ListParams,
  type TimeLogParams,
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
  } = config;

  // Initialize token manager
  const tokenManagerConfig: TokenManagerConfig = {
    clientId,
    clientSecret,
    refreshToken,
    accountsUrl,
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

  // Base path for portal-specific endpoints
  const basePath = `/restapi/portal/${portalId}`;

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
          `${basePath}/projects/`,
          ProjectListResponseSchema,
          {
            params: {
              index: params?.index ?? 0,
              range: params?.range ?? DEFAULT_PAGE_SIZE,
              sort_column: params?.sort_column,
              sort_order: params?.sort_order,
            },
          }
        );
        return {
          data: response.projects,
          pageInfo: response.page_info,
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
          (index, range) => this.list({ index, range }),
          options
        );
      },

      /**
       * Get a single project by ID
       */
      async get(projectId: string): Promise<Project> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/`,
          z.object({ projects: z.array(ProjectSchema) })
        );
        if (response.projects.length === 0) {
          throw new ZohoProjectsError(`Project not found: ${projectId}`, 404);
        }
        return response.projects[0];
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
          `${basePath}/projects/${projectId}/tasks/`,
          TaskListResponseSchema,
          {
            params: {
              index: params?.index ?? 0,
              range: params?.range ?? DEFAULT_PAGE_SIZE,
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
          (index, range) => this.list(projectId, { index, range }),
          options
        );
      },

      /**
       * Get a single task by ID
       */
      async get(projectId: string, taskId: string): Promise<Task> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/tasks/${taskId}/`,
          z.object({ tasks: z.array(TaskSchema) })
        );
        if (response.tasks.length === 0) {
          throw new ZohoProjectsError(`Task not found: ${taskId}`, 404);
        }
        return response.tasks[0];
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
          const tasks = await this.listAll(project.id_string, options);
          allTasks.push(...tasks);
        }

        return allTasks;
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
        params?: TimeLogParams
      ): Promise<PaginatedResponse<TimeLog>> {
        const response = await requestWithValidation(
          `${basePath}/projects/${projectId}/logs/`,
          TimeLogListResponseSchema,
          {
            params: {
              index: params?.index ?? 0,
              range: params?.range ?? DEFAULT_PAGE_SIZE,
              users_list: params?.users_list,
              view_type: params?.view_type,
              date: params?.date,
              bill_status: params?.bill_status,
              component_type: params?.component_type,
            },
          }
        );

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
        params?: Omit<TimeLogParams, "index" | "range">,
        options?: AutoPaginateOptions
      ): Promise<TimeLog[]> {
        return collectAll(this.iterate(projectId, params, options));
      },

      /**
       * Iterate over all time logs for a project with auto-pagination
       */
      iterate(
        projectId: string,
        params?: Omit<TimeLogParams, "index" | "range">,
        options?: AutoPaginateOptions
      ): AsyncGenerator<TimeLog, void, unknown> {
        return autoPaginate(
          (index, range) => this.list(projectId, { ...params, index, range }),
          options
        );
      },

      /**
       * List all time logs across all projects
       */
      async listAllAcrossProjects(
        params?: Omit<TimeLogParams, "index" | "range">,
        options?: AutoPaginateOptions
      ): Promise<TimeLog[]> {
        const projects = await this._getProjectsRef().listAll();
        const allLogs: TimeLog[] = [];

        for (const project of projects) {
          const logs = await this.listAll(project.id_string, params, options);
          allLogs.push(...logs);
        }

        return allLogs;
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
          `${basePath}/users/`,
          UserListResponseSchema,
          {
            params: {
              index: params?.index ?? 0,
              range: params?.range ?? DEFAULT_PAGE_SIZE,
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
          (index, range) => this.list({ index, range }),
          options
        );
      },

      /**
       * Get a single user by ID
       */
      async get(userId: string): Promise<User> {
        const response = await requestWithValidation(
          `${basePath}/users/${userId}/`,
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
          `${basePath}/projects/${projectId}/users/`,
          UserListResponseSchema,
          {
            params: {
              index: params?.index ?? 0,
              range: params?.range ?? DEFAULT_PAGE_SIZE,
            },
          }
        );
        return {
          data: response.users,
          pageInfo: response.page_info,
        };
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
