import type { TrashItem, TrashRestoreResponse } from "../../types/index.js";

export const mockTrashItem: TrashItem = {
  id: "task_deleted_001",
  id_string: "task_deleted_001",
  name: "Old Task",
  title: "Old Task",
  entity_type: "task",
  module: "tasks",
  description: "A task that was deleted",
  project: {
    id: 12345,
    id_string: "12345",
    name: "Test Project",
  },
  deleted_by: { id: "user_001", name: "John Doe" },
  deleted_person: "John Doe",
  deleted_time: "2024-01-10T14:30:00Z",
  deleted_time_long: 1704896200000,
  created_by: { id: "user_002", name: "Jane Smith" },
  created_time: "2024-01-01T00:00:00Z",
  created_time_long: 1704067200000,
  days_remaining: 20,
  link: {
    self: { url: "https://projects.zoho.com/trash/task_deleted_001" },
    restore: { url: "https://projects.zoho.com/trash/task_deleted_001/restore" },
  },
};

export const mockTrashItems: TrashItem[] = [
  mockTrashItem,
  {
    id: "bug_deleted_001",
    id_string: "bug_deleted_001",
    name: "Resolved Bug",
    entity_type: "bug",
    module: "bugs",
    description: "A bug that was resolved and deleted",
    project: {
      id: 12345,
      id_string: "12345",
      name: "Test Project",
    },
    deleted_by: { id: "user_001", name: "John Doe" },
    deleted_time: "2024-01-12T10:00:00Z",
    deleted_time_long: 1705053600000,
    days_remaining: 22,
  },
  {
    id: "milestone_deleted_001",
    id_string: "milestone_deleted_001",
    name: "Q3 Milestone",
    entity_type: "milestone",
    module: "milestones",
    deleted_by: { id: "user_002", name: "Jane Smith" },
    deleted_time: "2024-01-14T16:00:00Z",
    deleted_time_long: 1705248000000,
    days_remaining: 24,
  },
];

export const mockTrashRestoreResponse: TrashRestoreResponse = {
  restored: true,
  message: "Item restored successfully",
};
