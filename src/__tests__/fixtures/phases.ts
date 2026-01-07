/**
 * Phase (Milestone) fixtures for testing
 */
import { faker } from "@faker-js/faker";
import type { Phase } from "../../types/index.js";

export function createPhaseFixture(overrides: Partial<Phase> = {}): Phase {
  const id = faker.number.int({ min: 100000, max: 999999 });
  return {
    id,
    id_string: id.toString(),
    name: faker.company.buzzNoun() + " Milestone",
    description: faker.lorem.sentence(),
    sequence: faker.number.int({ min: 1, max: 100 }),
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
    status: {
      id: faker.number.int({ min: 1, max: 5 }),
      name: faker.helpers.arrayElement(["Open", "In Progress", "Completed"]),
      color_code: faker.color.rgb(),
    },
    status_name: faker.helpers.arrayElement(["Open", "In Progress", "Completed"]),
    completed: faker.datatype.boolean(),
    percent_complete: faker.number.int({ min: 0, max: 100 }),
    owner: {
      id: faker.string.numeric(10),
      name: faker.person.fullName(),
    },
    owner_id: faker.string.numeric(10),
    owner_name: faker.person.fullName(),
    flag: faker.helpers.arrayElement(["internal", "external"]),
    open_task_count: faker.number.int({ min: 0, max: 50 }),
    closed_task_count: faker.number.int({ min: 0, max: 50 }),
    project: {
      id: faker.number.int({ min: 100000, max: 999999 }),
      id_string: faker.string.numeric(10),
      name: faker.company.name() + " Project",
    },
    created_time: faker.date.past().toISOString(),
    created_time_long: faker.date.past().getTime(),
    last_updated_time: faker.date.recent().toISOString(),
    last_updated_time_long: faker.date.recent().getTime(),
    ...overrides,
  };
}

export function createPhaseListFixture(count: number = 5): Phase[] {
  return Array.from({ length: count }, () => createPhaseFixture());
}

export function createPhaseListResponse(phases: Phase[], hasMore: boolean = false) {
  return {
    milestones: phases,
    page_info: {
      page: 1,
      per_page: 100,
      has_more_page: hasMore,
      total_count: phases.length,
    },
  };
}
