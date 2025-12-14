/**
 * Helper script to get a refresh token from Zoho
 *
 * Steps:
 * 1. Go to https://api-console.zoho.eu (or your region)
 * 2. Select your client → "Generate Code" tab → "Self Client"
 * 3. Enter scope: ZohoProjects.projects.READ,ZohoProjects.tasks.READ,ZohoProjects.timesheets.READ,ZohoProjects.users.READ,ZohoProjects.portals.READ
 * 4. Set duration (10 mins is fine)
 * 5. Click "Create" and copy the code
 * 6. Run: ZOHO_GRANT_CODE=paste_code_here npx tsx --env-file=.env get-refresh-token.ts
 */

import axios from "axios";

async function main() {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const grantCode = process.env.ZOHO_GRANT_CODE;
  const accountsUrl = process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.eu";

  if (!grantCode) {
    console.log(`
To get a refresh token:

1. Go to https://api-console.zoho.eu
2. Select your client → "Generate Code" tab → "Self Client"
3. Enter scope:
   ZohoProjects.projects.READ,ZohoProjects.tasks.READ,ZohoProjects.timesheets.READ,ZohoProjects.users.READ,ZohoProjects.portals.READ
4. Click "Create" and copy the authorization code
5. Run this command (code expires in ~10 mins):

   ZOHO_GRANT_CODE=paste_code_here npx tsx --env-file=.env get-refresh-token.ts
`);
    return;
  }

  console.log("Exchanging authorization code for refresh token...\n");

  try {
    const response = await axios.post(`${accountsUrl}/oauth/v2/token`, null, {
      params: {
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code: grantCode,
      },
    });

    if (response.data.refresh_token) {
      console.log("Success! Add this to your .env file:\n");
      console.log(`ZOHO_REFRESH_TOKEN=${response.data.refresh_token}`);
      console.log("\n(Refresh tokens don't expire unless revoked)");
    } else {
      console.log("Response:", JSON.stringify(response.data, null, 2));
    }
  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
  }
}

main();
