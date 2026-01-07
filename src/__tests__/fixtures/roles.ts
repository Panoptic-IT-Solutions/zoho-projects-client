import type { Role } from "../../types/index.js";

export const mockRole: Role = {
  id: "role_001",
  name: "Project Manager",
  description: "Can manage projects and team members",
  type: "manager",
  is_default: false,
  is_system: false,
  permissions: {
    create_project: true,
    edit_project: true,
    delete_project: false,
    manage_users: true,
  },
  created_time: "2024-01-01T00:00:00Z",
  created_time_long: 1704067200000,
  last_modified_time: "2024-01-15T12:00:00Z",
  last_modified_time_long: 1705320000000,
};

export const mockRoles: Role[] = [
  mockRole,
  {
    id: "role_002",
    name: "Admin",
    description: "Full administrative access",
    type: "admin",
    is_default: false,
    is_system: true,
  },
  {
    id: "role_003",
    name: "Employee",
    description: "Standard employee access",
    type: "employee",
    is_default: true,
    is_system: true,
  },
];
