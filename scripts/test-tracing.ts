#!/usr/bin/env node

/**
 * Script to test OpenTelemetry configuration and connection
 * Usage: ts-node scripts/test-tracing.ts
 */

import { config } from "dotenv";

config();

function parseHeaders(headersString?: string): Record<string, string> {
  const headers: Record<string, string> = {};

  if (!headersString) {
    return headers;
  }

  const parts = headersString.split(",");
  for (const part of parts) {
    const [key, ...valueParts] = part.split("=");
    if (key && valueParts.length > 0) {
      headers[key.trim()] = valueParts.join("=").trim();
    }
  }

  return headers;
}

console.log("=== OpenTelemetry Configuration Test ===\n");

const otelServiceName = process.env.OTEL_SERVICE_NAME || "fin-tracker-backend";
const otelEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const otelHeaders = parseHeaders(process.env.OTEL_EXPORTER_OTLP_HEADERS);
const otelProtocol = process.env.OTEL_EXPORTER_OTLP_PROTOCOL || "http/protobuf";

console.log(`Service Name: ${otelServiceName}`);
console.log(`Protocol: ${otelProtocol}`);
console.log(`Endpoint: ${otelEndpoint || "❌ NOT SET"}`);
console.log(`Headers:`);
if (Object.keys(otelHeaders).length > 0) {
  Object.entries(otelHeaders).forEach(([key, value]) => {
    // Mask the value for security
    const maskedValue =
      value.length > 8 ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}` : "***";
    console.log(`  ${key}: ${maskedValue}`);
  });
} else {
  console.log("  ❌ None set");
}

console.log("\n=== Configuration Status ===");

let hasErrors = false;

if (!otelEndpoint) {
  console.log("❌ OTEL_EXPORTER_OTLP_ENDPOINT is not set");
  hasErrors = true;
} else {
  console.log("✅ OTEL_EXPORTER_OTLP_ENDPOINT is set");
}

if (Object.keys(otelHeaders).length === 0) {
  console.log("❌ OTEL_EXPORTER_OTLP_HEADERS is not set or empty");
  hasErrors = true;
} else {
  console.log("✅ OTEL_EXPORTER_OTLP_HEADERS is set");
}

if (!hasErrors) {
  console.log("\n✅ Configuration looks good! Traces should be exported.");
  console.log("\nTo test, start your application with:");
  console.log("  npm run dev:tracing");
  console.log("or");
  console.log("  npm run start:tracing");
} else {
  console.log("\n❌ Configuration has errors. Please set the required environment variables:");
  console.log("\nRequired:");
  console.log("  OTEL_EXPORTER_OTLP_ENDPOINT=https://api.eu1.honeycomb.io");
  console.log("  OTEL_EXPORTER_OTLP_HEADERS=x-honeycomb-team=YOUR_API_KEY");
  console.log("\nOptional:");
  console.log("  OTEL_SERVICE_NAME=fin-tracker-backend");
  console.log("  OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf");
  console.log("\nYou can set these in a .env file or export them in your shell.");
}

console.log("\n==========================================\n");
