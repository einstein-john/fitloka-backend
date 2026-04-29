import { NextFunction, Request, Response } from "express";
import apiKeyAuthMiddleware from "./api-key-auth.middleware";
import jwtAuthMiddleware from "./jwt-auth.middleware";

function isCatalogPublicRead(req: Request): boolean {
  const m = req.method.toUpperCase();
  return m === "GET" || m === "HEAD";
}

/**
 * Shop/catalog routes: API key always; JWT only for mutating methods (admin enforced on route).
 */
class CatalogAuthMiddleware {
  public requireApiKeyWithOptionalJwt(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    apiKeyAuthMiddleware.validateApiKey(req, res, (err?: unknown) => {
      if (err) return next(err);
      if (isCatalogPublicRead(req)) {
        return next();
      }
      return jwtAuthMiddleware.validateToken(req, res, next);
    });
  }
}

export default new CatalogAuthMiddleware();
