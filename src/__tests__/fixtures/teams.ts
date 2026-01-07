import type { Team, TeamMember } from "../../types/index.js";

export const mockTeamMember: TeamMember = {
  id: "user_001",
  name: "John Doe",
  email: "john@example.com",
  zpuid: "zpuid_001",
};

export const mockTeam: Team = {
  id: "team_001",
  id_string: "team_001",
  name: "Engineering Team",
  description: "Core engineering team",
  members: [
    mockTeamMember,
    { id: "user_002", name: "Jane Smith", email: "jane@example.com" },
    { id: "user_003", name: "Bob Wilson", email: "bob@example.com" },
  ],
  members_count: 3,
  lead_id: "user_001",
  lead_name: "John Doe",
  projects_count: 5,
  created_time: "2024-01-01T00:00:00Z",
  created_time_long: 1704067200000,
  last_modified_time: "2024-01-15T12:00:00Z",
  last_modified_time_long: 1705320000000,
};

export const mockTeams: Team[] = [
  mockTeam,
  {
    id: "team_002",
    id_string: "team_002",
    name: "Design Team",
    description: "UX and UI design team",
    members: [{ id: "user_004", name: "Alice Brown", email: "alice@example.com" }],
    members_count: 1,
    lead_id: "user_004",
    lead_name: "Alice Brown",
    projects_count: 3,
  },
];
