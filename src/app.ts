import helmet from "helmet";
import express from "express";
import compression from "compression";
import { Application } from "express";
import cors, { CorsOptions } from "cors";
import serverConfig from "./config/server.config";
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
    this.corsOptions = this.buildCorsOptions();
    this.initializeMiddlewaresAndRoutes();
  }

  private buildCorsOptions(): CorsOptions {
    const allowed = serverConfig.ALLOWED_ORIGINS.map((o) => o.trim()).filter(Boolean);
    const allowAny = allowed.length === 0 || allowed.includes("*");

    return {
      origin(origin, callback) {
        if (allowAny) {
          callback(null, true);
          return;
        }
        if (!origin) {
          callback(null, true);
          return;
        }
        if (allowed.includes(origin)) {
          callback(null, true);
          return;
        }
        serverConfig.DEBUG(`CORS rejected origin: ${origin}; allowed: ${allowed.join(", ")}`);
        callback(null, false);
      },
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "x-api-key", "X-API-Key"],
      optionsSuccessStatus: 204,
      maxAge: 86400,
    };
  }

  private async initializeDatabase() {
    await database.connect();
  }

  private initializeMiddlewaresAndRoutes() {
    this.app.set("trust proxy", serverConfig.TRUST_PROXY);
    this.app.use(compression());

    // Bot protection middleware - apply early
    this.app.use(botProtectionMiddleware.addSecurityHeaders);
    this.app.use(botProtectionMiddleware.logSuspiciousActivity);

    this.app.use(cors(this.corsOptions));
    this.app.use(express.json({ limit: "2048mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "2048mb" }));

    this.app.use(
      helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
      })
    );
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
