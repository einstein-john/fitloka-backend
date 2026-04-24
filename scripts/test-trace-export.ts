#!/usr/bin/env node

/**
 * Script to test if traces are being exported to Honeycomb
 * This will make an HTTP request to your local server to generate a trace
 *
 * Usage:
 * 1. Start your server: npm run dev
 * 2. In another terminal: ts-node scripts/test-trace-export.ts
 */

import http from "http";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

console.log(`\n=== Testing Trace Export ===`);
console.log(`Making request to: ${SERVER_URL}\n`);

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/",
  method: "GET",
  headers: {
    "User-Agent": "OpenTelemetry-Test-Client",
  },
};

const req = http.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log(`✅ Request completed successfully`);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response: ${data.substring(0, 100)}...\n`);
    console.log("📊 Check your Honeycomb dashboard for the trace");
    console.log("   It may take 10-30 seconds for traces to appear\n");
    process.exit(0);
  });
});

req.on("error", (error) => {
  console.error(`❌ Request failed: ${error.message}`);
  console.log("\nMake sure your server is running:");
  console.log("  npm run dev\n");
  process.exit(1);
});

req.setTimeout(5000, () => {
  console.error("❌ Request timeout");
  req.destroy();
  process.exit(1);
});

req.end();
