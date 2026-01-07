import type { Timer } from "../../types/index.js";

export const mockTimer: Timer = {
  id: "timer_001",
  id_string: "timer_001",
  status: "running",
  entity_id: "task_123",
  entity_type: "task",
  log_id: "log_001",
  start_time: "2024-01-15T09:00:00Z",
  start_time_long: 1705312800000,
  elapsed_time: 3600000,
  elapsed_time_string: "1:00:00",
  project_id: "proj_001",
  project: {
    id: "proj_001",
    name: "Test Project",
  },
  owner: {
    id: "user_001",
    name: "John Doe",
    email: "john@example.com",
  },
  notes: "Working on feature implementation",
  bill_status: "billable",
};

export const mockPausedTimer: Timer = {
  id: "timer_002",
  id_string: "timer_002",
  status: "paused",
  entity_id: "task_456",
  entity_type: "task",
  log_id: "log_002",
  start_time: "2024-01-15T10:00:00Z",
  start_time_long: 1705316400000,
  elapsed_time: 1800000,
  elapsed_time_string: "0:30:00",
  project_id: "proj_001",
  project: {
    id: "proj_001",
    name: "Test Project",
  },
  owner: {
    id: "user_001",
    name: "John Doe",
    email: "john@example.com",
  },
  notes: "Paused for meeting",
  bill_status: "billable",
};

export const mockTimers: Timer[] = [mockTimer, mockPausedTimer];
