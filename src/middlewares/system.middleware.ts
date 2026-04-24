import morgan from "morgan";
import { SystemError } from "../errors";
import Joi, { ValidationResult } from "joi";
import serverConfig from "../config/server.config";
import { NodeEnvOptions } from "../config/constants";
import { Request, Response, NextFunction } from "express";
import { UniqueConstraintError, DatabaseError } from "sequelize";

class SystemMiddleware {
  public errorHandler(error: SystemError, req: Request, res: Response, next: NextFunction): void {
    const { method, path } = req;

    const isProduction = serverConfig.NODE.ENV === NodeEnvOptions.PRODUCTION;

    let errorCode = error.code || 500;

    if (res.headersSent) {
      return next(error);
    }

    if (error instanceof Joi.ValidationError) {
      res.status(400).json({
        message: "Validation error.",
        data: {
          error: error.details.map((detail) => detail.message),
        },
      });
      return;
    }

    if (
      error instanceof SyntaxError ||
      error instanceof UniqueConstraintError ||
      error instanceof DatabaseError
    ) {
      errorCode = 400;
    }

    if (errorCode === 500 && isProduction) {
      res.status(500).json({
        message: "An unexpected error occurred. Please try again later.",
      });
      return;
    }

    res.status(errorCode).json({
      message: error.message,
      data: {
        ...(error.errors && { error: error.errors }),
        ...(!isProduction && { trace: error.stack, method, path }),
      },
    });
  }

  public formatRequestQuery(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        query: { page = 1, limit = 10, search },
      } = req;

      (req as any).queryOpts = {
        page: Number(page) ? Number(page) : 1,
        limit: Number(limit) ? Number(limit) : 10,
        offset: ((Number(page) ? Number(page) : 1) - 1) * (Number(limit) ? Number(limit) : 10),
        search: search ? (search as string) : undefined,
      };

      return next();
    } catch (error) {
      serverConfig.DEBUG(
        `error in system middleware format request query: ${JSON.stringify(error)}`
      );
      next(error);
    }
  }

  public requestLogger(req: Request, res: Response, next: NextFunction) {
    try {
      morgan.format(
        "custom",
        '":method :url HTTP/:http-version" :status - :response-time ms - :req[host]'
      );
      if ([NodeEnvOptions.DEVELOPMENT].includes(serverConfig.NODE.ENV)) {
        morgan("dev")(req, res, () => {});
      } else {
        morgan("short")(req, res, () => {});
      }

      return next();
    } catch (error) {
      serverConfig.DEBUG(`Error in system middleware request logger: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  public validateRequestBody = (validator: (req: Request) => ValidationResult) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const { error, value } = validator(req);

      if (error) throw error;

      req.body = value;

      next();
    };
  };
}

export default new SystemMiddleware();
