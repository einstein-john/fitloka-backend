import { Router } from "express";
import PaymentController from "../controllers/payment.controller";
import validationMiddleware from "../middlewares/validation.middleware";
import jwtAuthMiddleware from "../middlewares/jwt-auth.middleware";
import { PaymentCheckoutSchema, PaymentWebhookSchema } from "../schemas/payment.schema";

class PaymentRoute extends PaymentController {
  public router: Router;

  constructor() {
    super();
    this.router = Router();
    this.routes();
  }

  private routes(): void {
    this.router.post(
      "/checkout",
      jwtAuthMiddleware.validateToken,
      validationMiddleware.validate(new PaymentCheckoutSchema()),
      this.checkout
    );
    this.router.post(
      "/webhook",
      validationMiddleware.validate(new PaymentWebhookSchema()),
      this.webhook
    );
  }
}

export default new PaymentRoute().router;
