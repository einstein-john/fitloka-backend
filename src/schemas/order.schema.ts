import Joi from "joi";
import { Request } from "express";
import { BaseSchema } from "./base.schema";

export class OrderIdSchema extends BaseSchema {
  protected getSchema(): Joi.ObjectSchema {
    return Joi.object({ id: Joi.number().integer().positive().required() });
  }

  public validateParams(req: Request) {
    return this.getSchema().validate(req.params);
  }
}
