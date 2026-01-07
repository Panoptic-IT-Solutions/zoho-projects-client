import type { Portal } from "../../types/index.js";

export const mockPortal: Portal = {
  id: "123456789",
  id_string: "123456789",
  name: "Test Portal",
  default: true,
  gmt_time_zone: "America/Los_Angeles",
  role: "admin",
  plan: "premium",
  plan_type: "paid",
  locale: {
    code: "en_US",
    language: "English",
    country: "United States",
  },
  settings: {
    company_name: "Test Company",
    website_url: "https://example.com",
    time_zone: "America/Los_Angeles",
    date_format: "MM-dd-yyyy",
  },
  link: {
    project: {
      url: "https://projects.zoho.com/portal/test",
    },
  },
  project_count: {
    template: 2,
    archived: 5,
    active: 10,
  },
  available_projects: 100,
  available_users: 50,
  extensions: ["sprints", "timesheet"],
};

export const mockPortals: Portal[] = [
  mockPortal,
  {
    id: "987654321",
    id_string: "987654321",
    name: "Secondary Portal",
    default: false,
    gmt_time_zone: "Europe/London",
    role: "manager",
    plan: "standard",
    plan_type: "paid",
  },
];
