/**
 * Tag fixtures for testing
 */
import { faker } from "@faker-js/faker";
import type { Tag } from "../../types/index.js";

export function createTagFixture(overrides: Partial<Tag> = {}): Tag {
  const id = faker.number.int({ min: 100000, max: 999999 });
  return {
    id,
    id_string: id.toString(),
    name: faker.word.noun(),
    color_class: faker.helpers.arrayElement(["tag-blue", "tag-red", "tag-green", "tag-yellow"]),
    color_code: faker.color.rgb(),
    count: faker.number.int({ min: 0, max: 100 }),
    created_time: faker.date.past().toISOString(),
    created_time_long: faker.date.past().getTime(),
    ...overrides,
  };
}

export function createTagListFixture(count: number = 5): Tag[] {
  return Array.from({ length: count }, () => createTagFixture());
}

export function createTagListResponse(tags: Tag[], hasMore: boolean = false) {
  return {
    tags,
    page_info: {
      page: 1,
      per_page: 100,
      has_more_page: hasMore,
      total_count: tags.length,
    },
  };
}
