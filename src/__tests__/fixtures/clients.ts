import type { Client } from "../../types/index.js";

export const mockClient: Client = {
  id: "client_001",
  id_string: "client_001",
  name: "Acme Corporation",
  email: "contact@acme.com",
  phone: "+1-555-123-4567",
  website: "https://acme.com",
  address: "123 Main Street",
  city: "San Francisco",
  state: "California",
  country: "United States",
  zip_code: "94105",
  currency_code: "USD",
  projects_count: 5,
  contacts_count: 3,
  created_time: "2024-01-01T00:00:00Z",
  created_time_long: 1704067200000,
  last_modified_time: "2024-01-15T12:00:00Z",
  last_modified_time_long: 1705320000000,
};

export const mockClients: Client[] = [
  mockClient,
  {
    id: "client_002",
    id_string: "client_002",
    name: "TechStart Inc",
    email: "hello@techstart.io",
    phone: "+1-555-987-6543",
    website: "https://techstart.io",
    city: "New York",
    state: "New York",
    country: "United States",
    currency_code: "USD",
    projects_count: 2,
    contacts_count: 1,
  },
];
