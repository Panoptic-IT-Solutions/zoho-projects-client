/**
 * TimeLog fixtures for testing
 */
import { faker } from "@faker-js/faker";
import type { TimeLog } from "../../types/index.js";

/**
 * Create a mock timelog fixture
 */
export function createTimeLogFixture(overrides: Partial<TimeLog> = {}): TimeLog {
  const id = faker.number.int({ min: 100000, max: 999999 });
  const hours = faker.number.int({ min: 0, max: 8 });
  const minutes = faker.number.int({ min: 0, max: 59 });
  return {
    id,
    id_string: id.toString(),
    hours,
    minutes,
    hours_display: `${hours}:${minutes.toString().padStart(2, "0")}`,
    total_minutes: hours * 60 + minutes,
    log_date: faker.date.recent().toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }),
    log_date_long: faker.date.recent().getTime(),
    owner_id: faker.number.int({ min: 100000, max: 999999 }),
    owner_name: faker.person.fullName(),
    owner_zpuid: faker.string.numeric(15),
    bill_status: faker.helpers.arrayElement(["Billable", "Non Billable"]),
    approval_status: faker.helpers.arrayElement(["Approved", "Pending", "Rejected"]),
    notes: faker.lorem.sentence(),
    task: {
      id: faker.number.int({ min: 100000, max: 999999 }),
      id_string: faker.string.numeric(10),
      name: faker.lorem.sentence(3),
    },
    project: {
      id: faker.number.int({ min: 100000, max: 999999 }),
      id_string: faker.string.numeric(10),
      name: faker.company.name() + " Project",
    },
    ...overrides,
  };
}

/**
 * Create multiple timelog fixtures
 */
export function createTimeLogListFixture(count: number = 5): TimeLog[] {
  return Array.from({ length: count }, () => createTimeLogFixture());
}

/**
 * Create a timelog API response (nested date structure)
 */
export function createTimeLogListResponse(
  timelogs: TimeLog[],
  hasMore: boolean = false
) {
  // Group by date
  const dateGroups = new Map<string, TimeLog[]>();
  for (const log of timelogs) {
    const date = log.log_date || "01-01-2025";
    if (!dateGroups.has(date)) {
      dateGroups.set(date, []);
    }
    dateGroups.get(date)!.push(log);
  }

  return {
    timelogs: {
      date: Array.from(dateGroups.entries()).map(([date, logs]) => ({
        date,
        display_format: date,
        tasklogs: logs,
      })),
    },
    page_info: {
      page: 1,
      per_page: 100,
      has_more_page: hasMore,
      total_count: timelogs.length,
    },
  };
}
