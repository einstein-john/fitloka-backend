import { Router, Request, Response, NextFunction } from "express";
import AuthController from "../controllers/auth.controller";
import validationMiddleware from "../middlewares/validation.middleware";
import rateLimitMiddleware from "../middlewares/rate-limit.middleware";
import { LoginSchema, RegisterSchema } from "../schemas";
import { ApiValidationErrorResponse } from "../types";

class AuthRoute extends AuthController {
  public router: Router;
  private loginSchema: LoginSchema;
  private registerSchema: RegisterSchema;

  constructor() {
    super();
    this.router = Router();
    this.loginSchema = new LoginSchema();
    this.registerSchema = new RegisterSchema();
    this.routes();
  }

  private routes(): void {
    this.router.post(
      "/register",
      rateLimitMiddleware.auth,
      validationMiddleware.validate(this.registerSchema),
      this.register
    );
    this.router.post(
      "/login",
      rateLimitMiddleware.auth,
      validationMiddleware.validate(this.loginSchema),
      this.login
    );
    this.router.get(
      "/login/magic-link",
      rateLimitMiddleware.auth,
      this.validateMagicLink,
      this.loginWithMagicLink
    );
    this.router.post(
      "/login/magic-link/request",
      rateLimitMiddleware.auth,
      this.validateMagicLinkRequest,
      this.requestMagicLink
    );
    this.router.get(
      "/register/confirm-email",
      rateLimitMiddleware.auth,
      this.validateEmailConfirmation,
      this.confirmEmail
    );
  }

  private validateMagicLink = (
    req: Request,
    res: Response<ApiValidationErrorResponse>,
    next: NextFunction
  ): void => {
    const { error } = this.loginSchema.validateMagicLink(req);
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

  private validateMagicLinkRequest = (
    req: Request,
    res: Response<ApiValidationErrorResponse>,
    next: NextFunction
  ): void => {
    const { error } = this.loginSchema.validateMagicLinkRequest(req);
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

  private validateEmailConfirmation = (
    req: Request,
    res: Response<ApiValidationErrorResponse>,
    next: NextFunction
  ): void => {
    const { error } = this.registerSchema.validateEmailConfirmation(req);
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
}

export default new AuthRoute().router;
