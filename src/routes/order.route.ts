import { Router, Request, Response, NextFunction } from "express";
import OrderController from "../controllers/order.controller";
import { OrderIdSchema } from "../schemas/order.schema";
import { ApiValidationErrorResponse } from "../types";

class OrderRoute extends OrderController {
  public router: Router;
  private idSchema: OrderIdSchema;

  constructor() {
    super();
    this.router = Router();
    this.idSchema = new OrderIdSchema();
    this.routes();
  }

  private validateId = (
    req: Request,
    res: Response<ApiValidationErrorResponse>,
    next: NextFunction
  ): void => {
    const { error } = this.idSchema.validateParams(req);
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
    this.router.post("/", this.create);
    this.router.get("/", this.list);
    this.router.get("/:id", this.validateId, this.getById);
  }
}

export default new OrderRoute().router;
