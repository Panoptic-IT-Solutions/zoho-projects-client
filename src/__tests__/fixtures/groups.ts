/**
 * Project Group fixtures for testing
 */
import { faker } from "@faker-js/faker";
import type { ProjectGroup } from "../../types/index.js";

export function createGroupFixture(overrides: Partial<ProjectGroup> = {}): ProjectGroup {
  const id = faker.string.numeric(10);
  return {
    id,
    id_string: id,
    name: faker.company.buzzNoun() + " Group",
    description: faker.lorem.sentence(),
    projects_count: faker.number.int({ min: 0, max: 50 }),
    owner_id: faker.string.numeric(10),
    owner_name: faker.person.fullName(),
    created_time: faker.date.past().toISOString(),
    created_time_long: faker.date.past().getTime(),
    last_modified_time: faker.date.recent().toISOString(),
    last_modified_time_long: faker.date.recent().getTime(),
    ...overrides,
  };
}

export function createGroupListFixture(count: number = 5): ProjectGroup[] {
  return Array.from({ length: count }, () => createGroupFixture());
}

export function createGroupListResponse(groups: ProjectGroup[], hasMore: boolean = false) {
  return {
    groups,
    page_info: {
      page: 1,
      per_page: 100,
      has_more_page: hasMore,
      total_count: groups.length,
    },
  };
}
