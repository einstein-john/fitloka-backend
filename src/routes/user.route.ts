import { Router, Request, Response, NextFunction } from "express";
import UserController from "../controllers/user.controller";
import { UserSchema } from "../schemas";
import { ApiValidationErrorResponse } from "../types";

class UserRoute extends UserController {
  public router: Router;
  private userSchema: UserSchema;

  constructor() {
    super();
    this.router = Router();
    this.userSchema = new UserSchema();
    this.routes();
  }

  private routes(): void {
    this.router.get("/me", this.getCurrentUser);
    this.router.get("/:id", this.validateParams, this.getUser);
    this.router.put("/:id", this.validateParams, this.validateUpdate, this.updateUser);
    this.router.delete("/:id", this.validateParams, this.deleteUser);
  }

  private validateParams = (
    req: Request,
    res: Response<ApiValidationErrorResponse>,
    next: NextFunction
  ): void => {
    const { error } = this.userSchema.validateParams(req);
    if (error) {
      const errorResponse: ApiValidationErrorResponse = {
        message: "Validation error.",
        data: {
          error: error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
          })),
        },
      };
      res.status(400).json(errorResponse);
      return;
    }
    next();
  };

  private validateUpdate = (
    req: Request,
    res: Response<ApiValidationErrorResponse>,
    next: NextFunction
  ): void => {
    const { error, value } = this.userSchema.validateUpdate(req);
    if (error) {
      const errorResponse: ApiValidationErrorResponse = {
        message: "Validation error.",
        data: {
          error: error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
          })),
        },
      };
      res.status(400).json(errorResponse);
      return;
    }
    req.body = value;
    next();
  };
}

export default new UserRoute().router;
