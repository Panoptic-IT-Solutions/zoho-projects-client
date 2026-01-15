// Common types
export {
  ZohoPageInfoSchema,
  ZohoErrorSchema,
  CustomFieldSchema,
  ZohoLinkSchema,
  OwnerRefSchema,
  StatusRefSchema,
  type ZohoPageInfo,
  type ZohoError,
  type CustomField,
  type ZohoLink,
  type OwnerRef,
  type StatusRef,
  type ListParams,
} from "./common.js";

// Project types
export {
  ProjectSchema,
  ProjectListResponseSchema,
  ProjectResponseSchema,
  CountObjectSchema,
  LayoutDetailsSchema,
  CreateProjectInputSchema,
  UpdateProjectInputSchema,
  type Project,
  type ProjectListResponse,
  type ProjectResponse,
  type CreateProjectInput,
  type UpdateProjectInput,
} from "./projects.js";

// Task types
export {
  TaskSchema,
  TaskListResponseSchema,
  TaskResponseSchema,
  TaskStatusSchema,
  TaskListRefSchema,
  TaskOwnerSchema,
  TaskDetailsSchema,
  LogHoursSchema,
  TaskTagSchema,
  CreateTaskInputSchema,
  CreateSubtaskInputSchema,
  UpdateTaskInputSchema,
  type Task,
  type TaskListResponse,
  type TaskResponse,
  type TaskStatus,
  type TaskListRef,
  type TaskOwner,
  type TaskDetails,
  type LogHours,
  type TaskTag,
  type CreateTaskInput,
  type CreateSubtaskInput,
  type UpdateTaskInput,
} from "./tasks.js";

// Time log types
export {
  TimeLogSchema,
  TimeLogListResponseSchema,
  TimeLogDateGroupSchema,
  TimeLogTaskRefSchema,
  TimeLogProjectRefSchema,
  TimeLogBugRefSchema,
  CreateTimeLogInputSchema,
  CreateTaskTimeLogInputSchema,
  CreateBugTimeLogInputSchema,
  CreateGeneralTimeLogInputSchema,
  UpdateTimeLogInputSchema,
  type TimeLog,
  type TimeLogListResponse,
  type TimeLogDateGroup,
  type TimeLogTaskRef,
  type TimeLogProjectRef,
  type TimeLogBugRef,
  type TimeLogParams,
  type CreateTimeLogInput,
  type CreateTaskTimeLogInput,
  type CreateBugTimeLogInput,
  type CreateGeneralTimeLogInput,
  type UpdateTimeLogInput,
} from "./timelogs.js";

// User types
export {
  UserSchema,
  UserListResponseSchema,
  UserResponseSchema,
  ProjectUserListResponseSchema,
  UserRoleSchema,
  InviteUserInputSchema,
  AddUserToProjectInputSchema,
  UpdateUserInputSchema,
  type User,
  type UserListResponse,
  type UserResponse,
  type ProjectUserListResponse,
  type UserRole,
  type InviteUserInput,
  type AddUserToProjectInput,
  type UpdateUserInput,
} from "./users.js";

// Tag types
export {
  TagSchema,
  TagListResponseSchema,
  TagResponseSchema,
  CreateTagInputSchema,
  UpdateTagInputSchema,
  TagEntityType,
  type Tag,
  type TagListResponse,
  type TagResponse,
  type CreateTagInput,
  type UpdateTagInput,
  type TagEntityTypeValue,
} from "./tags.js";

// Role types
export {
  RoleSchema,
  RoleListResponseSchema,
  RoleResponseSchema,
  CreateRoleInputSchema,
  UpdateRoleInputSchema,
  type Role,
  type RoleListResponse,
  type RoleResponse,
  type CreateRoleInput,
  type UpdateRoleInput,
} from "./roles.js";

// Profile types
export {
  ProfileSchema,
  ProfileListResponseSchema,
  ProfileResponseSchema,
  CreateProfileInputSchema,
  UpdateProfileInputSchema,
  type Profile,
  type ProfileListResponse,
  type ProfileResponse,
  type CreateProfileInput,
  type UpdateProfileInput,
} from "./profiles.js";

// Client types
export {
  ClientSchema,
  ClientListResponseSchema,
  ClientResponseSchema,
  CreateClientInputSchema,
  UpdateClientInputSchema,
  type Client,
  type ClientListResponse,
  type ClientResponse,
  type CreateClientInput,
  type UpdateClientInput,
} from "./clients.js";

// Contact types
export {
  ContactSchema,
  ContactListResponseSchema,
  ContactResponseSchema,
  CreateContactInputSchema,
  UpdateContactInputSchema,
  type Contact,
  type ContactListResponse,
  type ContactResponse,
  type CreateContactInput,
  type UpdateContactInput,
} from "./contacts.js";

// Project Group types
export {
  ProjectGroupSchema,
  ProjectGroupListResponseSchema,
  ProjectGroupResponseSchema,
  CreateProjectGroupInputSchema,
  UpdateProjectGroupInputSchema,
  type ProjectGroup,
  type ProjectGroupListResponse,
  type ProjectGroupResponse,
  type CreateProjectGroupInput,
  type UpdateProjectGroupInput,
} from "./groups.js";

