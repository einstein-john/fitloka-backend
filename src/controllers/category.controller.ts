import { NextFunction, Response } from "express";
import serverConfig from "../config/server.config";
import categoryService from "../services/category.service";
import type { AuthenticatedUserRequest } from "../types";

export default class CategoryController {
  protected async list(
    req: AuthenticatedUserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const search = typeof req.query.search === "string" ? req.query.search : undefined;
      const rows = await categoryService.list(search);
      res.status(200).json({ message: "Categories fetched", data: rows });
    } catch (error) {
      serverConfig.DEBUG(`categories list: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async getById(
    req: AuthenticatedUserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const row = await categoryService.getById(Number(req.params.id));
      res.status(200).json({ message: "Category fetched", data: row });
    } catch (error) {
      serverConfig.DEBUG(`category get: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async create(
    req: AuthenticatedUserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const row = await categoryService.create(req.body);
      res.status(201).json({ message: "Category created", data: row });
    } catch (error) {
      serverConfig.DEBUG(`category create: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async update(
    req: AuthenticatedUserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const row = await categoryService.update(Number(req.params.id), req.body);
      res.status(200).json({ message: "Category updated", data: row });
    } catch (error) {
      serverConfig.DEBUG(`category update: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async remove(
    req: AuthenticatedUserRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await categoryService.delete(Number(req.params.id));
      res.status(200).json({ message: "Category deleted", data: {} });
    } catch (error) {
      serverConfig.DEBUG(`category delete: ${JSON.stringify(error)}`);
      next(error);
    }
  }
}
