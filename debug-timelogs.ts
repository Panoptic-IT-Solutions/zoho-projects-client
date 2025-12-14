import axios from "axios";

async function main() {
  const clientId = process.env.ZOHO_CLIENT_ID!;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET!;
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN!;
  const portalId = process.env.ZOHO_PORTAL_ID!;
  const accountsUrl = process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.eu";
  const apiUrl = process.env.ZOHO_API_URL || "https://projectsapi.zoho.eu";

  // Get access token
  const tokenRes = await axios.post(`${accountsUrl}/oauth/v2/token`, null, {
    params: {
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    },
  });
  const accessToken = tokenRes.data.access_token;

  // Get projects first
  const projectsRes = await axios.get(`${apiUrl}/restapi/portal/${portalId}/projects/`, {
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
  });
  const projectId = projectsRes.data.projects[0].id_string;
  console.log("Project ID:", projectId);

  // Get today's date
  const today = new Date();
  const dateStr = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}-${today.getFullYear()}`;
  console.log("Date:", dateStr);

  // Try time logs
  try {
    const res = await axios.get(`${apiUrl}/restapi/portal/${portalId}/projects/${projectId}/logs/`, {
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
      params: {
        users_list: "all",
        view_type: "month",
        date: dateStr,
        bill_status: "All",
        component_type: "task",
      },
    });
    console.log("\nResponse status:", res.status);
    console.log("Response data:", JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    console.log("\nError:", err.response?.status, err.response?.data);
  }
}

main();
