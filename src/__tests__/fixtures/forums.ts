/**
 * Forum fixtures for testing
 */
import { faker } from "@faker-js/faker";
import type { Forum } from "../../types/index.js";

export function createForumFixture(overrides: Partial<Forum> = {}): Forum {
  const id = faker.number.int({ min: 100000, max: 999999 });
  return {
    id,
    id_string: id.toString(),
    name: faker.lorem.sentence(4),
    content: faker.lorem.paragraphs(2),
    category: {
      id: faker.number.int({ min: 1, max: 10 }),
      name: faker.helpers.arrayElement(["General", "Ideas", "Questions", "Announcements"]),
    },
    is_sticky: faker.datatype.boolean(),
    is_announcement: faker.datatype.boolean(),
    is_closed: faker.datatype.boolean(),
    flag: faker.helpers.arrayElement(["internal", "external"]),
    posted_by: {
      id: faker.string.numeric(10),
      name: faker.person.fullName(),
    },
    posted_person: faker.person.fullName(),
    comment_count: faker.number.int({ min: 0, max: 50 }),
    view_count: faker.number.int({ min: 0, max: 500 }),
    project: {
      id: faker.number.int({ min: 100000, max: 999999 }),
      id_string: faker.string.numeric(10),
      name: faker.company.name() + " Project",
    },
    posted_time: faker.date.past().toISOString(),
    posted_time_long: faker.date.past().getTime(),
    last_updated_time: faker.date.recent().toISOString(),
    last_updated_time_long: faker.date.recent().getTime(),
    ...overrides,
  };
}

export function createForumListFixture(count: number = 5): Forum[] {
  return Array.from({ length: count }, () => createForumFixture());
}

export function createForumListResponse(forums: Forum[], hasMore: boolean = false) {
  return {
    forums,
    page_info: {
      page: 1,
      per_page: 100,
      has_more_page: hasMore,
      total_count: forums.length,
    },
  };
}
