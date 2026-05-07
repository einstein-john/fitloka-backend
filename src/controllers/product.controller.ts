import { NextFunction, Response } from "express";
import serverConfig from "../config/server.config";
import productService from "../services/product.service";
import cloudinaryService from "../services/cloudinary.service";
import type { AuthenticatedUserRequest } from "../types";
import type { ReqQueryOptions } from "../types/general.interface";

function parseMultipartImageOptions(body: Record<string, unknown>): {
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
} {
  const altRaw = body.altText;
  const altText =
    typeof altRaw === "string" && altRaw.trim().length > 0 ? altRaw.trim() : null;
  let sortOrder = 0;
  if (body.sortOrder != null && body.sortOrder !== "") {
    const n = Number(body.sortOrder);
    if (Number.isFinite(n) && n >= 0) sortOrder = Math.floor(n);
  }
  const p = body.isPrimary;
  const isPrimary = p === true || p === "true" || p === "1" || p === 1;
  return { altText, sortOrder, isPrimary };
}

export default class ProductController {
  protected async list(
    req: AuthenticatedUserRequest & { queryOpts?: ReqQueryOptions },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const q = req.queryOpts ?? { page: 1, limit: 10, offset: 0, search: undefined };
      const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
      const { rows, count } = await productService.list({
        ...q,
        categoryId: Number.isFinite(categoryId as number) ? categoryId : undefined,
      });
      res.status(200).json({
        message: "Products fetched",
        data: { items: rows, total: count, page: q.page, limit: q.limit },
      });
    } catch (error) {
      serverConfig.DEBUG(`products list: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async getById(
    req: AuthenticatedUserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const row = await productService.getById(Number(req.params.id));
      res.status(200).json({ message: "Product fetched", data: row });
    } catch (error) {
      serverConfig.DEBUG(`product get: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async create(
    req: AuthenticatedUserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const row = await productService.create(req.body);
      res.status(201).json({ message: "Product created", data: row });
    } catch (error) {
      serverConfig.DEBUG(`product create: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async update(
    req: AuthenticatedUserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const row = await productService.update(Number(req.params.id), req.body);
      res.status(200).json({ message: "Product updated", data: row });
    } catch (error) {
      serverConfig.DEBUG(`product update: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async remove(
    req: AuthenticatedUserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await productService.delete(Number(req.params.id));
      res.status(200).json({ message: "Product deleted", data: {} });
    } catch (error) {
      serverConfig.DEBUG(`product delete: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async attachImage(
    req: AuthenticatedUserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const row = await productService.attachImage(Number(req.params.id), req.body);
      res.status(201).json({ message: "Image linked to product", data: row });
    } catch (error) {
      serverConfig.DEBUG(`product attach image: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async uploadProductImage(
    req: AuthenticatedUserRequest & { file?: Express.Multer.File },
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const file = req.file;
      if (!file?.buffer?.length) {
        res.status(400).json({ message: "Image file is required", data: {} });
        return;
      }
      const { secureUrl } = await cloudinaryService.uploadImageBuffer(
        file.buffer,
        serverConfig.CLOUDINARY.FOLDER_PRODUCTS
      );
      const opts = parseMultipartImageOptions(req.body as Record<string, unknown>);
      const row = await productService.attachImage(Number(req.params.id), {
        url: secureUrl,
        altText: opts.altText,
        sortOrder: opts.sortOrder,
        isPrimary: opts.isPrimary,
      });
      res.status(201).json({ message: "Image uploaded and linked to product", data: row });
    } catch (error) {
      serverConfig.DEBUG(`product upload image: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async removeImage(
    req: AuthenticatedUserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const row = await productService.removeImage(
        Number(req.params.id),
        Number(req.params.productImageId)
      );
      res.status(200).json({ message: "Image unlinked from product", data: row });
    } catch (error) {
      serverConfig.DEBUG(`product remove image: ${JSON.stringify(error)}`);
      next(error);
    }
  }
}
