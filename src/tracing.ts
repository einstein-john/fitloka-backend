// src/tracing.ts
import { config } from "dotenv";
config();

import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";

const serviceName = process.env.OTEL_SERVICE_NAME || "fin-tracker-backend";
const endpoint =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "https://api.eu1.honeycomb.io/v1/traces";

const sdk = new NodeSDK({
  serviceName: serviceName,
  traceExporter: new OTLPTraceExporter({
    url: endpoint,
    headers: {
      "x-honeycomb-team": process.env.HONEYCOMB_API_KEY,
    },
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

process.on("SIGTERM", () => {
  sdk.shutdown().finally(() => process.exit(0));
});
