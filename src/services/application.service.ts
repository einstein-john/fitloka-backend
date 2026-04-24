import BaseService from "./index";
import Application, { ApplicationInstance } from "../database/models/Application";
import { ApplicationAttributes } from "../types/application.interface";

class ApplicationService extends BaseService<ApplicationInstance> {
  constructor() {
    super(Application, "Application");
  }

  public async createApplication(
    application: Omit<ApplicationAttributes, "id" | "createdAt" | "updatedAt" | "deletedAt">
  ): Promise<ApplicationInstance> {
    return this.baseModel.create(application);
  }

  public async getApplications(): Promise<ApplicationInstance[]> {
    return this.baseModel.findAll({
      where: { isActive: true, deletedAt: null },
    });
  }

  public async getApplicationByApiKey(apiKey: string): Promise<ApplicationInstance> {
    return this.baseModel.findOne({ where: { apiKey } });
  }

  public async getApplicationById(id: number): Promise<ApplicationInstance> {
    return this.baseModel.findByPk(id);
  }

  public async updateApplication(id: number, application: Partial<ApplicationAttributes>) {
    return this.baseModel.update(application, { where: { id } });
  }

  public async deleteApplication(id: number): Promise<number> {
    return this.baseModel.destroy({ where: { id } });
  }
}

export default new ApplicationService();
