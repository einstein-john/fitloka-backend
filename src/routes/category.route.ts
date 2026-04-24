import { Router, Request, Response, NextFunction } from "express";
import CategoryController from "../controllers/category.controller";
import validationMiddleware from "../middlewares/validation.middleware";
import adminMiddleware from "../middlewares/admin.middleware";
import {
  CatalogCategoryCreateSchema,
  CatalogCategoryIdSchema,
  CatalogCategoryUpdateSchema,
} from "../schemas/catalog.schema";
import { ApiValidationErrorResponse } from "../types";

class CategoryRoute extends CategoryController {
  public router: Router;
  private idSchema: CatalogCategoryIdSchema;
  private createSchema: CatalogCategoryCreateSchema;
  private updateSchema: CatalogCategoryUpdateSchema;

  constructor() {
    super();
    this.router = Router();
    this.idSchema = new CatalogCategoryIdSchema();
    this.createSchema = new CatalogCategoryCreateSchema();
    this.updateSchema = new CatalogCategoryUpdateSchema();
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
    this.router.get("/", this.list);
    this.router.get("/:id", this.validateId, this.getById);
    this.router.post(
      "/",
      adminMiddleware.requireAdmin,
      validationMiddleware.validate(this.createSchema),
      this.create
    );
    this.router.put(
      "/:id",
      adminMiddleware.requireAdmin,
      this.validateId,
      validationMiddleware.validate(this.updateSchema),
      this.update
    );
    this.router.delete("/:id", adminMiddleware.requireAdmin, this.validateId, this.remove);
  }
}

export default new CategoryRoute().router;
