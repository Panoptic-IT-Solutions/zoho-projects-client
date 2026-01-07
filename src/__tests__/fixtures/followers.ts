import type { Follower } from "../../types/index.js";

export const mockFollower: Follower = {
  id: "user_001",
  id_string: "user_001",
  name: "John Doe",
  email: "john@example.com",
  zpuid: "zpuid_001",
  profile_photo: "https://contacts.zoho.com/photo/user_001",
  profile_url: "https://contacts.zoho.com/user_001",
  followed_time: "2024-01-05T10:00:00Z",
  followed_time_long: 1704448800000,
};

export const mockFollowers: Follower[] = [
  mockFollower,
  {
    id: "user_002",
    id_string: "user_002",
    name: "Jane Smith",
    email: "jane@example.com",
    zpuid: "zpuid_002",
    followed_time: "2024-01-06T11:00:00Z",
    followed_time_long: 1704538800000,
  },
  {
    id: "user_003",
    id_string: "user_003",
    name: "Bob Wilson",
    email: "bob@example.com",
    zpuid: "zpuid_003",
    followed_time: "2024-01-07T12:00:00Z",
    followed_time_long: 1704628800000,
  },
];
