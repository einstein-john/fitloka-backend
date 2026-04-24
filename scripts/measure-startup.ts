#!/usr/bin/env node

/**
 * Script to measure application startup time with and without OpenTelemetry
 * Usage: ts-node scripts/measure-startup.ts [--with-tracing|--without-tracing]
 */

import { spawn } from "child_process";
import * as path from "path";

const args = process.argv.slice(2);
const withTracing = args.includes("--with-tracing");
const withoutTracing = args.includes("--without-tracing");

if (!withTracing && !withoutTracing) {
  console.log("Measuring startup time with and without OpenTelemetry...\n");

  // Measure without tracing first
  measureStartup(false).then(() => {
    console.log("\n" + "=".repeat(60) + "\n");
    // Then measure with tracing
    measureStartup(true);
  });
} else {
  measureStartup(withTracing);
}

async function measureStartup(enableTracing: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const mode = enableTracing ? "WITH" : "WITHOUT";

    console.log(`\n${"=".repeat(60)}`);
    console.log(`Measuring startup ${mode} OpenTelemetry`);
    console.log("=".repeat(60));

    const nodeArgs = [];

    if (enableTracing) {
      // Load tracing first
      nodeArgs.push("-r", path.join(__dirname, "../dist/src/tracing.js"));
    }

    // Run the compiled app
    nodeArgs.push(path.join(__dirname, "../dist/src/app.js"));

    const child = spawn("node", nodeArgs, {
      cwd: path.join(__dirname, ".."),
      env: {
        ...process.env,
        ...(enableTracing
          ? {
              OTEL_SERVICE_NAME: "fin-tracker-backend",
              OTEL_EXPORTER_OTLP_PROTOCOL: "http/protobuf",
              OTEL_EXPORTER_OTLP_ENDPOINT:
                process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "https://api.eu1.honeycomb.io",
              OTEL_EXPORTER_OTLP_HEADERS:
                process.env.OTEL_EXPORTER_OTLP_HEADERS || "x-honeycomb-team=uiE6LVwUGS2yA52Id53ZlC",
            }
          : {}),
      },
      stdio: "inherit",
    });

    let serverReady = false;

    // Timeout after 30 seconds
    const timeout = setTimeout(() => {
      if (!serverReady) {
        child.kill();
        console.log(`\n⏱️  Total time: ${Date.now() - startTime}ms`);
        console.log("❌ Timeout - server did not start within 30 seconds");
        resolve();
      }
    }, 30000);

    // Listen for server ready message
    child.stdout?.on("data", (data) => {
      const output = data.toString();
      if (output.includes("Server is running on port")) {
        serverReady = true;
        clearTimeout(timeout);
        const totalTime = Date.now() - startTime;
        console.log(`\n✅ Server started ${mode} OpenTelemetry`);
        console.log(`⏱️  Total startup time: ${totalTime}ms`);

        // Give it a moment then kill
        setTimeout(() => {
          child.kill();
          resolve();
        }, 2000);
      }
    });

    child.stderr?.on("data", (data) => {
      process.stderr.write(data);
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      console.error("Error starting server:", error);
      reject(error);
    });

    child.on("exit", (code) => {
      clearTimeout(timeout);
      if (code !== 0 && !serverReady) {
        console.error(`Server exited with code ${code}`);
        reject(new Error(`Server exited with code ${code}`));
      } else if (!serverReady) {
        resolve();
      }
    });
  });
}
