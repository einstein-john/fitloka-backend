import Joi from "joi";
import { Request } from "express";
import { BaseSchema } from "./base.schema";

export class InventoryProductIdSchema extends BaseSchema {
  protected getSchema(): Joi.ObjectSchema {
    return Joi.object({
      productId: Joi.number().integer().positive().required(),
    });
  }

  public validateParams(req: Request) {
    return this.getSchema().validate(req.params);
  }
}

export class InventoryUpdateSchema extends BaseSchema {
  protected getSchema(): Joi.ObjectSchema {
    return Joi.object({
      stock: Joi.number().integer().min(0).required(),
    });
  }
}
