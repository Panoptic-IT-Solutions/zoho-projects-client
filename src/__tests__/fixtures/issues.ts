/**
 * Issue (Bug) fixtures for testing
 */
import { faker } from "@faker-js/faker";
import type { Issue } from "../../types/index.js";

export function createIssueFixture(overrides: Partial<Issue> = {}): Issue {
  const id = faker.number.int({ min: 100000, max: 999999 });
  return {
    id,
    id_string: id.toString(),
    key: `PROJ-B${faker.number.int({ min: 1, max: 999 })}`,
    title: faker.lorem.sentence(4),
    description: faker.lorem.paragraph(),
    status: {
      id: faker.number.int({ min: 1, max: 5 }),
      name: faker.helpers.arrayElement(["Open", "In Progress", "Fixed", "Closed"]),
      type: faker.helpers.arrayElement(["open", "closed"]),
      color_code: faker.color.rgb(),
    },
    severity: {
      id: faker.number.int({ min: 1, max: 5 }),
      name: faker.helpers.arrayElement(["Critical", "Major", "Minor", "Trivial"]),
    },
    classification: {
      id: faker.number.int({ min: 1, max: 5 }),
      name: faker.helpers.arrayElement(["Bug", "Feature", "Enhancement", "Task"]),
    },
    reproducible: faker.helpers.arrayElement(["Always", "Sometimes", "Rarely", "Unable"]),
    module: {
      id: faker.number.int({ min: 1, max: 10 }),
      name: faker.helpers.arrayElement(["Core", "UI", "API", "Database", "Auth"]),
    },
    priority: faker.helpers.arrayElement(["None", "Low", "Medium", "High"]),
    due_date: faker.date.future().toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }),
    due_date_long: faker.date.future().getTime(),
    created_time: faker.date.past().toISOString(),
    created_time_long: faker.date.past().getTime(),
    last_updated_time: faker.date.recent().toISOString(),
    last_updated_time_long: faker.date.recent().getTime(),
    reported_by: faker.string.numeric(10),
    reported_person: faker.person.fullName(),
    reporter: {
      id: faker.string.numeric(10),
      name: faker.person.fullName(),
    },
    assignee: {
      id: faker.string.numeric(10),
      name: faker.person.fullName(),
    },
    assignee_name: faker.person.fullName(),
    flag: faker.helpers.arrayElement(["internal", "external"]),
    project: {
      id: faker.number.int({ min: 100000, max: 999999 }),
      id_string: faker.string.numeric(10),
      name: faker.company.name() + " Project",
    },
    linked_tasks_count: faker.number.int({ min: 0, max: 10 }),
    attachment_count: faker.number.int({ min: 0, max: 5 }),
    comment_count: faker.number.int({ min: 0, max: 20 }),
    ...overrides,
  };
}

export function createIssueListFixture(count: number = 5): Issue[] {
  return Array.from({ length: count }, () => createIssueFixture());
}

export function createIssueListResponse(issues: Issue[], hasMore: boolean = false) {
  return {
    bugs: issues,
    page_info: {
      page: 1,
      per_page: 100,
      has_more_page: hasMore,
      total_count: issues.length,
    },
  };
}
