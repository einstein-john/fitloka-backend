import Joi from "joi";
import { Request } from "express";
import { BaseSchema } from "./base.schema";

export class RegisterSchema extends BaseSchema {
  protected getSchema(): Joi.ObjectSchema {
    return Joi.object({
      username: Joi.string().min(2).max(64).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).max(128).required(),
      firstName: Joi.string().max(128).allow(null, "").optional(),
      lastName: Joi.string().max(128).allow(null, "").optional(),
    });
  }

  public validateEmailConfirmation(req: Request) {
    return Joi.object({
      token: Joi.string().required(),
    }).validate(req.query);
  }
}