// Leave types
export {
  LeaveSchema,
  LeaveListResponseSchema,
  LeaveResponseSchema,
  CreateLeaveInputSchema,
  UpdateLeaveInputSchema,
  type Leave,
  type LeaveListResponse,
  type LeaveResponse,
  type CreateLeaveInput,
  type UpdateLeaveInput,
} from "./leaves.js";

// Team types
export {
  TeamSchema,
  TeamListResponseSchema,
  TeamResponseSchema,
  TeamMemberSchema,
  CreateTeamInputSchema,
  UpdateTeamInputSchema,
  AddTeamMembersInputSchema,
  type Team,
  type TeamListResponse,
  type TeamResponse,
  type TeamMember,
  type CreateTeamInput,
  type UpdateTeamInput,
  type AddTeamMembersInput,
} from "./teams.js";

// Task List types
export {
  TaskListSchema,
  TaskListListResponseSchema,
  TaskListGetResponseSchema,
  CreateTaskListInputSchema,
  UpdateTaskListInputSchema,
  type TaskList,
  type TaskListListResponse,
  type TaskListGetResponse,
  type CreateTaskListInput,
  type UpdateTaskListInput,
} from "./tasklists.js";

// Phase (Milestone) types
export {
  PhaseSchema,
  PhaseListResponseSchema,
  PhaseResponseSchema,
  PhaseStatusSchema,
  CreatePhaseInputSchema,
  UpdatePhaseInputSchema,
  type Phase,
  type PhaseListResponse,
  type PhaseResponse,
  type PhaseStatus,
  type CreatePhaseInput,
  type UpdatePhaseInput,
} from "./phases.js";

// Issue (Bug) types
export {
  IssueSchema,
  IssueListResponseSchema,
  IssueResponseSchema,
  IssueStatusSchema,
  IssueSeveritySchema,
  IssueClassificationSchema,
  IssueModuleSchema,
  CreateIssueInputSchema,
  UpdateIssueInputSchema,
  type Issue,
  type IssueListResponse,
  type IssueResponse,
  type IssueStatus,
  type IssueSeverity,
  type IssueClassification,
  type IssueModule,
  type CreateIssueInput,
  type UpdateIssueInput,
} from "./issues.js";

// Forum types
export {
  ForumSchema,
  ForumListResponseSchema,
  ForumResponseSchema,
  ForumCategorySchema,
  CreateForumInputSchema,
  UpdateForumInputSchema,
  type Forum,
  type ForumListResponse,
  type ForumResponse,
  type ForumCategory,
  type CreateForumInput,
  type UpdateForumInput,
} from "./forums.js";

// Event types
export {
  EventSchema,
  EventListResponseSchema,
  EventResponseSchema,
  EventRecurrenceSchema,
  EventParticipantSchema,
  CreateEventInputSchema,
  UpdateEventInputSchema,
  type Event,
  type EventListResponse,
  type EventResponse,
  type EventRecurrence,
  type EventParticipant,
  type CreateEventInput,
  type UpdateEventInput,
} from "./events.js";

// Attachment types
export {
  AttachmentSchema,
  AttachmentListResponseSchema,
  AttachmentResponseSchema,
  UploadAttachmentInputSchema,
  ListAttachmentsParamsSchema,
  AssociateAttachmentInputSchema,
  AddAttachmentsToEntityInputSchema,
  type Attachment,
  type AttachmentListResponse,
  type AttachmentResponse,
  type UploadAttachmentInput,
  type ListAttachmentsParams,
  type AssociateAttachmentInput,
  type AddAttachmentsToEntityInput,
} from "./attachments.js";

// WorkDrive types (for V3 attachment uploads)
export {
  WorkDriveFileSchema,
  WorkDriveUploadResponseSchema,
  WorkDriveTeamFolderSchema,
  WorkDriveTeamSchema,
  WorkDriveUploadInputSchema,
  type WorkDriveFile,
  type WorkDriveUploadResponse,
  type WorkDriveTeamFolder,
  type WorkDriveTeam,
  type WorkDriveUploadInput,
} from "./workdrive.js";

// Document types
export {
  DocumentSchema,
  DocumentListResponseSchema,
  DocumentResponseSchema,
  DocumentFolderSchema,
  DocumentFolderListResponseSchema,
  UploadDocumentInputSchema,
  UpdateDocumentInputSchema,
  CreateDocumentFolderInputSchema,
  UpdateDocumentFolderInputSchema,
  type Document,
  type DocumentListResponse,
  type DocumentResponse,
  type DocumentFolder,
  type DocumentFolderListResponse,
  type UploadDocumentInput,
  type UpdateDocumentInput,
  type CreateDocumentFolderInput,
  type UpdateDocumentFolderInput,
} from "./documents.js";

