import type { Widget } from "../../types/index.js";

export const mockWidget: Widget = {
  id: 2001,
  id_string: "2001",
  name: "Task Progress Chart",
  description: "Shows task completion progress",
  type: "chart",
  widget_type: "pie_chart",
  position: {
    row: 0,
    col: 0,
    width: 4,
    height: 2,
  },
  config: {
    chart_type: "pie",
    data_source: "tasks",
    filters: { status: "all" },
    display_options: { show_legend: true },
  },
  dashboard_id: "1001",
  link: {
    self: { url: "https://projects.zoho.com/widget/2001" },
  },
  created_time: "2024-01-01T00:00:00Z",
  created_time_long: 1704067200000,
  last_modified_time: "2024-01-15T12:00:00Z",
  last_modified_time_long: 1705320000000,
};

export const mockWidgets: Widget[] = [
  mockWidget,
  {
    id: 2002,
    id_string: "2002",
    name: "Recent Activity",
    description: "Shows recent project activity",
    type: "list",
    widget_type: "activity_feed",
    position: {
      row: 0,
      col: 4,
      width: 4,
      height: 3,
    },
    config: {
      data_source: "activity",
      filters: { limit: 10 },
    },
    dashboard_id: "1001",
  },
];
