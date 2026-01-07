import type { Dashboard } from "../../types/index.js";

export const mockDashboard: Dashboard = {
  id: 1001,
  id_string: "1001",
  name: "Project Overview",
  description: "Main project dashboard",
  type: "project",
  is_default: true,
  owner: { id: "user_001", name: "John Doe" },
  created_by: { id: "user_001", name: "John Doe" },
  is_shared: true,
  shared_with: [{ id: "user_002", name: "Jane Smith" }],
  project: {
    id: 12345,
    id_string: "12345",
    name: "Test Project",
  },
  widget_count: 5,
  layout: "grid",
  link: {
    self: { url: "https://projects.zoho.com/dashboard/1001" },
    widgets: { url: "https://projects.zoho.com/dashboard/1001/widgets" },
  },
  created_time: "2024-01-01T00:00:00Z",
  created_time_long: 1704067200000,
  last_modified_time: "2024-01-15T12:00:00Z",
  last_modified_time_long: 1705320000000,
};

export const mockDashboards: Dashboard[] = [
  mockDashboard,
  {
    id: 1002,
    id_string: "1002",
    name: "Personal Dashboard",
    description: "My tasks and assignments",
    type: "personal",
    is_default: false,
    owner: { id: "user_001", name: "John Doe" },
    is_shared: false,
    widget_count: 3,
  },
];