// Comment types (polymorphic - attaches to tasks, bugs, forums, milestones, events)
export {
  CommentSchema,
  CommentListResponseSchema,
  CommentResponseSchema,
  CreateCommentInputSchema,
  UpdateCommentInputSchema,
  type Comment,
  type CommentListResponse,
  type CommentResponse,
  type CreateCommentInput,
  type UpdateCommentInput,
  type CommentableEntityType,
} from "./comments.js";

// Follower types (polymorphic - attaches to tasks, bugs, forums, milestones, events)
export {
  FollowerSchema,
  FollowerListResponseSchema,
  FollowerResponseSchema,
  AddFollowersInputSchema,
  type Follower,
  type FollowerListResponse,
  type FollowerResponse,
  type AddFollowersInput,
  type FollowableEntityType,
} from "./followers.js";

// Dashboard types
export {
  DashboardSchema,
  DashboardListResponseSchema,
  DashboardResponseSchema,
  CreateDashboardInputSchema,
  UpdateDashboardInputSchema,
  type Dashboard,
  type DashboardListResponse,
  type DashboardResponse,
  type CreateDashboardInput,
  type UpdateDashboardInput,
} from "./dashboards.js";

// Widget types (nested under dashboards)
export {
  WidgetSchema,
  WidgetListResponseSchema,
  WidgetResponseSchema,
  WidgetConfigSchema,
  CreateWidgetInputSchema,
  UpdateWidgetInputSchema,
  type Widget,
  type WidgetListResponse,
  type WidgetResponse,
  type WidgetConfig,
  type CreateWidgetInput,
  type UpdateWidgetInput,
} from "./widgets.js";

// Report types
export {
  ReportSchema,
  ReportListResponseSchema,
  ReportResponseSchema,
  ReportDataResponseSchema,
  ReportFilterSchema,
  ReportColumnSchema,
  ReportDataRowSchema,
  ReportQueryInputSchema,
  type Report,
  type ReportListResponse,
  type ReportResponse,
  type ReportDataResponse,
  type ReportFilter,
  type ReportColumn,
  type ReportDataRow,
  type ReportQueryInput,
} from "./reports.js";

// Search types
export {
  SearchResultSchema,
  SearchResponseSchema,
  SearchQueryInputSchema,
  type SearchResult,
  type SearchResponse,
  type SearchQueryInput,
  type SearchableEntityType,
} from "./search.js";

// Trash types
export {
  TrashItemSchema,
  TrashListResponseSchema,
  TrashRestoreResponseSchema,
  TrashFilterInputSchema,
  type TrashItem,
  type TrashListResponse,
  type TrashRestoreResponse,
  type TrashFilterInput,
  type TrashableEntityType,
} from "./trash.js";

// Portal types
export {
  PortalSchema,
  PortalListResponseSchema,
  PortalResponseSchema,
  type Portal,
  type PortalListResponse,
  type PortalResponse,
} from "./portals.js";

// Module types
export {
  ModuleSchema,
  ModuleListResponseSchema,
  ModuleFieldSchema,
  ModuleFieldListResponseSchema,
  FieldPickListOptionSchema,
  ModuleFilterInputSchema,
  type Module,
  type ModuleListResponse,
  type ModuleField,
  type ModuleFieldListResponse,
  type FieldPickListOption,
  type ModuleFilterInput,
} from "./modules.js";

// Timer types
export {
  TimerSchema,
  TimerResponseSchema,
  TimerListResponseSchema,
  StartTimerInputSchema,
  StopTimerInputSchema,
  PauseResumeTimerInputSchema,
  type Timer,
  type TimerResponse,
  type TimerListResponse,
  type StartTimerInput,
  type StopTimerInput,
  type PauseResumeTimerInput,
} from "./timers.js";

// Custom View types
export {
  CustomViewSchema,
  CustomViewListResponseSchema,
  CustomViewResponseSchema,
  CustomViewColumnSchema,
  CustomViewCriteriaSchema,
  CreateCustomViewInputSchema,
  UpdateCustomViewInputSchema,
  type CustomView,
  type CustomViewListResponse,
  type CustomViewResponse,
  type CustomViewColumn,
  type CustomViewCriteria,
  type CreateCustomViewInput,
  type UpdateCustomViewInput,
  type CustomViewEntityType,
} from "./customviews.js";

// Blueprint types
export {
  BlueprintSchema,
  BlueprintListResponseSchema,
  BlueprintResponseSchema,
  BlueprintTransitionSchema,
  BlueprintTransitionActionSchema,
  BlueprintFieldValueSchema,
  NextTransitionsResponseSchema,
  DuringActionsResponseSchema,
  ExecuteTransitionInputSchema,
  type Blueprint,
  type BlueprintListResponse,
  type BlueprintResponse,
  type BlueprintTransition,
  type BlueprintTransitionAction,
  type BlueprintFieldValue,
  type NextTransitionsResponse,
  type DuringActionsResponse,
  type ExecuteTransitionInput,
  type BlueprintModuleType,
} from "./blueprints.js";
