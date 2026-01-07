import type { SearchResult, SearchResponse } from "../../types/index.js";

export const mockSearchResult: SearchResult = {
  id: "task_001",
  id_string: "task_001",
  name: "Implement search functionality",
  title: "Implement search functionality",
  entity_type: "task",
  module: "tasks",
  description: "Add full-text search to the application",
  snippet: "...implement <em>search</em> functionality for users...",
  project: {
    id: 12345,
    id_string: "12345",
    name: "Test Project",
  },
  status: "open",
  status_name: "Open",
  owner_name: "John Doe",
  created_by: "user_001",
  created_time: "2024-01-01T00:00:00Z",
  created_time_long: 1704067200000,
  link: {
    self: { url: "https://projects.zoho.com/task/task_001" },
    web: { url: "https://projects.zoho.com/portal/test/tasks/task_001" },
  },
};

export const mockSearchResults: SearchResult[] = [
  mockSearchResult,
  {
    id: "bug_001",
    id_string: "bug_001",
    name: "Search results not loading",
    title: "Search results not loading",
    entity_type: "bug",
    module: "bugs",
    description: "Search functionality returns empty results",
    snippet: "...<em>search</em> results not loading properly...",
    project: {
      id: 12345,
      id_string: "12345",
      name: "Test Project",
    },
    status: "open",
    owner_name: "Jane Smith",
  },
  {
    id: 12345,
    id_string: "12345",
    name: "Search Project",
    entity_type: "project",
    module: "projects",
    description: "Project for search feature development",
    snippet: "...<em>search</em> project development...",
  },
];

export const mockSearchResponse: SearchResponse = {
  results: mockSearchResults,
  search_results: mockSearchResults,
  total_count: 3,
  page_info: { page: 1, per_page: 100, has_more_page: false },
};
