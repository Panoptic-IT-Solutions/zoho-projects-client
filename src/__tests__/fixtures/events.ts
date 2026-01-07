/**
 * Event fixtures for testing
 */
import { faker } from "@faker-js/faker";
import type { Event } from "../../types/index.js";

export function createEventFixture(overrides: Partial<Event> = {}): Event {
  const id = faker.number.int({ min: 100000, max: 999999 });
  return {
    id,
    id_string: id.toString(),
    title: faker.lorem.sentence(4),
    description: faker.lorem.paragraph(),
    start_date: faker.date.future().toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }),
    start_date_long: faker.date.future().getTime(),
    end_date: faker.date.future().toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }),
    end_date_long: faker.date.future().getTime(),
    start_time: faker.helpers.arrayElement(["09:00", "10:00", "14:00", "15:00"]),
    end_time: faker.helpers.arrayElement(["10:00", "11:00", "15:00", "16:00"]),
    is_all_day: faker.datatype.boolean(),
    location: faker.location.streetAddress(),
    scheduled_by: {
      id: faker.string.numeric(10),
      name: faker.person.fullName(),
    },
    scheduler_name: faker.person.fullName(),
    participants: [
      {
        id: faker.number.int({ min: 100000, max: 999999 }),
        id_string: faker.string.numeric(10),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        status: faker.helpers.arrayElement(["accepted", "declined", "tentative", "pending"]),
      },
    ],
    is_recurring: faker.datatype.boolean(),
    reminder: {
      time: faker.number.int({ min: 5, max: 60 }),
      unit: faker.helpers.arrayElement(["minutes", "hours", "days"]),
    },
    status: faker.helpers.arrayElement(["scheduled", "completed", "cancelled"]),
    flag: faker.helpers.arrayElement(["internal", "external"]),
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

export function createEventListFixture(count: number = 5): Event[] {
  return Array.from({ length: count }, () => createEventFixture());
}

export function createEventListResponse(events: Event[], hasMore: boolean = false) {
  return {
    events,
    page_info: {
      page: 1,
      per_page: 100,
      has_more_page: hasMore,
      total_count: events.length,
    },
  };
}
