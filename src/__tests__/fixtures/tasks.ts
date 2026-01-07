/**
 * Task fixtures for testing
 */
import { faker } from "@faker-js/faker";
import type { Task } from "../../types/index.js";

/**
 * Create a mock task fixture
 */
export function createTaskFixture(overrides: Partial<Task> = {}): Task {
  const id = faker.number.int({ min: 100000, max: 999999 });
  return {
    id,
    id_string: id.toString(),
    key: `TASK-${id}`,
    name: faker.lorem.sentence(4),
    description: faker.lorem.paragraph(),
    status: {
      id: 1,
      name: "Open",
      type: "open",
      color_code: "#4caf50",
    },
    completed: false,
    percent_complete: faker.number.int({ min: 0, max: 100 }),
    priority: faker.helpers.arrayElement(["None", "Low", "Medium", "High"]),
    start_date: faker.date.past().toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }),
    start_date_long: faker.date.past().getTime(),
    end_date: faker.date.future().toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }),
    end_date_long: faker.date.future().getTime(),
    created_time: faker.date.past().toISOString(),
    created_time_long: faker.date.past().getTime(),
    created_by: faker.string.numeric(10),
    created_person: faker.person.fullName(),
    project: {
      id: faker.number.int({ min: 100000, max: 999999 }),
      id_string: faker.string.numeric(10),
      name: faker.company.name() + " Project",
    },
    ...overrides,
  };
}

/**
 * Create multiple task fixtures
 */
export function createTaskListFixture(count: number = 5): Task[] {
  return Array.from({ length: count }, () => createTaskFixture());
}

/**
 * Create a task API response
 */
export function createTaskListResponse(tasks: Task[], hasMore: boolean = false) {
  return {
    tasks,
    page_info: {
      page: 1,
      per_page: 100,
      has_more_page: hasMore,
      total_count: tasks.length,
    },
  };
}
