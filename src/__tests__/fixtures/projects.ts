/**
 * Project fixtures for testing
 */
import { faker } from "@faker-js/faker";
import type { Project } from "../../types/index.js";

/**
 * Create a mock project fixture
 */
export function createProjectFixture(overrides: Partial<Project> = {}): Project {
  const id = faker.number.int({ min: 100000, max: 999999 });
  return {
    id,
    id_string: id.toString(),
    name: faker.company.name() + " Project",
    description: faker.lorem.paragraph(),
    status: "active",
    owner_name: faker.person.fullName(),
    owner_id: faker.string.numeric(10),
    created_date: faker.date.past().toISOString().split("T")[0],
    created_date_long: faker.date.past().getTime(),
    created_date_format: faker.date.past().toLocaleDateString("en-US"),
    ...overrides,
  };
}

/**
 * Create multiple project fixtures
 */
export function createProjectListFixture(count: number = 5): Project[] {
  return Array.from({ length: count }, () => createProjectFixture());
}

/**
 * Create a project API response
 */
export function createProjectListResponse(
  projects: Project[],
  hasMore: boolean = false
) {
  return {
    projects,
    page_info: {
      page: 1,
      per_page: 100,
      has_more_page: hasMore,
      total_count: projects.length,
    },
  };
}
