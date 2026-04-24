import { NextFunction, Response, Request } from "express";
import { UnauthorizedError } from "../errors";
import applicationService from "../services/application.service";
import serverConfig from "../config/server.config";
import { ApplicationInstance } from "../database/models/Application";

class ApiKeyAuthMiddleware {
  public async validateApiKey(
    req: Request & { application?: ApplicationInstance },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const apiKey = req.headers["x-api-key"] as string;
      if (!apiKey) throw new UnauthorizedError("API key is required");

      const application = await applicationService.getApplicationByApiKey(apiKey);

      if (!application) throw new UnauthorizedError("Invalid API key");

      // Attach the application info to the request for use in routes
      req.application = application;
      next();
    } catch (error) {
      serverConfig.DEBUG(`Error validating API key: ${JSON.stringify(error)}`);
      next(error);
    }
  }
}

export default new ApiKeyAuthMiddleware();
