import { NextFunction, Request, Response } from "express";
import applicationService from "../services/application.service";
import serverConfig from "../config/server.config";
import { v4 as uuidv4 } from "uuid";

export default class ApplicationController {
  protected async createApplication(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name } = req.body;
      const apiKey = uuidv4().replace(/-/g, "").slice(0, 32);
      const application = await applicationService.createApplication({
        name,
        isActive: true,
        apiKey,
      });
      res.status(201).json({
        message: "Application created successfully",
        data: application,
      });
    } catch (error) {
      serverConfig.DEBUG(`Error creating application: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async getApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const applications = await applicationService.getApplications();
      res.status(200).json({
        message: "Applications fetched successfully",
        data: applications,
      });
    } catch (error) {
      serverConfig.DEBUG(`Error fetching applications: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async getApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const application = await applicationService.getApplicationById(Number(id));
      res.status(200).json({
        message: "Application fetched successfully",
        data: application,
      });
    } catch (error) {
      serverConfig.DEBUG(`Error fetching application: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async updateApplication(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const application = await applicationService.updateApplication(Number(id), { name });
      res.status(200).json({
        message: "Application updated successfully",
        data: application,
      });
    } catch (error) {
      serverConfig.DEBUG(`Error updating application: ${JSON.stringify(error)}`);
      next(error);
    }
  }

  protected async deleteApplication(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      await applicationService.deleteApplication(Number(id));
      res.status(200).json({
        message: "Application deleted successfully",
      });
    } catch (error) {
      serverConfig.DEBUG(`Error deleting application: ${JSON.stringify(error)}`);
      next(error);
    }
  }
}
