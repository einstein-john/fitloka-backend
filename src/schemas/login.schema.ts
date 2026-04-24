import Joi from "joi";
import { Request } from "express";
import { BaseSchema } from "./base.schema";

export class LoginSchema extends BaseSchema {
  protected getSchema(): Joi.ObjectSchema {
    return Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    });
  }

  public validateMagicLink(req: Request) {
    return Joi.object({
      token: Joi.string().required(),
    }).validate(req.query);
  }
}
