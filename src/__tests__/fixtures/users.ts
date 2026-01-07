/**
 * User fixtures for testing
 */
import { faker } from "@faker-js/faker";
import type { User } from "../../types/index.js";

/**
 * Create a mock user fixture
 */
export function createUserFixture(overrides: Partial<User> = {}): User {
  const id = faker.string.numeric(10);
  return {
    id,
    zpuid: faker.string.numeric(15),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    active: true,
    role: faker.helpers.arrayElement(["Admin", "Manager", "Member", "Viewer"]),
    role_name: faker.helpers.arrayElement(["Admin", "Manager", "Member", "Viewer"]),
    role_id: faker.string.numeric(5),
    profile_id: faker.string.numeric(5),
    rate: faker.finance.amount({ min: 50, max: 200 }),
    cost_per_hour: faker.finance.amount({ min: 30, max: 100 }),
    added_time: faker.date.past().toISOString(),
    added_time_long: faker.date.past().getTime(),
    ...overrides,
  };
}

/**
 * Create multiple user fixtures
 */
export function createUserListFixture(count: number = 5): User[] {
  return Array.from({ length: count }, () => createUserFixture());
}

/**
 * Create a user API response
 */
export function createUserListResponse(users: User[], hasMore: boolean = false) {
  return {
    users,
    page_info: {
      page: 1,
      per_page: 100,
      has_more_page: hasMore,
      total_count: users.length,
    },
  };
}
