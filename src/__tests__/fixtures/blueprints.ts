import type {
  Blueprint,
  BlueprintTransition,
  BlueprintTransitionAction,
} from "../../types/index.js";

export const mockBlueprintAction: BlueprintTransitionAction = {
  id: "action_001",
  name: "Add Comment",
  type: "field",
  is_mandatory: true,
  field_id: "comment",
  field_type: "textarea",
};

export const mockBlueprintTransition: BlueprintTransition = {
  id: "trans_001",
  name: "Move to In Progress",
  source_status: {
    id: "status_open",
    name: "Open",
  },
  target_status: {
    id: "status_in_progress",
    name: "In Progress",
  },
  before_actions: [],
  during_actions: [mockBlueprintAction],
  after_actions: [],
  execution_type: "manual",
  executor_users: ["user_001", "user_002"],
};

export const mockBlueprint: Blueprint = {
  id: "bp_001",
  id_string: "bp_001",
  name: "Task Workflow",
  description: "Standard task workflow with status transitions",
  module_id: "1001",
  module_name: "Tasks",
  is_active: true,
  transitions: [
    mockBlueprintTransition,
    {
      id: "trans_002",
      name: "Complete Task",
      source_status: {
        id: "status_in_progress",
        name: "In Progress",
      },
      target_status: {
        id: "status_completed",
        name: "Completed",
      },
      during_actions: [
        {
          id: "action_002",
          name: "Add Resolution",
          type: "field",
          is_mandatory: false,
          field_id: "resolution",
          field_type: "text",
        },
      ],
      execution_type: "manual",
    },
  ],
  created_time: "2024-01-01T00:00:00Z",
  created_time_long: 1704067200000,
  last_modified_time: "2024-01-15T12:00:00Z",
  last_modified_time_long: 1705320000000,
};

export const mockBlueprints: Blueprint[] = [
  mockBlueprint,
  {
    id: "bp_002",
    id_string: "bp_002",
    name: "Bug Resolution Workflow",
    description: "Workflow for bug tracking and resolution",
    module_id: "1002",
    module_name: "Bugs",
    is_active: true,
    transitions: [
      {
        id: "trans_003",
        name: "Start Investigation",
        source_status: {
          id: "status_new",
          name: "New",
        },
        target_status: {
          id: "status_investigating",
          name: "Investigating",
        },
        execution_type: "manual",
      },
    ],
  },
];

export const mockNextTransitionsResponse = {
  transitions: [mockBlueprintTransition],
  blueprint: {
    id: "bp_001",
    name: "Task Workflow",
  },
};

export const mockDuringActionsResponse = {
  actions: [mockBlueprintAction],
};
