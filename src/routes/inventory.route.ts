import { Router, Request, Response, NextFunction } from "express";
import InventoryController from "../controllers/inventory.controller";
import validationMiddleware from "../middlewares/validation.middleware";
import adminMiddleware from "../middlewares/admin.middleware";
import { InventoryProductIdSchema, InventoryUpdateSchema } from "../schemas/inventory.schema";
import { ApiValidationErrorResponse } from "../types";

class InventoryRoute extends InventoryController {
  public router: Router;
  private productIdSchema: InventoryProductIdSchema;

  constructor() {
    super();
    this.router = Router();
    this.productIdSchema = new InventoryProductIdSchema();
    this.routes();
  }

  private validateProductId = (
    req: Request,
    res: Response<ApiValidationErrorResponse>,
    next: NextFunction
  ): void => {
    const { error } = this.productIdSchema.validateParams(req);
    if (error) {
      res.status(400).json({
        message: "Validation error.",
        data: {
          error: error.details.map((d) => ({ field: d.path.join("."), message: d.message })),
        },
      });
      return;
    }
    next();
  };

  private routes(): void {
    this.router.get("/:productId", this.validateProductId, this.getByProduct);
    this.router.patch(
      "/:productId",
      adminMiddleware.requireAdmin,
      this.validateProductId,
      validationMiddleware.validate(new InventoryUpdateSchema()),
      this.patchStock
    );
  }
}

export default new InventoryRoute().router;
