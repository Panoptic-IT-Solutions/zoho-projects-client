/**
 * TaskList fixtures for testing
 */
import { faker } from "@faker-js/faker";
import type { TaskList } from "../../types/index.js";

export function createTasklistFixture(overrides: Partial<TaskList> = {}): TaskList {
  const id = faker.number.int({ min: 100000, max: 999999 });
  return {
    id,
    id_string: id.toString(),
    name: faker.company.buzzNoun() + " Tasks",
    flag: faker.helpers.arrayElement(["internal", "external"]),
    completed: faker.datatype.boolean(),
    sequence: faker.number.int({ min: 1, max: 100 }),
    ...overrides,
  };
}

export function createTasklistListFixture(count: number = 5): TaskList[] {
  return Array.from({ length: count }, () => createTasklistFixture());
}

export function createTasklistListResponse(tasklists: TaskList[], hasMore: boolean = false) {
  return {
    tasklists,
    page_info: {
      page: 1,
      per_page: 100,
      has_more_page: hasMore,
      total_count: tasklists.length,
    },
  };
}
