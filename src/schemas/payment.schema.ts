import Joi from "joi";
import { BaseSchema } from "./base.schema";

export class PaymentCheckoutSchema extends BaseSchema {
  protected getSchema(): Joi.ObjectSchema {
    return Joi.object({
      orderId: Joi.number().integer().positive().required(),
    });
  }
}

export class PaymentWebhookSchema extends BaseSchema {
  protected getSchema(): Joi.ObjectSchema {
    return Joi.object({
      orderId: Joi.number().integer().positive().required(),
      status: Joi.string().valid("completed", "pending", "failed").optional(),
    });
  }
}
