import { Router, Request, Response, NextFunction } from "express";
import ProductController from "../controllers/product.controller";
import validationMiddleware from "../middlewares/validation.middleware";
import adminMiddleware from "../middlewares/admin.middleware";
import uploadMiddleware from "../middlewares/upload.middleware";
import {
  ProductAttachImageSchema,
  ProductCreateSchema,
  ProductIdSchema,
  ProductImageParamsSchema,
  ProductUpdateSchema,
} from "../schemas";
import { ApiValidationErrorResponse } from "../types";

class ProductRoute extends ProductController {
  public router: Router;
  private idSchema: ProductIdSchema;
  private imageParamsSchema: ProductImageParamsSchema;

  constructor() {
    super();
    this.router = Router();
    this.idSchema = new ProductIdSchema();
    this.imageParamsSchema = new ProductImageParamsSchema();
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

  private validateImageParams = (
    req: Request,
    res: Response<ApiValidationErrorResponse>,
    next: NextFunction
  ): void => {
    const { error } = this.imageParamsSchema.validateParams(req);
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
    this.router.get("/", this.list);
    this.router.get("/:id", this.validateId, this.getById);
    this.router.post(
      "/",
      adminMiddleware.requireAdmin,
      validationMiddleware.validate(new ProductCreateSchema()),
      this.create
    );
    this.router.post(
      "/:id/images/upload",
      adminMiddleware.requireAdmin,
      this.validateId,
      uploadMiddleware.parseProductImage,
      this.uploadProductImage
    );
    this.router.post(
      "/:id/images",
      adminMiddleware.requireAdmin,
      this.validateId,
      validationMiddleware.validate(new ProductAttachImageSchema()),
      this.attachImage
    );
    this.router.delete(
      "/:id/images/:productImageId",
      adminMiddleware.requireAdmin,
      this.validateImageParams,
      this.removeImage
    );
    this.router.put(
      "/:id",
      adminMiddleware.requireAdmin,
      this.validateId,
      validationMiddleware.validate(new ProductUpdateSchema()),
      this.update
    );
    this.router.delete("/:id", adminMiddleware.requireAdmin, this.validateId, this.remove);
  }
}

export default new ProductRoute().router;
