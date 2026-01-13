#!/usr/bin/env npx tsx
/**
 * OAuth Helper Script - Get Zoho Refresh Token
 *
 * This script automates the OAuth flow to obtain a refresh token:
 * 1. Starts a local server to catch the callback
 * 2. Opens your browser to the Zoho authorization page
 * 3. Exchanges the authorization code for tokens
 * 4. Outputs the refresh token to add to your .env file
 *
 * Usage:
 *   npx tsx scripts/get-refresh-token.ts
 *
 * Required environment variables (or pass as arguments):
 *   ZOHO_CLIENT_ID
 *   ZOHO_CLIENT_SECRET
 *
 * Optional:
 *   ZOHO_ACCOUNTS_URL (defaults to https://accounts.zoho.eu)
 */

import http from "http";
import { exec } from "child_process";
import { URL } from "url";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Load .env file manually
function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env");
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        const value = valueParts.join("=");
        if (key && value && !process.env[key]) {
          process.env[key] = value;
        }
      }
    }
    console.log("✅ Loaded .env file\n");
  }
}

loadEnvFile();

// Configuration
const CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const ACCOUNTS_URL = process.env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.eu";
const REDIRECT_URI = "http://localhost:3000/api/zoho/callback";
const PORT = 3000;

// Scopes for Zoho Projects V3 API - comprehensive list
const SCOPES = [
  // Zoho Projects scopes
  "ZohoProjects.projects.ALL",
  "ZohoProjects.tasks.ALL",
  "ZohoProjects.tasklists.ALL",
  "ZohoProjects.portals.READ",
  "ZohoProjects.users.ALL",
  "ZohoProjects.timesheets.ALL",
  "ZohoProjects.bugs.ALL",
  "ZohoProjects.milestones.ALL",
  "ZohoProjects.events.ALL",
  "ZohoProjects.forums.ALL",
  "ZohoProjects.documents.ALL",
  "ZohoProjects.tags.ALL",
  "ZohoProjects.status.READ",
  "ZohoProjects.search.READ",
  // ZohoPC scope for Projects attachments
  "ZohoPC.files.ALL",
  // WorkDrive scopes for attachment uploads
  "WorkDrive.team.ALL",
  "WorkDrive.workspace.ALL",
  "WorkDrive.files.ALL",
  "WorkDrive.teamfolders.ALL",
].join(",");

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Error: ZOHO_CLIENT_ID and ZOHO_CLIENT_SECRET are required");
  console.error("\nSet them in your environment or .env file:");
  console.error("  export ZOHO_CLIENT_ID=your_client_id");
  console.error("  export ZOHO_CLIENT_SECRET=your_client_secret");
  process.exit(1);
}

// Build authorization URL
const authUrl = new URL(`${ACCOUNTS_URL}/oauth/v2/auth`);
authUrl.searchParams.set("scope", SCOPES);
authUrl.searchParams.set("client_id", CLIENT_ID);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("access_type", "offline");
authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authUrl.searchParams.set("prompt", "consent");

console.log("\n🔐 Zoho OAuth Helper\n");
console.log("Starting local server to catch the callback...\n");

// Create server to catch the callback
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url!, `http://localhost:${PORT}`);

  // Handle the callback
  if (url.pathname === "/api/zoho/callback") {
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error) {
      res.writeHead(400, { "Content-Type": "text/html" });
      res.end(`<h1>Error</h1><p>${error}</p>`);
      console.error(`\n❌ Authorization failed: ${error}`);
      server.close();
      process.exit(1);
    }

    if (!code) {
      res.writeHead(400, { "Content-Type": "text/html" });
      res.end("<h1>Error</h1><p>No authorization code received</p>");
      console.error("\n❌ No authorization code received");
      server.close();
      process.exit(1);
    }

    console.log("✅ Authorization code received!");
    console.log("\nExchanging code for tokens...\n");

    // Exchange code for tokens
    try {
      const tokenUrl = `${ACCOUNTS_URL}/oauth/v2/token`;
      const params = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code,
      });

      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      const data = await response.json() as Record<string, unknown>;

      if (data.error) {
        throw new Error(data.error as string);
      }

      // Success!
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`
        <html>
          <head><title>Success!</title></head>
          <body style="font-family: system-ui; padding: 40px; text-align: center;">
            <h1>✅ Success!</h1>
            <p>Refresh token obtained. Check your terminal.</p>
            <p>You can close this window.</p>
          </body>
        </html>
      `);

      console.log("═".repeat(60));
      console.log("\n🎉 SUCCESS! Add this to your .env file:\n");
      console.log(`ZOHO_REFRESH_TOKEN=${data.refresh_token}\n`);
      console.log("═".repeat(60));

      if (data.access_token) {
        console.log("\n📝 Access token (expires in 1 hour):");
        console.log(`${(data.access_token as string).substring(0, 50)}...`);
      }

      server.close();
      process.exit(0);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "text/html" });
      res.end(`<h1>Error</h1><p>Failed to exchange code: ${err}</p>`);
      console.error(`\n❌ Failed to exchange code: ${err}`);
      server.close();
      process.exit(1);
    }
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`\n📎 Opening browser to authorize...\n`);
  console.log(`If the browser doesn't open, visit this URL:\n`);
  console.log(authUrl.toString());
  console.log("");

  // Open browser (works on macOS)
  const openCommand =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "start"
        : "xdg-open";

  exec(`${openCommand} "${authUrl.toString()}"`);
});

// Handle server errors
server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error("Stop the other process or use a different port.");
  } else {
    console.error(`\n❌ Server error: ${err.message}`);
  }
  process.exit(1);
});

// Timeout after 5 minutes
setTimeout(() => {
  console.error("\n⏰ Timeout: No authorization received within 5 minutes");
  server.close();
  process.exit(1);
}, 5 * 60 * 1000);
