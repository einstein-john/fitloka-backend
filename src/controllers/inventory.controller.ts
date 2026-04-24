import { NextFunction, Response } from "express";
import serverConfig from "../config/server.config";
import inventoryService from "../services/inventory.service";
import type { AuthenticatedUserRequest } from "../types";

export default class InventoryController {
  protected async getByProduct(
    req: AuthenticatedUserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const row = await inventoryService.getByProductId(Number(req.params.productId));
      res.status(200).json({ message: "Inventory fetched", data: row });
    } catch (error) {
      serverConfig.DEBUG(`inventory get: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async patchStock(
    req: AuthenticatedUserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const row = await inventoryService.setStock(Number(req.params.productId), req.body.stock);
      res.status(200).json({ message: "Inventory updated", data: row });
    } catch (error) {
      serverConfig.DEBUG(`inventory patch: ${JSON.stringify(error)}`);
      next(error);
    }
  }
}
