import Joi from "joi";
import { Request } from "express";
import { BaseSchema } from "./base.schema";

export class ProductCreateSchema extends BaseSchema {
  protected getSchema(): Joi.ObjectSchema {
    return Joi.object({
      categoryId: Joi.number().integer().positive().required(),
      name: Joi.string().min(1).max(200).required(),
      sku: Joi.string().min(1).max(64).required(),
      description: Joi.string().max(10000).allow(null, "").optional(),
      price: Joi.number().positive().required(),
      status: Joi.string().valid("ACTIVE", "INACTIVE").optional(),
      initialStock: Joi.number().integer().min(0).optional(),
    });
  }
}

export class ProductUpdateSchema extends BaseSchema {
  protected getSchema(): Joi.ObjectSchema {
    return Joi.object({
      categoryId: Joi.number().integer().positive().optional(),
      name: Joi.string().min(1).max(200).optional(),
      sku: Joi.string().min(1).max(64).optional(),
      description: Joi.string().max(10000).allow(null, "").optional(),
      price: Joi.number().positive().optional(),
      status: Joi.string().valid("ACTIVE", "INACTIVE").optional(),
    });
  }
}

export class ProductIdSchema extends BaseSchema {
  protected getSchema(): Joi.ObjectSchema {
    return Joi.object({ id: Joi.number().integer().positive().required() });
  }

  public validateParams(req: Request) {
    return this.getSchema().validate(req.params);
  }
}
