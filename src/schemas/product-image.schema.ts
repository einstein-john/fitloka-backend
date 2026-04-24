import Joi from "joi";
import { Request } from "express";
import { BaseSchema } from "./base.schema";

export class ProductAttachImageSchema extends BaseSchema {
  protected getSchema(): Joi.ObjectSchema {
    return Joi.object({
      url: Joi.string().uri().max(2048).required(),
      altText: Joi.string().max(500).allow(null, "").optional(),
      sortOrder: Joi.number().integer().min(0).default(0),
      isPrimary: Joi.boolean().default(false),
    });
  }
}

export class ProductImageParamsSchema extends BaseSchema {
  protected getSchema(): Joi.ObjectSchema {
    return Joi.object({
      id: Joi.number().integer().positive().required(),
      productImageId: Joi.number().integer().positive().required(),
    });
  }

  public validateParams(req: Request) {
    return this.getSchema().validate(req.params);
  }
}
