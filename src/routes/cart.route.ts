import { Router, Request, Response, NextFunction } from "express";
import CartController from "../controllers/cart.controller";
import validationMiddleware from "../middlewares/validation.middleware";
import {
  CartAddItemSchema,
  CartItemIdSchema,
  CartItemQuantitySchema,
} from "../schemas/cart.schema";
import { ApiValidationErrorResponse } from "../types";

class CartRoute extends CartController {
  public router: Router;
  private itemIdSchema: CartItemIdSchema;

  constructor() {
    super();
    this.router = Router();
    this.itemIdSchema = new CartItemIdSchema();
    this.routes();
  }

  private validateItemId = (
    req: Request,
    res: Response<ApiValidationErrorResponse>,
    next: NextFunction
  ): void => {
    const { error } = this.itemIdSchema.validateParams(req);
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
    this.router.get("/", this.getCart);
    this.router.post("/", validationMiddleware.validate(new CartAddItemSchema()), this.addItem);
    this.router.patch(
      "/items/:itemId",
      this.validateItemId,
      validationMiddleware.validate(new CartItemQuantitySchema()),
      this.updateItem
    );
    this.router.delete("/items/:itemId", this.validateItemId, this.removeItem);
  }
}

export default new CartRoute().router;
