import { NextFunction, Response } from "express";
import { UnauthorizedError } from "../errors";
import authService from "../services/auth.service";
import userService from "../services/user.service";
import serverConfig from "../config/server.config";
import { AuthenticatedUserRequest } from "../types";

class JwtAuthMiddleware {
  /**
   * Middleware to validate JWT token and attach user to request
   */
  public async validateToken(
    req: AuthenticatedUserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedError("Authorization token is required");
      }

      const token = authHeader.substring(7); // Remove "Bearer " prefix

      const decoded = authService.verifyToken(token);
      const user = await userService.getUserById(decoded.userId);

      if (!user) {
        throw new UnauthorizedError("User not found");
      }

      if (!user.enabled) {
        throw new UnauthorizedError("User account is disabled");
      }

      // Attach user to request
      req.user = user;
      req.userId = user.id;
      req.isAdmin = user.isAdmin === true;

      next();
    } catch (error) {
      serverConfig.DEBUG(`Error validating JWT token: ${JSON.stringify(error)}`);
      next(error);
    }
  }
}

export default new JwtAuthMiddleware();
