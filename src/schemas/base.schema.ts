import { Request } from "express";
import Joi, { ValidationResult } from "joi";

// Base schema class for all validation schemas
export abstract class BaseSchema {
  protected abstract getSchema(): Joi.ObjectSchema;

  public validate(req: Request): ValidationResult {
    return this.getSchema().validate(req.body);
  }

  public validateQuery(req: Request): ValidationResult {
    return this.getSchema().validate(req.query);
  }

  public validateParams(req: Request): ValidationResult {
    return this.getSchema().validate(req.params);
  }

  public validateHeaders(req: Request): ValidationResult {
    return this.getSchema().validate(req.headers);
  }
}
