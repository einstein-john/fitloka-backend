import Joi, { ValidationResult } from "joi";
import { Request } from "express";
import { BaseSchema } from "./base.schema";

export class PaginationSchema extends BaseSchema {
  protected getSchema(): Joi.ObjectSchema {
    return Joi.object({
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      categoryId: Joi.number().integer().positive().optional(),
    });
  }

  public validateQuery(req: Request): ValidationResult {
    return this.getSchema().validate(req.query);
  }
}
