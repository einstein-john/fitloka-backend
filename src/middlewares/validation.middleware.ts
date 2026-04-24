import { Request, Response, NextFunction } from "express";
import { BaseSchema } from "../schemas/base.schema";
import { ApiValidationErrorResponse } from "../types/api.interface";

class ValidationMiddleware {
  /**
   * Creates a validation middleware using a schema class
   * @param schemaClass - The schema class instance to use for validation
   * @returns Express middleware function
   */
  public validate(schemaClass: BaseSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const { error, value } = schemaClass.validate(req);
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
}

export default new ValidationMiddleware();
