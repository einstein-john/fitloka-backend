#!/usr/bin/env node

/**
 * Diagnostic script to check OpenTelemetry trace export
 * This helps identify why traces might not appear in Honeycomb
 */

import { config } from "dotenv";
import https from "https";
import http from "http";

config();

const otelEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const otelHeaders = process.env.OTEL_EXPORTER_OTLP_HEADERS;

console.log("\n=== OpenTelemetry Trace Export Diagnostics ===\n");

if (!otelEndpoint) {
  console.error("❌ OTEL_EXPORTER_OTLP_ENDPOINT is not set");
  process.exit(1);
}

if (!otelHeaders) {
  console.error("❌ OTEL_EXPORTER_OTLP_HEADERS is not set");
  process.exit(1);
}

// Parse headers
const headers: Record<string, string> = {};
const parts = otelHeaders.split(",");
for (const part of parts) {
  const [key, ...valueParts] = part.split("=");
  if (key && valueParts.length > 0) {
    headers[key.trim()] = valueParts.join("=").trim();
  }
}

// Determine export URL - OTLP exporter automatically appends /v1/traces
// But for testing, we need the full path
let exportUrl = otelEndpoint.trim().replace(/\/$/, "");
if (!exportUrl.includes("/v1/")) {
  exportUrl = exportUrl + "/v1/traces";
}

console.log(`Endpoint: ${exportUrl}`);
console.log(`Headers: ${Object.keys(headers).join(", ")}`);
console.log("\nTesting connectivity...\n");

// Parse URL
const url = new URL(exportUrl);
const isHttps = url.protocol === "https:";
const client = isHttps ? https : http;

const options = {
  hostname: url.hostname,
  port: url.port || (isHttps ? 443 : 80),
  path: url.pathname,
  method: "POST",
  headers: {
    "Content-Type": "application/x-protobuf",
    ...headers,
  },
  timeout: 10000,
};

// Make a test request
const req = client.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk.toString();
  });

  res.on("end", () => {
    console.log(`Response Status: ${res.statusCode}`);
    console.log(`Response Headers:`, res.headers);

    if (res.statusCode === 200 || res.statusCode === 202) {
      console.log("\n✅ Connection successful! The endpoint is reachable and accepting traces.");
      console.log("   If traces still don't appear in Honeycomb:");
      console.log("   1. Wait 30-60 seconds (batching delay)");
      console.log("   2. Verify your API key is correct");
      console.log("   3. Check Honeycomb dataset/environment settings");
      console.log("   4. Enable debug logging: OTEL_LOG_LEVEL=debug npm run dev\n");
    } else if (res.statusCode === 401 || res.statusCode === 403) {
      console.error("\n❌ Authentication failed!");
      console.error("   Check your API key in OTEL_EXPORTER_OTLP_HEADERS");
      console.error(`   Expected format: x-honeycomb-team=YOUR_API_KEY\n`);
    } else if (res.statusCode === 404) {
      console.error("\n❌ Endpoint not found!");
      console.error("   Verify your OTEL_EXPORTER_OTLP_ENDPOINT is correct");
      console.error("   For Honeycomb:");
      console.error("   - US: https://api.honeycomb.io");
      console.error("   - EU: https://api.eu1.honeycomb.io\n");
    } else {
      console.error(`\n❌ Unexpected response: ${res.statusCode}`);
      console.error(`   Response: ${data.substring(0, 200)}\n`);
    }

    process.exit(res.statusCode === 200 || res.statusCode === 202 ? 0 : 1);
  });
});

req.on("error", (error: any) => {
  console.error("\n❌ Connection failed!");
  console.error(`   Error: ${error.message}`);

  if (error.code === "ENOTFOUND") {
    console.error("   DNS resolution failed - check the endpoint URL");
  } else if (error.code === "ECONNREFUSED") {
    console.error("   Connection refused - endpoint might be down or wrong port");
  } else if (error.code === "ETIMEDOUT") {
    console.error("   Connection timeout - check firewall/proxy settings");
  }

  console.error("\n");
  process.exit(1);
});

req.on("timeout", () => {
  console.error("\n❌ Request timeout");
  req.destroy();
  process.exit(1);
});

// Send empty body (just testing connectivity)
req.end();
