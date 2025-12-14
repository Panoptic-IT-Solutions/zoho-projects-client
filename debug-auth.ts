import axios from "axios";

async function main() {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const accountsUrl = process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.eu";

  console.log("Debug: Testing OAuth token request");
  console.log(`  Accounts URL: ${accountsUrl}`);
  console.log(`  Client ID: ${clientId?.slice(0, 10)}...`);
  console.log(`  Client Secret: ${clientSecret?.slice(0, 5)}...`);

  try {
    const response = await axios.post(
      `${accountsUrl}/oauth/v2/token`,
      null,
      {
        params: {
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret,
          scope: "ZohoProjects.projects.READ,ZohoProjects.tasks.READ,ZohoProjects.timesheets.READ,ZohoProjects.users.READ",
        },
      }
    );

    console.log("\nResponse status:", response.status);
    console.log("Response data:", JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.log("\nError status:", error.response?.status);
    console.log("Error data:", JSON.stringify(error.response?.data, null, 2));
  }
}

main();
