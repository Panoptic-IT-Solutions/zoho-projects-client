import type { Profile } from "../../types/index.js";

export const mockProfile: Profile = {
  id: "profile_001",
  name: "Standard User",
  description: "Default profile for regular users",
  type: "standard",
  is_default: true,
  is_system: false,
  users_count: 15,
  created_time: "2024-01-01T00:00:00Z",
  created_time_long: 1704067200000,
  last_modified_time: "2024-01-15T12:00:00Z",
  last_modified_time_long: 1705320000000,
};

export const mockProfiles: Profile[] = [
  mockProfile,
  {
    id: "profile_002",
    name: "Administrator",
    description: "Full access profile",
    type: "admin",
    is_default: false,
    is_system: true,
    users_count: 3,
  },
  {
    id: "profile_003",
    name: "Viewer",
    description: "Read-only access",
    type: "viewer",
    is_default: false,
    is_system: false,
    users_count: 8,
  },
];
