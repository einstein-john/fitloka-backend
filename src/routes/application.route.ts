import { Router } from "express";
import ApplicationController from "../controllers/application.controller";

class ApplicationRoute extends ApplicationController {
  public router: Router;

  constructor() {
    super();
    this.router = Router();
    this.routes();
  }

  private routes(): void {
    this.router.post("/", this.createApplication);
    this.router.get("/", this.getApplications);
    this.router.get("/:id", this.getApplication);
    this.router.put("/:id", this.updateApplication);
    this.router.delete("/:id", this.deleteApplication);
  }
}

export default new ApplicationRoute().router;
