import type { CustomView } from "../../types/index.js";

export const mockCustomView: CustomView = {
  id: "cv_001",
  id_string: "cv_001",
  name: "My Active Tasks",
  description: "All active tasks assigned to me",
  module_id: "1001",
  module_name: "Tasks",
  access_type: "private",
  accessed_by: ["user_001"],
  project_accessibility_type: "all",
  view_type: "list",
  is_mytasks_view_enabled: true,
  is_customised_column_view_enabled: true,
  customised_columns: [
    { id: "1", name: "Name", sequence: 1 },
    { id: "2", name: "Status", sequence: 2 },
    { id: "3", name: "Due Date", sequence: 3 },
  ],
  criteria: [
    {
      api_name: "status",
      field_name: "Status",
      criteria_condition: "equals",
      value: "In Progress",
    },
    {
      api_name: "owner",
      field_name: "Owner",
      criteria_condition: "is",
      value: "${CURRENT_USER}",
    },
  ],
  criteria_pattern: "(1 AND 2)",
  is_default: false,
  is_system_view: false,
  created_time: "2024-01-01T00:00:00Z",
  created_time_long: 1704067200000,
  last_modified_time: "2024-01-15T12:00:00Z",
  last_modified_time_long: 1705320000000,
};

export const mockSystemView: CustomView = {
  id: "cv_system_001",
  id_string: "cv_system_001",
  name: "All Tasks",
  description: "System view showing all tasks",
  module_id: "1001",
  module_name: "Tasks",
  access_type: "all",
  project_accessibility_type: "all",
  view_type: "list",
  is_default: true,
  is_system_view: true,
};

export const mockCustomViews: CustomView[] = [mockCustomView, mockSystemView];
