import { NextFunction, Request, Response } from "express";
import serverConfig from "../config/server.config";
import paymentService from "../services/payment.service";
import type { AuthenticatedUserRequest } from "../types";

export default class PaymentController {
  protected async checkout(
    req: AuthenticatedUserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.userId) throw new Error("Missing user");
      const payments = await paymentService.checkout(req.userId, req.body.orderId);
      res.status(200).json({ message: "Checkout processed", data: payments });
    } catch (error) {
      serverConfig.DEBUG(`payment checkout: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async webhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await paymentService.webhook(req.body);
      res.status(200).json({ message: "Webhook received", data: result });
    } catch (error) {
      serverConfig.DEBUG(`payment webhook: ${JSON.stringify(error)}`);
      next(error);
    }
  }
}
