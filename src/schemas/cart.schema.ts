import Joi from "joi";
import { Request } from "express";
import { BaseSchema } from "./base.schema";

export class CartAddItemSchema extends BaseSchema {
  protected getSchema(): Joi.ObjectSchema {
    return Joi.object({
      productId: Joi.number().integer().positive().required(),
      quantity: Joi.number().integer().min(1).default(1),
    });
  }
}

export class CartItemIdSchema extends BaseSchema {
  protected getSchema(): Joi.ObjectSchema {
    return Joi.object({
      itemId: Joi.number().integer().positive().required(),
    });
  }

  public validateParams(req: Request) {
    return Joi.object({
      itemId: Joi.number().integer().positive().required(),
    }).validate(req.params);
  }
}

export class CartItemQuantitySchema extends BaseSchema {
  protected getSchema(): Joi.ObjectSchema {
    return Joi.object({
      quantity: Joi.number().integer().min(1).required(),
    });
  }
}
