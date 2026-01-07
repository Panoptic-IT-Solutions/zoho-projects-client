# Zoho Projects OAuth 2.0 Setup Guide

This guide explains how to set up OAuth 2.0 authentication for the Zoho Projects API.

## Prerequisites

1. A Zoho account
2. Access to Zoho Projects
3. Access to Zoho API Console

## Step 1: Create a Zoho API Client

1. Go to [Zoho API Console](https://api-console.zoho.com/)
2. Click "Add Client"
3. Choose "Server-based Applications"
4. Fill in the details:
   - **Client Name**: Your application name
   - **Homepage URL**: Your application URL
   - **Authorized Redirect URIs**: `http://localhost:3000/callback` (for local development)
5. Click "Create"
6. Note down the **Client ID** and **Client Secret**

## Step 2: Get Authorization Code

Open this URL in your browser (replace placeholders):

```
https://accounts.zoho.com/oauth/v2/auth?
  client_id=YOUR_CLIENT_ID&
  response_type=code&
  scope=ZohoProjects.projects.ALL,ZohoProjects.tasks.ALL,ZohoProjects.users.ALL,ZohoProjects.timesheets.ALL,ZohoProjects.bugs.ALL,ZohoProjects.forums.ALL,ZohoProjects.events.ALL,ZohoProjects.documents.ALL&
  redirect_uri=http://localhost:3000/callback&
  access_type=offline&
  prompt=consent
```

### Available Scopes

| Scope | Description |
|-------|-------------|
| `ZohoProjects.projects.ALL` | Projects CRUD |
| `ZohoProjects.tasks.ALL` | Tasks and task lists |
| `ZohoProjects.users.ALL` | Users and roles |
| `ZohoProjects.timesheets.ALL` | Time logs |
| `ZohoProjects.bugs.ALL` | Issues/bugs |
| `ZohoProjects.forums.ALL` | Forums |
| `ZohoProjects.events.ALL` | Events/calendar |
| `ZohoProjects.documents.ALL` | Documents |
| `ZohoProjects.portals.ALL` | Portal settings |

Use `ZohoProjects.ALL` for full access to all Zoho Projects resources.

## Step 3: Exchange Code for Tokens

After authorization, you'll be redirected to your callback URL with a `code` parameter.

Exchange it for tokens:

```bash
curl -X POST "https://accounts.zoho.com/oauth/v2/token" \
  -d "grant_type=authorization_code" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=http://localhost:3000/callback" \
  -d "code=YOUR_AUTHORIZATION_CODE"
```

Response:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "api_domain": "https://www.zohoapis.com",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**Important**: Save the `refresh_token` - you'll need it for the client configuration.

## Step 4: Get Your Portal ID

Use your access token to get the portal ID:

```bash
curl "https://projectsapi.zoho.com/restapi/portals/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:

```json
{
  "portals": [
    {
      "id": 123456789,
      "name": "Your Portal Name",
      ...
    }
  ]
}
```

Note the `id` value - this is your Portal ID.

## Step 5: Configure Environment Variables

Create a `.env` file:

```bash
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret
ZOHO_REFRESH_TOKEN=your_refresh_token
ZOHO_PORTAL_ID=your_portal_id
```

## Step 6: Initialize the Client

```typescript
import { createZohoProjectsClient } from '@panoptic-it-solutions/zoho-projects-client';
import 'dotenv/config';

const client = createZohoProjectsClient({
  clientId: process.env.ZOHO_CLIENT_ID!,
  clientSecret: process.env.ZOHO_CLIENT_SECRET!,
  refreshToken: process.env.ZOHO_REFRESH_TOKEN!,
  portalId: process.env.ZOHO_PORTAL_ID!,
});

// Test the connection
const projects = await client.projects.list();
console.log('Connected! Projects:', projects.projects.length);
```

## Data Centers

Zoho operates in multiple data centers. Use the correct one for your account:

| Extension | Region |
|-----------|--------|
| `com` | United States (default) |
| `eu` | Europe |
| `in` | India |
| `com.au` | Australia |
| `jp` | Japan |

Configure in client:

```typescript
const client = createZohoProjectsClient({
  // ... other options
  dataCenterExtension: 'eu', // For EU accounts
});
```

## Token Refresh

The client automatically handles token refresh. When the access token expires, it will use the refresh token to get a new one.

## Troubleshooting

### "Invalid refresh token"

- Refresh tokens can expire if not used for 90+ days
- Re-authorize your application to get a new refresh token

### "Unauthorized" errors

- Check that your scopes include the required permissions
- Verify the Portal ID is correct
- Ensure you're using the correct data center

### Rate Limiting

The client includes automatic rate limiting. If you hit rate limits:

```typescript
import { ZohoRateLimitError } from '@panoptic-it-solutions/zoho-projects-client';

try {
  await client.projects.list();
} catch (error) {
  if (error instanceof ZohoRateLimitError) {
    console.log(`Retry after ${error.retryAfter}ms`);
  }
}
```

## Security Best Practices

1. **Never commit credentials** - Use environment variables
2. **Use minimal scopes** - Only request scopes you need
3. **Rotate secrets** - Periodically regenerate your client secret
4. **Secure storage** - Use a secrets manager in production
