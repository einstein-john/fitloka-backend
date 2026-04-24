import Joi, { ValidationResult } from "joi";
import { Request } from "express";
import { BaseSchema } from "./base.schema";

export class UserSchema extends BaseSchema {
  protected getSchema(): Joi.ObjectSchema {
    return Joi.object({
      username: Joi.string().required(),
      firstName: Joi.string().optional().allow(null, ""),
      lastName: Joi.string().optional().allow(null, ""),
      email: Joi.string().email().required(),
      password: Joi.string().optional().allow(null, ""),
      enabled: Joi.boolean().optional().allow(null),
      isAdmin: Joi.boolean().optional().allow(null),
      profilePicture: Joi.string().uri().optional().allow(null, ""),
      lastLogin: Joi.date().optional().allow(null),
    });
  }

  public validateUpdate(req: Request): ValidationResult {
    return Joi.object({
      username: Joi.string().optional(),
      firstName: Joi.string().optional().allow(null, ""),
      lastName: Joi.string().optional().allow(null, ""),
      email: Joi.string().email().optional(),
      password: Joi.string().optional().allow(null, ""),
      enabled: Joi.boolean().optional().allow(null),
      isAdmin: Joi.boolean().optional().allow(null),
      profilePicture: Joi.string().uri().optional().allow(null, ""),
      lastLogin: Joi.date().optional().allow(null),
    }).validate(req.body);
  }

  public validateParams(req: Request): ValidationResult {
    return Joi.object({
      id: Joi.number().integer().positive().required(),
    }).validate(req.params);
  }
}
