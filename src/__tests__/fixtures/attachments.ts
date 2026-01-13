/**
 * Attachment fixtures for testing
 */
import { faker } from "@faker-js/faker";
import type { Attachment } from "../../types/index.js";

export function createAttachmentFixture(overrides: Partial<Attachment> = {}): Attachment {
  const id = faker.string.numeric(15);
  const fileName = faker.system.fileName();
  return {
    id,
    name: fileName,
    filename: fileName,
    file_size: faker.number.int({ min: 1024, max: 10485760 }),
    file_size_string: faker.helpers.arrayElement(["1 KB", "500 KB", "1 MB", "5 MB"]),
    content_type: faker.system.mimeType(),
    mime_type: faker.system.mimeType(),
    extension: faker.system.fileExt(),
    url: faker.internet.url(),
    download_url: faker.internet.url(),
    preview_url: faker.internet.url(),
    thumbnail_url: faker.internet.url(),
    owner: {
      id: faker.string.numeric(10),
      name: faker.person.fullName(),
    },
    uploaded_by: {
      id: faker.string.numeric(10),
      name: faker.person.fullName(),
    },
    uploader_name: faker.person.fullName(),
    entity_type: faker.helpers.arrayElement(["task", "bug", "forum", "project"]),
    entity_id: faker.string.numeric(10),
    entity_name: faker.lorem.words(3),
    project: {
      id: faker.string.numeric(15),
      name: faker.company.name() + " Project",
    },
    created_time: faker.date.past().toISOString(),
    created_time_long: faker.date.past().getTime(),
    last_modified_time: faker.date.recent().toISOString(),
    last_modified_time_long: faker.date.recent().getTime(),
    ...overrides,
  };
}

export function createAttachmentListFixture(count: number = 5): Attachment[] {
  return Array.from({ length: count }, () => createAttachmentFixture());
}

export function createAttachmentListResponse(attachments: Attachment[], hasMore: boolean = false) {
  return {
    attachments,
    page_info: {
      page: 1,
      per_page: 100,
      has_more_page: hasMore,
      total_count: attachments.length,
    },
  };
}
