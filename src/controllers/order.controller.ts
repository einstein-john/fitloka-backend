import { NextFunction, Response } from "express";
import serverConfig from "../config/server.config";
import orderService from "../services/order.service";
import type { AuthenticatedUserRequest } from "../types";
import type { ReqQueryOptions } from "../types/general.interface";

export default class OrderController {
  protected async create(
    req: AuthenticatedUserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.userId) throw new Error("Missing user");
      const order = await orderService.createFromCart(req.userId);
      res.status(201).json({ message: "Order created", data: order });
    } catch (error) {
      serverConfig.DEBUG(`order create: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async list(
    req: AuthenticatedUserRequest & { queryOpts?: ReqQueryOptions },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.userId) throw new Error("Missing user");
      const q = req.queryOpts ?? { page: 1, limit: 10, offset: 0 };
      const { rows, count } = await orderService.list(req.userId, q.limit, q.offset);
      res.status(200).json({
        message: "Orders fetched",
        data: { items: rows, total: count, page: q.page, limit: q.limit },
      });
    } catch (error) {
      serverConfig.DEBUG(`order list: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async getById(
    req: AuthenticatedUserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.userId) throw new Error("Missing user");
      const order = await orderService.getById(Number(req.params.id), req.userId);
      res.status(200).json({ message: "Order fetched", data: order });
    } catch (error) {
      serverConfig.DEBUG(`order get: ${JSON.stringify(error)}`);
      next(error);
    }
  }
}
