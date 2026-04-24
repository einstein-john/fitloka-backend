import Joi from "joi";
import { Request } from "express";
import { BaseSchema } from "./base.schema";

export class CatalogCategoryCreateSchema extends BaseSchema {
  protected getSchema(): Joi.ObjectSchema {
    return Joi.object({
      name: Joi.string().min(1).max(200).required(),
      description: Joi.string().max(5000).allow(null, "").optional(),
      slug: Joi.string().max(200).optional(),
    });
  }
}

export class CatalogCategoryIdSchema extends BaseSchema {
  protected getSchema(): Joi.ObjectSchema {
    return Joi.object({ id: Joi.number().integer().positive().required() });
  }

  public validateParams(req: Request) {
    return this.getSchema().validate(req.params);
  }
}

export class CatalogCategoryUpdateSchema extends BaseSchema {
  protected getSchema(): Joi.ObjectSchema {
    return Joi.object({
      name: Joi.string().min(1).max(200).optional(),
      description: Joi.string().max(5000).allow(null, "").optional(),
      slug: Joi.string().max(200).optional(),
    });
  }
}
