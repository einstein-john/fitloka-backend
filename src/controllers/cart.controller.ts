import { NextFunction, Response } from "express";
import serverConfig from "../config/server.config";
import cartService from "../services/cart.service";
import type { AuthenticatedUserRequest } from "../types";

export default class CartController {
  protected async getCart(
    req: AuthenticatedUserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.userId) throw new Error("Missing user");
      const cart = await cartService.getMyCart(req.userId);
      res.status(200).json({ message: "Cart fetched", data: cart });
    } catch (error) {
      serverConfig.DEBUG(`cart get: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async addItem(
    req: AuthenticatedUserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.userId) throw new Error("Missing user");
      await cartService.addItem(req.userId, req.body.productId, req.body.quantity ?? 1);
      const cart = await cartService.getMyCart(req.userId);
      res.status(201).json({ message: "Item added to cart", data: cart });
    } catch (error) {
      serverConfig.DEBUG(`cart add: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async updateItem(
    req: AuthenticatedUserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.userId) throw new Error("Missing user");
      const cart = await cartService.updateItem(
        req.userId,
        Number(req.params.itemId),
        req.body.quantity
      );
      res.status(200).json({ message: "Cart updated", data: cart });
    } catch (error) {
      serverConfig.DEBUG(`cart update item: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async removeItem(
    req: AuthenticatedUserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.userId) throw new Error("Missing user");
      const cart = await cartService.removeItem(req.userId, Number(req.params.itemId));
      res.status(200).json({ message: "Item removed", data: cart });
    } catch (error) {
      serverConfig.DEBUG(`cart remove item: ${JSON.stringify(error)}`);
      next(error);
    }
  }
}
