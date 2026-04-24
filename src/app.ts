// IMPORTANT: Import tracing FIRST before any other modules
// This ensures OpenTelemetry instrumentation is set up before any code runs
import "./tracing";

import helmet from "helmet";
import express from "express";
import compression from "compression";
import { Application } from "express";
import cors, { CorsOptions } from "cors";
import serverConfig from "./config/server.config";
import { NodeEnvOptions } from "./config/constants";
import database from "./database";
import routes from "./routes";
import systemMiddleware from "./middlewares/system.middleware";
import botProtectionMiddleware from "./middlewares/bot-protection.middleware";
import rateLimitMiddleware from "./middlewares/rate-limit.middleware";

class App {
  public app: Application;

  protected port: number;

  private corsOptions: CorsOptions;

  constructor() {
    this.app = express();
    this.port = serverConfig.NODE.PORT;
    this.corsOptions = {
      origin: serverConfig.ALLOWED_ORIGINS,
    };
    this.initializeMiddlewaresAndRoutes();
  }

  private async initializeDatabase() {
    await database.connect();
  }

  private initializeMiddlewaresAndRoutes() {
    this.app.use(compression());

    // Bot protection middleware - apply early
    this.app.use(botProtectionMiddleware.addSecurityHeaders);
    this.app.use(botProtectionMiddleware.logSuspiciousActivity);

    if (serverConfig.NODE.ENV === NodeEnvOptions.PRODUCTION) {
      this.app.use(cors(this.corsOptions));
    } else {
      this.app.use(cors());
    }
    this.app.use(express.json({ limit: "2048mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "2048mb" }));

    this.app.use(helmet());
    this.app.use(systemMiddleware.requestLogger);
    this.app.use(rateLimitMiddleware.general);

    this.app.use(routes);

    this.app.use(systemMiddleware.errorHandler);
  }

  public async start(): Promise<void> {
    await this.initializeDatabase();

    try {
      this.app
        .listen(this.port, () => {
          serverConfig.DEBUG(
            `Server is running on port ${this.port} in ${serverConfig.NODE.ENV} mode`
          );
        })
        .on("error", (error) => {
          if (error["code"] === "EADDRINUSE") {
            serverConfig.DEBUG(`Port ${this.port} is already in use`);
            this.port++;
            this.start();
          }
        });
    } catch (error) {
      console.log(error);
    }
  }
}

const app = new App();
app.start();
