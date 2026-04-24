import rateLimit from "express-rate-limit";
import serverConfig from "../config/server.config";

class RateLimitMiddleware {
  public general = rateLimit({
    windowMs: serverConfig.RATE_LIMIT.WINDOW_MS,
    max: serverConfig.RATE_LIMIT.MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message: "Too many requests. Please try again later.",
    },
  });

  public auth = rateLimit({
    windowMs: serverConfig.RATE_LIMIT.AUTH_WINDOW_MS,
    max: serverConfig.RATE_LIMIT.AUTH_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
      message: "Too many authentication attempts. Please try again later.",
    },
  });
}

export default new RateLimitMiddleware();
