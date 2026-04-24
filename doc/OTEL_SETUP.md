# OpenTelemetry Setup and Startup Time Measurement

This document explains how to use OpenTelemetry instrumentation and measure its impact on application startup time.

## Installation

OpenTelemetry packages have been installed:
- `@opentelemetry/auto-instrumentations-node`
- `@opentelemetry/sdk-node`
- `@opentelemetry/exporter-trace-otlp-http`

## Environment Variables

Set the following environment variables to configure OpenTelemetry:

```bash
export OTEL_SERVICE_NAME=fin-tracker-backend
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_EXPORTER_OTLP_ENDPOINT="https://api.eu1.honeycomb.io"
export OTEL_EXPORTER_OTLP_HEADERS="x-honeycomb-team=YOUR_API_KEY"
```

Or create a `.env` file:
```env
OTEL_SERVICE_NAME=fin-tracker-backend
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_EXPORTER_OTLP_ENDPOINT=https://api.eu1.honeycomb.io
OTEL_EXPORTER_OTLP_HEADERS=x-honeycomb-team=YOUR_API_KEY
```

## Running with OpenTelemetry

### Development Mode
```bash
npm run dev:tracing
```

### Production Mode (after build)
```bash
npm run build
npm run start:tracing
```

### Manual (Node CLI)
```bash
# TypeScript (dev)
ts-node -r ./src/tracing.ts src/app.ts

# JavaScript (production)
node -r ./dist/src/tracing.js dist/src/app.js
```

## Measuring Startup Time Impact

### Automatic Comparison
Run the measurement script to compare startup time with and without OpenTelemetry:

```bash
# First, build the project
npm run build

# Then run the measurement script
npm run measure:startup
```

This will:
1. Measure startup time WITHOUT OpenTelemetry
2. Measure startup time WITH OpenTelemetry
3. Display both results for comparison

### Manual Measurement

#### Without OpenTelemetry:
```bash
npm run build
npm start
```

#### With OpenTelemetry:
```bash
npm run build
npm run start:tracing
```

The application will automatically print a startup timing report showing:
- Total startup time
- Time at each checkpoint:
  - Application Start
  - Express App Created
  - Middlewares Initialized
  - Database Connection Start
  - Database Connected
  - Server Listen Start
  - Server Listening

## Configuration

The tracing configuration is in `src/tracing.ts`. Currently configured to:
- Export traces to OTLP endpoint (configurable via env vars)
- Auto-instrument Node.js, Express, HTTP, and other common libraries
- Disable filesystem instrumentation (fs) to reduce noise during startup

## Expected Impact

OpenTelemetry typically adds:
- **Overhead**: 50-200ms to startup time
- **Runtime overhead**: ~1-5% CPU/memory overhead
- **Benefits**: Full observability of your application including:
  - Request tracing across services
  - Performance metrics
  - Error tracking
  - Dependency monitoring

## Disabling OpenTelemetry

Simply run the application without the `-r tracing` flag:
```bash
npm start  # Without tracing
npm run start:tracing  # With tracing
```


