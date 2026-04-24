import { NextFunction, Response } from "express";
import { ForbbidenError } from "../errors";
import type { AuthenticatedUserRequest } from "../types";

class AdminMiddleware {
  public requireAdmin(req: AuthenticatedUserRequest, _res: Response, next: NextFunction): void {
    if (!req.isAdmin) {
      next(new ForbbidenError("Administrator access required."));
      return;
    }
    next();
  }
}

export default new AdminMiddleware();
