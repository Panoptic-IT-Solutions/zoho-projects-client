import type { Report, ReportDataResponse } from "../../types/index.js";

export const mockReport: Report = {
  id: 3001,
  id_string: "3001",
  name: "Task Status Report",
  description: "Overview of task statuses across projects",
  type: "task",
  report_type: "status_summary",
  category: "tasks",
  is_public: true,
  is_shared: true,
  is_system: false,
  owner: { id: "user_001", name: "John Doe" },
  created_by: { id: "user_001", name: "John Doe" },
  filters: [
    { field: "status", operator: "in", value: ["open", "in_progress"] },
  ],
  columns: [
    { field: "name", label: "Task Name", sortable: true },
    { field: "status", label: "Status", sortable: true },
    { field: "owner", label: "Assignee", sortable: true },
    { field: "due_date", label: "Due Date", sortable: true },
  ],
  group_by: "status",
  sort_by: "due_date",
  sort_order: "asc",
  link: {
    self: { url: "https://projects.zoho.com/report/3001" },
    export: { url: "https://projects.zoho.com/report/3001/export" },
  },
  created_time: "2024-01-01T00:00:00Z",
  created_time_long: 1704067200000,
  last_modified_time: "2024-01-15T12:00:00Z",
  last_modified_time_long: 1705320000000,
};

export const mockReports: Report[] = [
  mockReport,
  {
    id: 3002,
    id_string: "3002",
    name: "Bug Tracker Report",
    description: "All bugs by severity",
    type: "bug",
    report_type: "severity_summary",
    category: "bugs",
    is_public: false,
    is_shared: false,
    is_system: true,
    columns: [
      { field: "title", label: "Bug Title" },
      { field: "severity", label: "Severity" },
      { field: "status", label: "Status" },
    ],
  },
];

export const mockReportData: ReportDataResponse = {
  data: [
    { name: "Task 1", status: "open", owner: "John Doe", due_date: "2024-01-20" },
    { name: "Task 2", status: "in_progress", owner: "Jane Smith", due_date: "2024-01-25" },
    { name: "Task 3", status: "open", owner: "Bob Wilson", due_date: "2024-01-30" },
  ],
  columns: [
    { field: "name", label: "Task Name" },
    { field: "status", label: "Status" },
    { field: "owner", label: "Assignee" },
    { field: "due_date", label: "Due Date" },
  ],
  total_count: 3,
  page_info: { page: 1, per_page: 100, has_more_page: false },
};
