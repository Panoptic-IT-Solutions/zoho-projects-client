/**
 * Comment fixtures for testing
 */
import { faker } from "@faker-js/faker";
import type { Comment } from "../../types/index.js";

export function createCommentFixture(overrides: Partial<Comment> = {}): Comment {
  const id = faker.number.int({ min: 100000, max: 999999 });
  return {
    id,
    id_string: id.toString(),
    content: faker.lorem.paragraph(),
    posted_by: {
      id: faker.string.numeric(10),
      name: faker.person.fullName(),
    },
    posted_person: faker.person.fullName(),
    author_name: faker.person.fullName(),
    entity_type: faker.helpers.arrayElement(["task", "bug", "forum", "milestone", "event"]),
    entity_id: faker.string.numeric(10),
    attachments: [],
    mentions: [],
    posted_time: faker.date.past().toISOString(),
    posted_time_long: faker.date.past().getTime(),
    last_modified_time: faker.date.recent().toISOString(),
    last_modified_time_long: faker.date.recent().getTime(),
    ...overrides,
  };
}

export function createCommentListFixture(count: number = 5): Comment[] {
  return Array.from({ length: count }, () => createCommentFixture());
}

export function createCommentListResponse(comments: Comment[], hasMore: boolean = false) {
  return {
    comments,
    page_info: {
      page: 1,
      per_page: 100,
      has_more_page: hasMore,
      total_count: comments.length,
    },
  };
}
