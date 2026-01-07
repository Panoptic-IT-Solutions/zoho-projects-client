import type { Contact } from "../../types/index.js";

export const mockContact: Contact = {
  id: "contact_001",
  id_string: "contact_001",
  first_name: "Jane",
  last_name: "Smith",
  name: "Jane Smith",
  email: "jane.smith@acme.com",
  phone: "+1-555-123-4567",
  mobile: "+1-555-987-6543",
  designation: "Project Director",
  department: "Engineering",
  client_id: "client_001",
  client_name: "Acme Corporation",
  address: "123 Main Street",
  city: "San Francisco",
  state: "California",
  country: "United States",
  zip_code: "94105",
  created_time: "2024-01-01T00:00:00Z",
  created_time_long: 1704067200000,
  last_modified_time: "2024-01-15T12:00:00Z",
  last_modified_time_long: 1705320000000,
};

export const mockContacts: Contact[] = [
  mockContact,
  {
    id: "contact_002",
    id_string: "contact_002",
    first_name: "John",
    last_name: "Doe",
    name: "John Doe",
    email: "john.doe@techstart.io",
    phone: "+1-555-222-3333",
    designation: "CTO",
    department: "Technology",
    client_id: "client_002",
    client_name: "TechStart Inc",
  },
];
